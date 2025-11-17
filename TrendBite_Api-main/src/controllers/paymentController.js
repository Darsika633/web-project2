import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// ==================== ADMIN CONTROLLERS ====================

// Get all COD payments with filtering and pagination (Admin only)
export const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      collectionStatus,
      deliveryPersonId,
      isOutstanding,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filters = {};
    
    if (status) filters.status = status;
    if (collectionStatus) filters.collectionStatus = collectionStatus;
    if (deliveryPersonId) filters.deliveryPerson = deliveryPersonId;
    if (isOutstanding !== undefined) filters.isOutstanding = isOutstanding === 'true';
    
    // Date range filter
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build aggregation pipeline
    const pipeline = [
      { $match: filters },
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'orderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'deliveryPerson',
          foreignField: '_id',
          as: 'deliveryPersonDetails'
        }
      },
      {
        $addFields: {
          orderNumber: { $arrayElemAt: ['$orderDetails.orderNumber', 0] },
          customerName: {
            $concat: [
              { $arrayElemAt: ['$customerDetails.firstName', 0] },
              ' ',
              { $arrayElemAt: ['$customerDetails.lastName', 0] }
            ]
          },
          deliveryPersonName: {
            $concat: [
              { $arrayElemAt: ['$deliveryPersonDetails.firstName', 0] },
              ' ',
              { $arrayElemAt: ['$deliveryPersonDetails.lastName', 0] }
            ]
          }
        }
      }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { orderNumber: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { deliveryPersonName: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute aggregation
    const payments = await Payment.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline.slice(0, -3)]; // Remove sort, skip, limit
    countPipeline.push({ $count: 'total' });
    const totalResult = await Payment.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: 'Payments retrieved successfully',
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPayments: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment by ID (Admin only)
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('order', 'orderNumber status items subtotal totalAmount deliveryAddress')
      .populate('customer', 'firstName lastName email phone')
      .populate('deliveryPerson', 'firstName lastName email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment retrieved successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Get payment statistics for admin dashboard
export const getPaymentStatistics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateRange = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateRange.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateRange.endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateRange.startDate = startOfWeek;
        dateRange.endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateRange.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        dateRange.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        dateRange.startDate = new Date(now.getFullYear(), 0, 1);
        dateRange.endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
    }

    const statistics = await Payment.getPaymentStatistics(dateRange);
    
    // Get outstanding payments count
    const outstandingPayments = await Payment.findOutstandingPayments();
    
    // Get recent payment activities
    const recentPayments = await Payment.find({ collectionTimestamp: { $exists: true } })
      .populate('order', 'orderNumber')
      .populate('customer', 'firstName lastName')
      .populate('deliveryPerson', 'firstName lastName')
      .sort({ collectionTimestamp: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: {
        statistics: {
          ...statistics,
          outstandingCount: outstandingPayments.length,
          collectionRate: statistics.totalPayments > 0 
            ? ((statistics.completedPayments / statistics.totalPayments) * 100).toFixed(2)
            : 0
        },
        recentActivities: recentPayments,
        period
      }
    });

  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

// Mark payment as received/collected (Admin only)
export const markPaymentAsReceived = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (amount && amount > 0) {
      payment.collectedAmount = amount;
      payment.collectionTimestamp = new Date();
      payment.collectionNotes = notes || '';
      
      if (payment.collectedAmount >= payment.expectedAmount) {
        payment.status = 'completed';
        payment.collectionStatus = 'collected';
        payment.isOutstanding = false;
      } else if (payment.collectedAmount > 0) {
        payment.status = 'partial';
        payment.collectionStatus = 'partial_collected';
      }
    }

    await payment.save();

    // Populate the updated payment
    await payment.populate([
      { path: 'order', select: 'orderNumber status' },
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'deliveryPerson', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment marked as received successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Error marking payment as received:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark payment as received',
      error: error.message
    });
  }
};

// Update payment details (Admin only)
export const updatePaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminNotes, collectionIssues, issueDescription } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (adminNotes !== undefined) payment.adminNotes = adminNotes;
    if (collectionIssues) payment.collectionIssues = collectionIssues;
    if (issueDescription !== undefined) payment.issueDescription = issueDescription;

    await payment.save();

    // Populate the updated payment
    await payment.populate([
      { path: 'order', select: 'orderNumber status' },
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'deliveryPerson', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment details updated successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Error updating payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment details',
      error: error.message
    });
  }
};

// Generate payment reports (Admin only)
export const generatePaymentReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      deliveryPersonId,
      status,
      reportType = 'summary' // summary, detailed, outstanding
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    // Build match filters
    const matchFilters = {
      createdAt: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      }
    };

    if (deliveryPersonId) matchFilters.deliveryPerson = deliveryPersonId;
    if (status) matchFilters.status = status;

    let reportData;

    switch (reportType) {
      case 'summary':
        reportData = await Payment.getPaymentStatistics(dateRange);
        break;
      
      case 'detailed':
        reportData = await Payment.find(matchFilters)
          .populate('order', 'orderNumber status totalAmount')
          .populate('customer', 'firstName lastName email')
          .populate('deliveryPerson', 'firstName lastName')
          .sort({ createdAt: -1 });
        break;
      
      case 'outstanding':
        matchFilters.isOutstanding = true;
        reportData = await Payment.find(matchFilters)
          .populate('order', 'orderNumber status totalAmount')
          .populate('customer', 'firstName lastName email')
          .populate('deliveryPerson', 'firstName lastName')
          .sort({ createdAt: -1 });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Must be summary, detailed, or outstanding'
        });
    }

    res.status(200).json({
      success: true,
      message: 'Payment report generated successfully',
      data: {
        reportType,
        dateRange,
        filters: { deliveryPersonId, status },
        report: reportData
      }
    });

  } catch (error) {
    console.error('Error generating payment report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment report',
      error: error.message
    });
  }
};

// ==================== DELIVERY PERSON CONTROLLERS ====================

// Get payments assigned to delivery person
export const getDeliveryPersonPayments = async (req, res) => {
  try {
    const deliveryPersonId = req.user.id;
    const { status, isOutstanding } = req.query;

    const filters = { deliveryPerson: deliveryPersonId };
    if (status) filters.status = status;
    if (isOutstanding !== undefined) filters.isOutstanding = isOutstanding === 'true';

    const payments = await Payment.find(filters)
      .populate('order', 'orderNumber status deliveryAddress totalAmount')
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Assigned payments retrieved successfully',
      data: { payments }
    });

  } catch (error) {
    console.error('Error fetching delivery person payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned payments',
      error: error.message
    });
  }
};

// Collect payment during delivery
export const collectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, notes } = req.body;
    const deliveryPersonId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if delivery person is assigned to this payment
    if (payment.deliveryPerson && payment.deliveryPerson.toString() !== deliveryPersonId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to collect this payment'
      });
    }

    // Collect payment
    await payment.collectPayment(amount, deliveryPersonId, notes);

    // Populate the updated payment
    await payment.populate([
      { path: 'order', select: 'orderNumber status' },
      { path: 'customer', select: 'firstName lastName email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment collected successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Error collecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to collect payment',
      error: error.message
    });
  }
};

// Report collection issue
export const reportCollectionIssue = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { issues, description } = req.body;
    const deliveryPersonId = req.user.id;

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Collection issues are required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Report the issue
    await payment.reportCollectionIssue(issues, description, deliveryPersonId);

    // Populate the updated payment
    await payment.populate([
      { path: 'order', select: 'orderNumber status' },
      { path: 'customer', select: 'firstName lastName email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Collection issue reported successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Error reporting collection issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report collection issue',
      error: error.message
    });
  }
};

// ==================== UTILITY FUNCTIONS ====================

// Create payment record when order is created (called from order controller)
export const createPaymentRecord = async (orderId, customerId, totalAmount) => {
  try {
    const payment = new Payment({
      order: orderId,
      customer: customerId,
      expectedAmount: totalAmount,
      method: 'cash_on_delivery',
      status: 'pending'
    });

    await payment.save();
    return payment;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
};

// Assign delivery person to payment
export const assignDeliveryPersonToPayment = async (orderId, deliveryPersonId) => {
  try {
    const payment = await Payment.findOne({ order: orderId });
    if (payment) {
      payment.deliveryPerson = deliveryPersonId;
      await payment.save();
    }
    return payment;
  } catch (error) {
    console.error('Error assigning delivery person to payment:', error);
    throw error;
  }
};

