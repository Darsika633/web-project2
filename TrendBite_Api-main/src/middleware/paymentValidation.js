import { body, validationResult } from 'express-validator';

// Validation rules for payment collection
export const validatePaymentCollection = [
  body('amount')
    .isNumeric()
    .withMessage('Payment amount must be a valid number')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0')
    .custom((value) => {
      // Check if amount has maximum 2 decimal places
      if (value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
        throw new Error('Payment amount cannot have more than 2 decimal places');
      }
      return true;
    }),

  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Collection notes cannot exceed 500 characters'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// Validation rules for collection issue reporting
export const validateCollectionIssue = [
  body('issues')
    .isArray({ min: 1 })
    .withMessage('At least one collection issue must be specified')
    .custom((issues) => {
      const validIssues = [
        'customer_not_available',
        'customer_refused',
        'address_incorrect',
        'insufficient_cash',
        'other'
      ];
      
      for (const issue of issues) {
        if (!validIssues.includes(issue)) {
          throw new Error(`Invalid collection issue: ${issue}. Valid issues are: ${validIssues.join(', ')}`);
        }
      }
      return true;
    }),

  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Issue description must be between 10 and 1000 characters'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// Validation rules for admin payment updates
export const validateAdminPaymentUpdate = [
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Payment amount must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Payment amount cannot be negative')
    .custom((value) => {
      if (value !== undefined && value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
        throw new Error('Payment amount cannot have more than 2 decimal places');
      }
      return true;
    }),

  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Collection notes cannot exceed 500 characters'),

  body('adminNotes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters'),

  body('collectionIssues')
    .optional()
    .isArray()
    .custom((issues) => {
      if (issues && issues.length > 0) {
        const validIssues = [
          'customer_not_available',
          'customer_refused',
          'address_incorrect',
          'insufficient_cash',
          'other'
        ];
        
        for (const issue of issues) {
          if (!validIssues.includes(issue)) {
            throw new Error(`Invalid collection issue: ${issue}. Valid issues are: ${validIssues.join(', ')}`);
          }
        }
      }
      return true;
    }),

  body('issueDescription')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Issue description cannot exceed 1000 characters'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// Validation rules for payment report generation
export const validatePaymentReport = [
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('reportType')
    .optional()
    .isIn(['summary', 'detailed', 'outstanding'])
    .withMessage('Report type must be one of: summary, detailed, outstanding'),

  body('deliveryPersonId')
    .optional()
    .isMongoId()
    .withMessage('Delivery person ID must be a valid MongoDB ObjectId'),

  body('status')
    .optional()
    .isIn(['pending', 'paid_on_delivery', 'completed', 'failed', 'partial'])
    .withMessage('Status must be one of: pending, paid_on_delivery, completed, failed, partial'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// Custom validation middleware for payment amount limits
export const validatePaymentAmount = (req, res, next) => {
  const { amount } = req.body;
  const paymentId = req.params.paymentId;

  // This will be used in the controller to check against the expected amount
  req.paymentValidation = {
    amount,
    paymentId
  };

  next();
};

// Validation for date range queries
export const validateDateRange = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate && endDate <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

