import { body, param, query, validationResult } from 'express-validator';

// Validation rules for creating a review
export const validateCreateReview = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a whole number between 1 and 5'),
  
  body('title')
    .notEmpty()
    .withMessage('Review title is required')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Review title must be between 5 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Review description is required')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review description must be between 10 and 1000 characters')
];

// Validation rules for updating a review
export const validateUpdateReview = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a whole number between 1 and 5'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Review title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review description must be between 10 and 1000 characters')
];

// Validation rules for review ID parameter
export const validateReviewId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format')
];

// Validation rules for product ID parameter
export const validateProductId = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID format')
];

// Validation rules for admin reply
export const validateAdminReply = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  
  body('message')
    .notEmpty()
    .withMessage('Reply message is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reply message must be between 5 and 500 characters')
];

// Validation rules for query parameters
export const validateReviewQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'updatedAt'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status filter'),
  
  query('rating')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(r => Number.isInteger(Number(r)) && r >= 1 && r <= 5);
      }
      return Number.isInteger(Number(value)) && value >= 1 && value <= 5;
    })
    .withMessage('Rating must be between 1 and 5'),
  
  query('product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  query('user')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Custom validation for review creation
export const validateReviewCreation = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Check if user can review this product
    const Review = (await import('../models/Review.js')).default;
    const canReview = await Review.canUserReview(userId, productId);
    
    if (!canReview.canReview) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    next();
  } catch (error) {
    console.error('Error in review creation validation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Custom validation for review ownership
export const validateReviewOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const Review = (await import('../models/Review.js')).default;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Allow admin to access any review
    if (userRole === 'admin') {
      req.review = review;
      return next();
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this review'
      });
    }

    req.review = review;
    next();
  } catch (error) {
    console.error('Error in review ownership validation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Custom validation for admin actions
export const validateAdminAction = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

