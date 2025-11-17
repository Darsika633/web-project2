import mongoose from 'mongoose';

// Validation middleware for inventory updates
export const validateInventoryUpdate = (req, res, next) => {
  const { quantity, reason } = req.body;
  const errors = [];

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (quantity === 0) {
    errors.push('Quantity cannot be zero');
  }

  // Validate reason
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push('Reason is required');
  } else if (reason.trim().length > 200) {
    errors.push('Reason cannot exceed 200 characters');
  }

  // Validate notes if provided
  if (req.body.notes && typeof req.body.notes === 'string' && req.body.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  // Validate cost if provided
  if (req.body.cost !== undefined) {
    if (typeof req.body.cost !== 'number' || req.body.cost < 0) {
      errors.push('Cost must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for stock transfers
export const validateStockTransfer = (req, res, next) => {
  const { quantity, reason } = req.body;
  const { fromVariantId, toVariantId } = req.params;
  const errors = [];

  // Validate variant IDs
  if (!mongoose.Types.ObjectId.isValid(fromVariantId)) {
    errors.push('Invalid from variant ID');
  }

  if (!mongoose.Types.ObjectId.isValid(toVariantId)) {
    errors.push('Invalid to variant ID');
  }

  if (fromVariantId === toVariantId) {
    errors.push('Cannot transfer stock to the same variant');
  }

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
  }

  // Validate reason
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push('Reason is required');
  } else if (reason.trim().length > 200) {
    errors.push('Reason cannot exceed 200 characters');
  }

  // Validate notes if provided
  if (req.body.notes && typeof req.body.notes === 'string' && req.body.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for bulk updates
export const validateBulkUpdate = (req, res, next) => {
  const { updates, reason } = req.body;
  const errors = [];

  // Validate updates array
  if (!updates || !Array.isArray(updates)) {
    errors.push('Updates must be an array');
  } else if (updates.length === 0) {
    errors.push('Updates array cannot be empty');
  } else if (updates.length > 100) {
    errors.push('Cannot process more than 100 updates at once');
  } else {
    // Validate each update
    updates.forEach((update, index) => {
      if (!update || typeof update !== 'object') {
        errors.push(`Update at index ${index} must be an object`);
        return;
      }

      const { productId, variantId, quantity } = update;

      if (!productId) {
        errors.push(`Product ID is required for update at index ${index}`);
      } else if (!mongoose.Types.ObjectId.isValid(productId)) {
        errors.push(`Invalid product ID for update at index ${index}`);
      }

      if (!variantId) {
        errors.push(`Variant ID is required for update at index ${index}`);
      } else if (!mongoose.Types.ObjectId.isValid(variantId)) {
        errors.push(`Invalid variant ID for update at index ${index}`);
      }

      if (quantity === undefined || quantity === null) {
        errors.push(`Quantity is required for update at index ${index}`);
      } else if (typeof quantity !== 'number') {
        errors.push(`Quantity must be a number for update at index ${index}`);
      } else if (quantity === 0) {
        errors.push(`Quantity cannot be zero for update at index ${index}`);
      }
    });
  }

  // Validate reason
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push('Reason is required for bulk update');
  } else if (reason.trim().length > 200) {
    errors.push('Reason cannot exceed 200 characters');
  }

  // Validate notes if provided
  if (req.body.notes && typeof req.body.notes === 'string' && req.body.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for stock reservation
export const validateStockReservation = (req, res, next) => {
  const { quantity, orderId, orderNumber } = req.body;
  const errors = [];

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
  }

  // Validate order ID
  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push('Invalid order ID');
  }

  // Validate order number if provided
  if (orderNumber && typeof orderNumber !== 'string') {
    errors.push('Order number must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for stock restoration
export const validateStockRestoration = (req, res, next) => {
  const { quantity, orderId, orderNumber } = req.body;
  const errors = [];

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
  }

  // Validate order ID
  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push('Invalid order ID');
  }

  // Validate order number if provided
  if (orderNumber && typeof orderNumber !== 'string') {
    errors.push('Order number must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
