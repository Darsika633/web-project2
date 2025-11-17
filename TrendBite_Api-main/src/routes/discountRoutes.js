import express from 'express';
import {
  createDiscount,
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  getDiscountStats
} from '../controllers/discountController.js';

import { authenticate, authorizeAdmin, optionalAuth } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create discount validation
const validateCreateDiscount = [
  body('code')
    .notEmpty()
    .withMessage('Discount code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Discount code must be between 3 and 20 characters'),
  
  body('name')
    .notEmpty()
    .withMessage('Discount name is required')
    .isLength({ max: 100 })
    .withMessage('Discount name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  
  body('minimumOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  
  body('maximumDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a positive number'),
  
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  
  body('validFrom')
    .isISO8601()
    .withMessage('Valid from date is required and must be in ISO format'),
  
  body('validUntil')
    .isISO8601()
    .withMessage('Valid until date is required and must be in ISO format'),
  
  body('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),
  
  body('applicableProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  
  body('applicableCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('applicableUsers')
    .optional()
    .isArray()
    .withMessage('Applicable users must be an array'),
  
  body('applicableUsers.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  validateRequest
];

// Update discount validation
const validateUpdateDiscount = [
  param('discountId')
    .isMongoId()
    .withMessage('Invalid discount ID'),
  
  body('code')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Discount code must be between 3 and 20 characters'),
  
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Discount name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  
  body('minimumOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  
  body('maximumDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a positive number'),
  
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid from date must be in ISO format'),
  
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be in ISO format'),
  
  body('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),
  
  body('applicableProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  
  body('applicableCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('applicableUsers')
    .optional()
    .isArray()
    .withMessage('Applicable users must be an array'),
  
  body('applicableUsers.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  validateRequest
];

// Discount ID validation
const validateDiscountId = [
  param('discountId')
    .isMongoId()
    .withMessage('Invalid discount ID'),
  
  validateRequest
];

// Query validation for discount filters
const validateDiscountFilters = [
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  query('type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Invalid discount type filter'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'code', 'name', 'usedCount'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Invalid sort order'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validateRequest
];

const router = express.Router();

// Public route (optional authentication for personalized discounts)
router.get('/active', optionalAuth, getActiveDiscounts);

// Apply authentication to all other routes
router.use(authenticate);

// Admin only routes
router.post('/', authorizeAdmin, validateCreateDiscount, createDiscount);
router.get('/', authorizeAdmin, validateDiscountFilters, getAllDiscounts);
router.get('/stats', authorizeAdmin, getDiscountStats);
router.get('/:discountId', authorizeAdmin, validateDiscountId, getDiscountById);
router.put('/:discountId', authorizeAdmin, validateUpdateDiscount, updateDiscount);
router.delete('/:discountId', authorizeAdmin, validateDiscountId, deleteDiscount);
router.patch('/:discountId/toggle-status', authorizeAdmin, validateDiscountId, toggleDiscountStatus);

// Debug endpoint to check all discounts (temporary)
router.get('/debug/all', async (req, res) => {
  try {
    const Discount = (await import('../models/Discount.js')).default;
    const discounts = await Discount.find({}).lean();
    res.json({
      success: true,
      message: 'All discounts retrieved for debugging',
      data: discounts,
      count: discounts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving discounts',
      error: error.message
    });
  }
});

export default router;
