import { body, param, query, validationResult } from 'express-validator';

// Validation middleware
export const validateRequest = (req, res, next) => {
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

// Create order validation
export const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('items.*.variant.size')
    .notEmpty()
    .withMessage('Product size is required'),
  
  body('items.*.variant.color.name')
    .notEmpty()
    .withMessage('Product color name is required'),
  
  body('items.*.variant.sku')
    .notEmpty()
    .withMessage('Product SKU is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Delivery street address is required'),
  
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('Delivery city is required'),
  
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('Delivery state is required'),
  
  body('deliveryAddress.zipCode')
    .notEmpty()
    .withMessage('Delivery zip code is required'),
  
  body('deliveryAddress.phone')
    .notEmpty()
    .withMessage('Delivery phone number is required'),
  
  body('billingAddress.street')
    .notEmpty()
    .withMessage('Billing street address is required'),
  
  body('billingAddress.city')
    .notEmpty()
    .withMessage('Billing city is required'),
  
  body('billingAddress.state')
    .notEmpty()
    .withMessage('Billing state is required'),
  
  body('billingAddress.zipCode')
    .notEmpty()
    .withMessage('Billing zip code is required'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash_on_delivery', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'])
    .withMessage('Invalid payment method'),
  
  body('shippingMethod')
    .optional()
    .isIn(['standard', 'express'])
    .withMessage('Invalid shipping method. Choose "standard" (3 working days, 400 LKR) or "express" (within 1 day, 1000 LKR)'),
  
  body('discountCode')
    .optional()
    .isString()
    .withMessage('Discount code must be a string'),
  
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  validateRequest
];

// Update order status validation
export const validateUpdateOrderStatus = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'assigned', 'out_for_delivery', 'delivered', 'completed', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  validateRequest
];

// Update shipping details validation
export const validateUpdateShipping = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('trackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string'),
  
  body('deliveryPartner')
    .optional()
    .isString()
    .withMessage('Delivery partner must be a string'),
  
  body('estimatedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery date format'),
  
  validateRequest
];

// Update payment status validation
export const validateUpdatePayment = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Invalid payment status'),
  
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  
  validateRequest
];

// Update delivery address validation
export const validateUpdateDeliveryAddress = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Delivery street address is required'),
  
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('Delivery city is required'),
  
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('Delivery state is required'),
  
  body('deliveryAddress.zipCode')
    .notEmpty()
    .withMessage('Delivery zip code is required'),
  
  body('deliveryAddress.phone')
    .notEmpty()
    .withMessage('Delivery phone number is required'),
  
  validateRequest
];

// Cancel order validation
export const validateCancelOrder = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('reason')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  validateRequest
];

// Validate discount code
export const validateDiscountCode = [
  body('code')
    .notEmpty()
    .withMessage('Discount code is required'),
  
  body('orderAmount')
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number'),
  
  validateRequest
];

// Query validation for order filters
export const validateOrderFilters = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'shipped', 'assigned', 'out_for_delivery', 'delivered', 'completed', 'cancelled'])
    .withMessage('Invalid order status filter'),
  
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Invalid payment status filter'),
  
  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID filter'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date from format'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date to format'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'totalAmount', 'status'])
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

// Order ID validation
export const validateOrderId = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  validateRequest
];

// Rate delivery person validation
export const validateRateDeliveryPerson = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('feedback')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters'),
  
  validateRequest
];

// Get delivery person ratings validation
export const validateGetDeliveryPersonRatings = [
  param('deliveryPersonId')
    .isMongoId()
    .withMessage('Invalid delivery person ID'),
  
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
    .isIn(['ratedAt', 'rating'])
    .withMessage('Sort by must be either ratedAt or rating'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  
  validateRequest
];

// Get all delivery persons with ratings validation
export const validateGetDeliveryPersonsWithRatings = [
  query('sortBy')
    .optional()
    .isIn(['averageRating', 'totalRatings', 'totalDeliveries'])
    .withMessage('Sort by must be averageRating, totalRatings, or totalDeliveries'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  
  validateRequest
];
