import express from 'express';
import {
  getDashboardOverview,
  getRevenueOverview,
  getRecentActivity,
  getOrderStatistics,
  getTopSellingProducts,
  getCustomerAnalytics,
  getInventoryDashboard,
  getInventoryAlerts,
  getInventoryReports,
  getPaymentDashboard
} from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route - Top selling products (no authentication required)
router.get('/dashboard/top-selling-products', getTopSellingProducts);

// Apply authentication and admin authorization to all routes below
router.use(authenticate);
router.use(authorizeAdmin);

// Dashboard overview - Get all key metrics
router.get('/dashboard/overview', getDashboardOverview);

// Revenue overview - Get monthly revenue for past 6 months
router.get('/dashboard/revenue-overview', getRevenueOverview);

// Recent activity - Get recent orders, customers, and reviews
router.get('/dashboard/recent-activity', getRecentActivity);

// Order statistics - Get order counts by status
router.get('/dashboard/order-statistics', getOrderStatistics);

// Customer analytics
router.get('/dashboard/customer-analytics', getCustomerAnalytics);

// Inventory management
router.get('/dashboard/inventory', getInventoryDashboard);
router.get('/inventory/alerts', getInventoryAlerts);
router.get('/inventory/reports', getInventoryReports);

// Payment management
router.get('/dashboard/payments', getPaymentDashboard);

export default router;

