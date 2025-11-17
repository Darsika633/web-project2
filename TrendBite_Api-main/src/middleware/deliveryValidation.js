import { body, param, query } from 'express-validator';

// Validation for assigning delivery person
export const validateAssignDeliveryPerson = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format'),

  body('deliveryPersonId')
    .isMongoId()
    .withMessage('Invalid delivery person ID format')
    .notEmpty()
    .withMessage('Delivery person ID is required')
];

// Validation for updating delivery status
export const validateUpdateDeliveryStatus = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format'),

  body('status')
    .isIn(['assigned', 'out_for_delivery', 'delivered'])
    .withMessage('Status must be one of: assigned, out_for_delivery, delivered'),

  body('estimatedDeliveryTime')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery time must be a valid ISO 8601 date'),

  body('deliveryNotes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Delivery notes cannot exceed 500 characters')
];

// Validation for reassigning delivery person
export const validateReassignDeliveryPerson = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format'),

  body('deliveryPersonId')
    .isMongoId()
    .withMessage('Invalid delivery person ID format')
    .notEmpty()
    .withMessage('Delivery person ID is required')
];

// Validation for getting delivery persons
export const validateGetDeliveryPersons = [
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'createdAt', 'lastLogin'])
    .withMessage('sortBy must be one of: firstName, lastName, email, createdAt, lastLogin'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation for getting delivery person orders
export const validateGetDeliveryPersonOrders = [
  query('status')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const validStatuses = ['assigned', 'out_for_delivery', 'delivered', 'completed'];
        if (!validStatuses.includes(value)) {
          throw new Error('Invalid status value');
        }
      } else if (Array.isArray(value)) {
        const validStatuses = ['assigned', 'out_for_delivery', 'delivered', 'completed'];
        const invalidStatuses = value.filter(status => !validStatuses.includes(status));
        if (invalidStatuses.length > 0) {
          throw new Error(`Invalid status values: ${invalidStatuses.join(', ')}`);
        }
      }
      return true;
    }),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date'),

  query('sortBy')
    .optional()
    .isIn(['assignedAt', 'status', 'createdAt', 'totalAmount'])
    .withMessage('sortBy must be one of: assignedAt, status, createdAt, totalAmount'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation for getting delivery statistics
export const validateGetDeliveryStats = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date')
];

// Validation for getting order details
export const validateGetOrderDetails = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format')
];

// Validation for deleting delivered orders
export const validateDeleteDeliveredOrders = [
  query('confirmDelete')
    .equals('true')
    .withMessage('confirmDelete must be set to true to proceed with deletion'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date'),

  query('olderThanDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('olderThanDays must be a positive integer'),

  // Ensure only one date filter is used
  query().custom((query) => {
    const dateFilters = ['dateFrom', 'dateTo', 'olderThanDays'];
    const providedFilters = dateFilters.filter(filter => query[filter]);
    
    if (providedFilters.length > 1) {
      throw new Error('Only one date filter can be used: dateFrom/dateTo OR olderThanDays');
    }
    
    return true;
  })
];
