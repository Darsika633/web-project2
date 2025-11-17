import Order from '../models/Order.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// Assign delivery person to order (Admin only)
export const assignDeliveryPerson = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;
    const adminId = req.user.id;

    // Validate delivery person ID
    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery person ID is required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be assigned (must be confirmed)
    if (order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be confirmed before assigning delivery person'
      });
    }

    // Find and validate delivery person
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found'
      });
    }

    if (deliveryPerson.role !== 'deliveryperson') {
      return res.status(400).json({
        success: false,
        message: 'User is not a delivery person'
      });
    }

    // Check if delivery person is active
    if (!deliveryPerson.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Delivery person is not active'
      });
    }

    // Assign delivery person
    order.deliveryPerson = deliveryPersonId;
    order.assignedAt = new Date();
    order.status = 'assigned';
    
    // Add to status history
    order.statusHistory.push({
      status: 'assigned',
      changedAt: new Date(),
      changedBy: adminId,
      notes: `Assigned to delivery person: ${deliveryPerson.firstName} ${deliveryPerson.lastName}`
    });

    await order.save();

    // Assign delivery person to payment record if it exists (for COD orders)
    if (order.paymentRecord) {
      await Payment.findByIdAndUpdate(order.paymentRecord, {
        deliveryPerson: deliveryPersonId
      });
    }

    // Populate the updated order
    await order.populate([
      { path: 'customer', select: 'firstName lastName email phone address' },
      { path: 'deliveryPerson', select: 'firstName lastName email phone' },
      { path: 'items.product', select: 'name brand images' },
      { path: 'statusHistory.changedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Delivery person assigned successfully',
      data: order
    });

  } catch (error) {
    console.error('Error assigning delivery person:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign delivery person',
      error: error.message
    });
  }
};

// Get all delivery persons (Admin only)
export const getAllDeliveryPersons = async (req, res) => {
  try {
    const {
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { role: 'deliveryperson' };

    // Active filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search filter
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const deliveryPersons = await User.find(query)
      .select('-password -__v')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get delivery statistics for each delivery person
    const deliveryPersonsWithStats = await Promise.all(
      deliveryPersons.map(async (person) => {
        const stats = await Order.aggregate([
          { $match: { deliveryPerson: person._id } },
          {
            $group: {
              _id: null,
              totalAssigned: { $sum: 1 },
              totalDelivered: {
                $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
              },
              totalCompleted: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              averageDeliveryTime: {
                $avg: {
                  $cond: [
                    { $and: [{ $ne: ['$assignedAt', null] }, { $ne: ['$shipping.actualDeliveryDate', null] }] },
                    { $subtract: ['$shipping.actualDeliveryDate', '$assignedAt'] },
                    null
                  ]
                }
              }
            }
          }
        ]);

        return {
          ...person,
          stats: stats[0] || {
            totalAssigned: 0,
            totalDelivered: 0,
            totalCompleted: 0,
            averageDeliveryTime: null
          }
        };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Delivery persons retrieved successfully',
      data: deliveryPersonsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDeliveryPersons: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching delivery persons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery persons',
      error: error.message
    });
  }
};

// Get orders assigned to a delivery person
export const getDeliveryPersonOrders = async (req, res) => {
  try {
    const deliveryPersonId = req.user.id;
    const {
      status,
      dateFrom,
      dateTo,
      sortBy = 'assignedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { deliveryPerson: deliveryPersonId };

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.assignedAt = {};
      if (dateFrom) query.assignedAt.$gte = new Date(dateFrom);
      if (dateTo) query.assignedAt.$lte = new Date(dateTo);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email phone address')
      .populate('items.product', 'name brand images')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Delivery orders retrieved successfully',
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery orders',
      error: error.message
    });
  }
};

// Update order status (Delivery person only)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, estimatedDeliveryTime, deliveryNotes } = req.body;
    const deliveryPersonId = req.user.id;

    const validStatuses = ['assigned', 'out_for_delivery', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery status'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is assigned to this delivery person
    if (order.deliveryPerson.toString() !== deliveryPersonId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order is not assigned to you.'
      });
    }

    // Validate status transition
    const currentStatus = order.status;
    const validTransitions = {
      'assigned': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [] // Final status
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Update order status
    order.status = status;
    
    // Update delivery-specific fields
    if (estimatedDeliveryTime) {
      order.shipping.deliveryPersonEstimatedTime = new Date(estimatedDeliveryTime);
    }
    
    if (deliveryNotes) {
      order.shipping.deliveryNotes = deliveryNotes;
    }

    // Set actual delivery date if status is delivered
    if (status === 'delivered') {
      order.shipping.actualDeliveryDate = new Date();
    }

    // Add to status history
    order.statusHistory.push({
      status: status,
      changedAt: new Date(),
      changedBy: deliveryPersonId,
      notes: deliveryNotes || `Status updated to ${status} by delivery person`
    });

    await order.save();

    // Update delivery person's total deliveries count when order is delivered
    if (status === 'delivered') {
      const deliveryPerson = await User.findById(deliveryPersonId);
      if (deliveryPerson && deliveryPerson.role === 'deliveryperson') {
        deliveryPerson.deliveryStats.totalDeliveries = (deliveryPerson.deliveryStats.totalDeliveries || 0) + 1;
        await deliveryPerson.save();
      }
    }

    // Populate the updated order
    await order.populate([
      { path: 'customer', select: 'firstName lastName email phone address' },
      { path: 'deliveryPerson', select: 'firstName lastName email phone' },
      { path: 'items.product', select: 'name brand images' },
      { path: 'statusHistory.changedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
};

// Reassign order to different delivery person (Admin only)
export const reassignDeliveryPerson = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;
    const adminId = req.user.id;

    // Validate delivery person ID
    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery person ID is required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is assigned to a delivery person
    if (!order.deliveryPerson) {
      return res.status(400).json({
        success: false,
        message: 'Order is not assigned to any delivery person'
      });
    }

    // Find and validate new delivery person
    const newDeliveryPerson = await User.findById(deliveryPersonId);
    if (!newDeliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found'
      });
    }

    if (newDeliveryPerson.role !== 'deliveryperson') {
      return res.status(400).json({
        success: false,
        message: 'User is not a delivery person'
      });
    }

    if (!newDeliveryPerson.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Delivery person is not active'
      });
    }

    // Get old delivery person info for history
    const oldDeliveryPerson = await User.findById(order.deliveryPerson);

    // Reassign delivery person
    order.deliveryPerson = deliveryPersonId;
    order.assignedAt = new Date();
    
    // Add to status history
    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      changedBy: adminId,
      notes: `Reassigned from ${oldDeliveryPerson?.firstName} ${oldDeliveryPerson?.lastName} to ${newDeliveryPerson.firstName} ${newDeliveryPerson.lastName}`
    });

    await order.save();

    // Populate the updated order
    await order.populate([
      { path: 'customer', select: 'firstName lastName email phone address' },
      { path: 'deliveryPerson', select: 'firstName lastName email phone' },
      { path: 'items.product', select: 'name brand images' },
      { path: 'statusHistory.changedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Order reassigned successfully',
      data: order
    });

  } catch (error) {
    console.error('Error reassigning delivery person:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reassign delivery person',
      error: error.message
    });
  }
};

// Get delivery statistics (Admin only)
export const getDeliveryStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const matchStage = {};
    if (dateFrom || dateTo) {
      matchStage.assignedAt = {};
      if (dateFrom) matchStage.assignedAt.$gte = new Date(dateFrom);
      if (dateTo) matchStage.assignedAt.$lte = new Date(dateTo);
    }

    // Overall delivery statistics
    const overallStats = await Order.aggregate([
      { $match: { ...matchStage, deliveryPerson: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageDeliveryTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$assignedAt', null] }, { $ne: ['$shipping.actualDeliveryDate', null] }] },
                { $subtract: ['$shipping.actualDeliveryDate', '$assignedAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    // Delivery person performance
    const deliveryPersonStats = await Order.aggregate([
      { $match: { ...matchStage, deliveryPerson: { $ne: null } } },
      {
        $group: {
          _id: '$deliveryPerson',
          totalAssigned: { $sum: 1 },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageDeliveryTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$assignedAt', null] }, { $ne: ['$shipping.actualDeliveryDate', null] }] },
                { $subtract: ['$shipping.actualDeliveryDate', '$assignedAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'deliveryPerson'
        }
      },
      { $unwind: '$deliveryPerson' },
      {
        $project: {
          _id: 1,
          deliveryPersonName: { $concat: ['$deliveryPerson.firstName', ' ', '$deliveryPerson.lastName'] },
          totalAssigned: 1,
          totalDelivered: 1,
          totalCompleted: 1,
          averageDeliveryTime: 1,
          deliveryRate: {
            $cond: [
              { $gt: ['$totalAssigned', 0] },
              { $multiply: [{ $divide: ['$totalDelivered', '$totalAssigned'] }, 100] },
              0
            ]
          },
          averageRating: { 
            $ifNull: ['$deliveryPerson.deliveryStats.averageRating', 0] 
          },
          totalRatings: { 
            $ifNull: ['$deliveryPerson.deliveryStats.totalRatings', 0] 
          },
          totalDeliveriesCount: { 
            $ifNull: ['$deliveryPerson.deliveryStats.totalDeliveries', 0] 
          }
        }
      },
      { $sort: { totalDelivered: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Delivery statistics retrieved successfully',
      data: {
        overall: overallStats[0] || {
          totalAssigned: 0,
          totalDelivered: 0,
          totalCompleted: 0,
          averageDeliveryTime: null
        },
        deliveryPersons: deliveryPersonStats
      }
    });

  } catch (error) {
    console.error('Error fetching delivery statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery statistics',
      error: error.message
    });
  }
};

// Get order details for delivery person
export const getDeliveryOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPersonId = req.user.id;

    const order = await Order.findById(orderId)
      .populate('customer', 'firstName lastName email phone address')
      .populate('deliveryPerson', 'firstName lastName email phone')
      .populate('items.product', 'name brand images')
      .populate('statusHistory.changedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is assigned to this delivery person
    if (order.deliveryPerson._id.toString() !== deliveryPersonId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order is not assigned to you.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully',
      data: order
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

// Delete delivered orders (Admin only)
export const deleteDeliveredOrders = async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      olderThanDays,
      confirmDelete = false 
    } = req.query;

    // Require confirmation for safety
    if (confirmDelete !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'This action requires confirmation. Add confirmDelete=true to the query parameters to proceed.'
      });
    }

    const query = { status: 'delivered' };

    // Build date filter
    if (dateFrom || dateTo) {
      query['shipping.actualDeliveryDate'] = {};
      if (dateFrom) query['shipping.actualDeliveryDate'].$gte = new Date(dateFrom);
      if (dateTo) query['shipping.actualDeliveryDate'].$lte = new Date(dateTo);
    } else if (olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
      query['shipping.actualDeliveryDate'] = { $lt: cutoffDate };
    }

    // Get orders to be deleted for logging
    const ordersToDelete = await Order.find(query)
      .select('orderNumber customer totalAmount shipping.actualDeliveryDate')
      .populate('customer', 'firstName lastName email')
      .lean();

    if (ordersToDelete.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No delivered orders found matching the criteria'
      });
    }

    // Delete the orders
    const deleteResult = await Order.deleteMany(query);

    // Log the deletion for audit purposes
    console.log(`Deleted ${deleteResult.deletedCount} delivered orders:`, {
      deletedBy: req.user.id,
      deletedAt: new Date(),
      orders: ordersToDelete.map(order => ({
        orderNumber: order.orderNumber,
        customer: `${order.customer.firstName} ${order.customer.lastName}`,
        totalAmount: order.totalAmount,
        deliveredAt: order.shipping.actualDeliveryDate
      }))
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} delivered orders`,
      data: {
        deletedCount: deleteResult.deletedCount,
        deletedOrders: ordersToDelete.map(order => ({
          orderNumber: order.orderNumber,
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          totalAmount: order.totalAmount,
          deliveredAt: order.shipping.actualDeliveryDate
        }))
      }
    });

  } catch (error) {
    console.error('Error deleting delivered orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete delivered orders',
      error: error.message
    });
  }
};
