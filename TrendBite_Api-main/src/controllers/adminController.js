import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Inventory from '../models/Inventory.js';
import StockMovement from '../models/StockMovement.js';
import Payment from '../models/Payment.js';

// Get dashboard overview statistics
export const getDashboardOverview = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get total revenue (sum of all completed/delivered orders)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'assigned', 'out_for_delivery'] }
    });

    // Get average order value
    const avgOrderResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);
    const averageOrderValue = avgOrderResult.length > 0 ? avgOrderResult[0].averageOrderValue : 0;

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total reviews
    const totalReviews = await Review.countDocuments();

    // Get COD payment statistics
    const paymentStats = await Payment.getPaymentStatistics();
    const outstandingPayments = await Payment.findOutstandingPayments();

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        pendingOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalCustomers,
        totalProducts,
        totalReviews,
        // COD Payment Statistics
        codPayments: {
          totalPayments: paymentStats.totalPayments,
          totalExpectedAmount: Math.round(paymentStats.totalExpectedAmount * 100) / 100,
          totalCollectedAmount: Math.round(paymentStats.totalCollectedAmount * 100) / 100,
          totalOutstanding: paymentStats.totalOutstanding,
          totalOutstandingAmount: Math.round(paymentStats.totalOutstandingAmount * 100) / 100,
          collectionRate: paymentStats.totalPayments > 0 
            ? Math.round((paymentStats.completedPayments / paymentStats.totalPayments) * 100 * 100) / 100
            : 0,
          outstandingCount: outstandingPayments.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
};

// Get revenue overview for the past 6 months
export const getRevenueOverview = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the data for frontend consumption
    const formattedRevenue = monthlyRevenue.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: Math.round(item.revenue * 100) / 100,
      orderCount: item.orderCount
    }));

    // Fill in missing months with zero values
    const completeRevenueData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existingData = formattedRevenue.find(item => item.month === monthKey);
      completeRevenueData.push({
        month: monthKey,
        revenue: existingData ? existingData.revenue : 0,
        orderCount: existingData ? existingData.orderCount : 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue: completeRevenueData,
        totalRevenue: completeRevenueData.reduce((sum, item) => sum + item.revenue, 0),
        totalOrders: completeRevenueData.reduce((sum, item) => sum + item.orderCount, 0)
      }
    });
  } catch (error) {
    console.error('Error getting revenue overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue overview',
      error: error.message
    });
  }
};

// Get recent activity (recent orders, new customers, reviews)
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name brand images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber customer status totalAmount createdAt items')
      .lean();

    // Get recent customers
    const recentCustomers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('firstName lastName email createdAt')
      .lean();

    // Get recent reviews
    const recentReviews = await Review.find()
      .populate('user', 'firstName lastName')
      .populate('product', 'name brand')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('rating comment user product createdAt')
      .lean();

    // Format recent orders (filter out orders with deleted customers)
    const formattedOrders = recentOrders
      .filter(order => order.customer)
      .map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          email: order.customer.email
        },
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        createdAt: order.createdAt
      }));

    // Format recent customers
    const formattedCustomers = recentCustomers.map(customer => ({
      id: customer._id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      joinedAt: customer.createdAt
    }));

    // Format recent reviews (filter out reviews with deleted users/products)
    const formattedReviews = recentReviews
      .filter(review => review.user && review.product)
      .map(review => ({
        id: review._id,
        user: {
          name: `${review.user.firstName} ${review.user.lastName}`
        },
        product: {
          name: review.product.name,
          brand: review.product.brand
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }));

    res.status(200).json({
      success: true,
      data: {
        recentOrders: formattedOrders,
        recentCustomers: formattedCustomers,
        recentReviews: formattedReviews
      }
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

// Get order statistics by status
export const getOrderStatistics = async (req, res) => {
  try {
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Format the statistics
    const formattedStats = orderStats.map(stat => ({
      status: stat._id,
      count: stat.count,
      totalValue: Math.round(stat.totalValue * 100) / 100
    }));

    res.status(200).json({
      success: true,
      data: {
        orderStatistics: formattedStats,
        totalOrders: orderStats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });
  } catch (error) {
    console.error('Error getting order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

// Get top selling products
export const getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topProducts = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          brand: '$product.brand',
          image: { $arrayElemAt: ['$product.images', 0] },
          price: '$product.price',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topSellingProducts: topProducts
      }
    });
  } catch (error) {
    console.error('Error getting top selling products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top selling products',
      error: error.message
    });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Get new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfMonth }
    });

    // Get customers with orders
    const customersWithOrders = await Order.distinct('customer');

    // Get average orders per customer
    const avgOrdersPerCustomer = totalCustomers > 0 ? 
      (await Order.countDocuments()) / totalCustomers : 0;

    // Get customer registration trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const customerTrend = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        customersWithOrders: customersWithOrders.length,
        averageOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
        customerTrend
      }
    });
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer analytics',
      error: error.message
    });
  }
};

// Get inventory dashboard overview
export const getInventoryDashboard = async (req, res) => {
  try {
    // Get inventory statistics
    const inventoryStats = await Inventory.getInventoryStatistics();

    // Get low stock products (top 10)
    const lowStockResult = await Inventory.getLowStockProducts({ limit: 10 });
    const lowStockProducts = lowStockResult.lowStockProducts;

    // Get recent stock movements (last 20)
    const recentMovements = await StockMovement.find()
      .populate('product', 'name brand')
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20)
      .select('product variant movementType quantity reason createdAt performedBy')
      .lean();

    // Get out of stock products count
    const outOfStockCount = await Inventory.countDocuments({ isOutOfStock: true, isActive: true });

    // Get total inventory value
    const totalValueResult = await Inventory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);
    const totalInventoryValue = totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;

    // Get stock movement summary for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movementSummary = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$movementType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        inventoryStats,
        lowStockProducts,
        recentMovements,
        outOfStockCount,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        movementSummary
      }
    });
  } catch (error) {
    console.error('Error getting inventory dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory dashboard',
      error: error.message
    });
  }
};

// Get inventory alerts
export const getInventoryAlerts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get low stock alerts
    const lowStockAlerts = await Inventory.find({
      isLowStock: true,
      isActive: true
    })
      .populate('product', 'name brand')
      .sort({ currentStock: 1 })
      .limit(parseInt(limit))
      .select('product variant currentStock lowStockThreshold stockPercentage')
      .lean();

    // Get out of stock alerts
    const outOfStockAlerts = await Inventory.find({
      isOutOfStock: true,
      isActive: true
    })
      .populate('product', 'name brand')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('product variant lastSold updatedAt')
      .lean();

    // Get products with no recent movements (potential stale inventory)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleInventory = await Inventory.aggregate([
      {
        $match: {
          isActive: true,
          currentStock: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'stockmovements',
          localField: 'variant',
          foreignField: 'variant',
          as: 'recentMovements',
          pipeline: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo }
              }
            }
          ]
        }
      },
      {
        $match: {
          recentMovements: { $size: 0 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: '$product._id',
          productName: '$product.name',
          brand: '$product.brand',
          variant: 1,
          currentStock: 1,
          lastSold: 1,
          updatedAt: 1
        }
      },
      {
        $sort: { updatedAt: 1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        lowStockAlerts,
        outOfStockAlerts,
        staleInventory,
        summary: {
          lowStockCount: lowStockAlerts.length,
          outOfStockCount: outOfStockAlerts.length,
          staleInventoryCount: staleInventory.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting inventory alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory alerts',
      error: error.message
    });
  }
};

// Get inventory reports
export const getInventoryReports = async (req, res) => {
  try {
    const {
      reportType = 'overview',
      startDate,
      endDate,
      category,
      brand,
      lowStockOnly = false,
      outOfStockOnly = false
    } = req.query;

    let reportData = {};

    switch (reportType) {
      case 'overview':
        reportData = await Inventory.getInventoryOverview({
          category,
          brand,
          lowStockOnly: lowStockOnly === 'true',
          outOfStockOnly: outOfStockOnly === 'true',
          page: 1,
          limit: 1000 // Get all for report
        });
        break;

      case 'movements':
        const movementFilters = {};
        if (startDate || endDate) {
          movementFilters.createdAt = {};
          if (startDate) movementFilters.createdAt.$gte = new Date(startDate);
          if (endDate) movementFilters.createdAt.$lte = new Date(endDate);
        }
        
        reportData = await StockMovement.getInventorySummary(movementFilters);
        break;

      case 'low-stock':
        reportData = await Inventory.getLowStockProducts({
          page: 1,
          limit: 1000 // Get all for report
        });
        break;

      case 'valuation':
        const valuationData = await Inventory.aggregate([
          {
            $match: {
              isActive: true,
              currentStock: { $gt: 0 }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $unwind: '$product'
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'product.category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: '$category'
          },
          {
            $group: {
              _id: {
                category: '$category.name',
                brand: '$product.brand'
              },
              totalValue: { $sum: '$totalValue' },
              totalStock: { $sum: '$currentStock' },
              productCount: { $sum: 1 }
            }
          },
          {
            $sort: { totalValue: -1 }
          }
        ]);

        const totalValuation = await Inventory.aggregate([
          {
            $match: {
              isActive: true,
              currentStock: { $gt: 0 }
            }
          },
          {
            $group: {
              _id: null,
              totalValue: { $sum: '$totalValue' },
              totalStock: { $sum: '$currentStock' }
            }
          }
        ]);

        reportData = {
          categoryBreakdown: valuationData,
          totalValuation: totalValuation.length > 0 ? totalValuation[0] : { totalValue: 0, totalStock: 0 }
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Valid types: overview, movements, low-stock, valuation'
        });
    }

    res.status(200).json({
      success: true,
      data: {
        reportType,
        filters: {
          startDate,
          endDate,
          category,
          brand,
          lowStockOnly,
          outOfStockOnly
        },
        reportData,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting inventory reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory reports',
      error: error.message
    });
  }
};

// Get payment dashboard overview
export const getPaymentDashboard = async (req, res) => {
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

    // Get payment statistics for the period
    const paymentStats = await Payment.getPaymentStatistics(dateRange);
    
    // Get outstanding payments
    const outstandingPayments = await Payment.findOutstandingPayments()
      .populate('order', 'orderNumber status totalAmount deliveryAddress')
      .populate('customer', 'firstName lastName email phone')
      .populate('deliveryPerson', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent payment collections
    const recentCollections = await Payment.find({ 
      collectionTimestamp: { $exists: true },
      collectionTimestamp: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    })
      .populate('order', 'orderNumber')
      .populate('customer', 'firstName lastName')
      .populate('deliveryPerson', 'firstName lastName')
      .sort({ collectionTimestamp: -1 })
      .limit(10);

    // Get payment collection issues
    const collectionIssues = await Payment.find({
      collectionIssues: { $exists: true, $ne: [] },
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    })
      .populate('order', 'orderNumber')
      .populate('customer', 'firstName lastName')
      .populate('deliveryPerson', 'firstName lastName')
      .sort({ lastAttemptDate: -1 })
      .limit(5);

    // Get delivery person performance
    const deliveryPersonStats = await Payment.aggregate([
      {
        $match: {
          deliveryPerson: { $exists: true, $ne: null },
          collectionTimestamp: { $gte: dateRange.startDate, $lte: dateRange.endDate }
        }
      },
      {
        $group: {
          _id: '$deliveryPerson',
          totalAssigned: { $sum: 1 },
          totalCollected: {
            $sum: {
              $cond: [{ $eq: ['$collectionStatus', 'collected'] }, 1, 0]
            }
          },
          totalPartial: {
            $sum: {
              $cond: [{ $eq: ['$collectionStatus', 'partial_collected'] }, 1, 0]
            }
          },
          totalFailed: {
            $sum: {
              $cond: [{ $eq: ['$collectionStatus', 'failed_collection'] }, 1, 0]
            }
          },
          totalAmountCollected: { $sum: '$collectedAmount' }
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
      {
        $unwind: '$deliveryPerson'
      },
      {
        $addFields: {
          collectionRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$totalCollected', '$totalPartial'] },
                  '$totalAssigned'
                ]
              },
              100
            ]
          },
          deliveryPersonName: {
            $concat: ['$deliveryPerson.firstName', ' ', '$deliveryPerson.lastName']
          }
        }
      },
      {
        $sort: { collectionRate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment dashboard data retrieved successfully',
      data: {
        period,
        dateRange,
        statistics: {
          ...paymentStats,
          collectionRate: paymentStats.totalPayments > 0 
            ? Math.round((paymentStats.completedPayments / paymentStats.totalPayments) * 100 * 100) / 100
            : 0
        },
        outstandingPayments,
        recentCollections,
        collectionIssues,
        deliveryPersonPerformance: deliveryPersonStats
      }
    });

  } catch (error) {
    console.error('Error getting payment dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment dashboard data',
      error: error.message
    });
  }
};
