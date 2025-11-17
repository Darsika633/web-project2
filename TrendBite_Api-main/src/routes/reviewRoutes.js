import express from 'express';
import {
  createReview,
  getReviews,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  getUserReviews,
  approveReview,
  rejectReview,
  addAdminReply,
  getPendingReviews
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCreateReview,
  validateUpdateReview,
  validateReviewId,
  validateProductId,
  validateAdminReply,
  validateReviewQuery,
  handleValidationErrors,
  validateReviewCreation,
  validateReviewOwnership,
  validateAdminAction
} from '../middleware/reviewValidation.js';

const router = express.Router();

// Public routes
// @route   GET /api/reviews
// @desc    Get all reviews with filters
// @access  Public
router.get(
  '/',
  validateReviewQuery,
  handleValidationErrors,
  getReviews
);

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a specific product
// @access  Public
router.get(
  '/product/:productId',
  validateProductId,
  validateReviewQuery,
  handleValidationErrors,
  getProductReviews
);

// @route   GET /api/reviews/:id
// @desc    Get a single review by ID
// @access  Public
router.get(
  '/:id',
  validateReviewId,
  handleValidationErrors,
  getReview
);

// Protected routes (require authentication)
// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post(
  '/',
  authenticate,
  validateCreateReview,
  handleValidationErrors,
  validateReviewCreation,
  createReview
);

// @route   GET /api/reviews/user/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get(
  '/user/my-reviews',
  authenticate,
  validateReviewQuery,
  handleValidationErrors,
  getUserReviews
);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put(
  '/:id',
  authenticate,
  validateUpdateReview,
  handleValidationErrors,
  validateReviewOwnership,
  updateReview
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete(
  '/:id',
  authenticate,
  validateReviewId,
  handleValidationErrors,
  validateReviewOwnership,
  deleteReview
);

// Admin routes
// @route   GET /api/reviews/admin/pending
// @desc    Get pending reviews for moderation
// @access  Private (Admin)
router.get(
  '/admin/pending',
  authenticate,
  validateAdminAction,
  validateReviewQuery,
  handleValidationErrors,
  getPendingReviews
);

// @route   PATCH /api/reviews/:id/approve
// @desc    Approve a review
// @access  Private (Admin)
router.patch(
  '/:id/approve',
  authenticate,
  validateAdminAction,
  validateReviewId,
  handleValidationErrors,
  approveReview
);

// @route   PATCH /api/reviews/:id/reject
// @desc    Reject a review
// @access  Private (Admin)
router.patch(
  '/:id/reject',
  authenticate,
  validateAdminAction,
  validateReviewId,
  handleValidationErrors,
  rejectReview
);

// @route   POST /api/reviews/:id/reply
// @desc    Add admin reply to a review
// @access  Private (Admin)
router.post(
  '/:id/reply',
  authenticate,
  validateAdminAction,
  validateAdminReply,
  handleValidationErrors,
  addAdminReply
);

export default router;
