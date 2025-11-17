import express from 'express';
import {
  // Admin controllers
  getAllPayments,
  getPaymentById,
  getPaymentStatistics,
  markPaymentAsReceived,
  updatePaymentDetails,
  generatePaymentReport,
  
  // Delivery person controllers
  getDeliveryPersonPayments,
  collectPayment,
  reportCollectionIssue
} from '../controllers/paymentController.js';
import { 
  authenticate, 
  authorizeAdmin, 
  authorizeDeliveryPerson,
  authorizeCustomerOrAdmin 
} from '../middleware/auth.js';
import { validatePaymentCollection, validateCollectionIssue } from '../middleware/paymentValidation.js';

const router = express.Router();

// ==================== ADMIN ROUTES ====================

// Apply admin authentication to all admin routes
router.use('/admin', authenticate, authorizeAdmin);

/**
 * @route GET /api/payments/admin/all
 * @desc Get all COD payments with filtering and pagination
 * @access Admin only
 */
router.get('/admin/all', getAllPayments);

/**
 * @route GET /api/payments/admin/statistics
 * @desc Get payment statistics for admin dashboard
 * @access Admin only
 */
router.get('/admin/statistics', getPaymentStatistics);

/**
 * @route GET /api/payments/admin/reports
 * @desc Generate payment reports (daily/weekly/monthly)
 * @access Admin only
 */
router.get('/admin/reports', generatePaymentReport);

/**
 * @route GET /api/payments/admin/:paymentId
 * @desc Get payment by ID with full details
 * @access Admin only
 */
router.get('/admin/:paymentId', getPaymentById);

/**
 * @route PUT /api/payments/admin/:paymentId/mark-received
 * @desc Mark payment as received/collected by admin
 * @access Admin only
 */
router.put('/admin/:paymentId/mark-received', markPaymentAsReceived);

/**
 * @route PUT /api/payments/admin/:paymentId/update
 * @desc Update payment details (admin notes, issues, etc.)
 * @access Admin only
 */
router.put('/admin/:paymentId/update', updatePaymentDetails);

// ==================== DELIVERY PERSON ROUTES ====================

// Apply delivery person authentication to delivery routes
router.use('/delivery', authenticate, authorizeDeliveryPerson);

/**
 * @route GET /api/payments/delivery/my-payments
 * @desc Get payments assigned to the authenticated delivery person
 * @access Delivery person only
 */
router.get('/delivery/my-payments', getDeliveryPersonPayments);

/**
 * @route POST /api/payments/delivery/:paymentId/collect
 * @desc Collect payment during delivery
 * @access Delivery person only
 */
router.post('/delivery/:paymentId/collect', validatePaymentCollection, collectPayment);

/**
 * @route POST /api/payments/delivery/:paymentId/report-issue
 * @desc Report collection issue (customer not available, refused to pay, etc.)
 * @access Delivery person only
 */
router.post('/delivery/:paymentId/report-issue', validateCollectionIssue, reportCollectionIssue);

// ==================== GENERAL ROUTES ====================

/**
 * @route GET /api/payments/outstanding
 * @desc Get outstanding payments (accessible by admin and delivery persons)
 * @access Admin or Delivery person
 */
router.get('/outstanding', authenticate, async (req, res, next) => {
  // Check if user is admin or delivery person
  if (req.user.role === 'admin') {
    // Admin can see all outstanding payments
    return getAllPayments(req, res);
  } else if (req.user.role === 'deliveryperson') {
    // Delivery person can only see their assigned outstanding payments
    req.query.isOutstanding = 'true';
    return getDeliveryPersonPayments(req, res);
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or delivery person privileges required.'
    });
  }
});

export default router;

