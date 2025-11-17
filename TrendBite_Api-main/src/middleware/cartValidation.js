import mongoose from 'mongoose';

// Validation for adding item to cart
export const validateAddToCart = (req, res, next) => {
  const { productId, variant, quantity } = req.body;
  
  // Check required fields
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }
  
  if (!variant) {
    return res.status(400).json({
      success: false,
      message: 'Product variant is required'
    });
  }
  
  if (!variant.sku) {
    return res.status(400).json({
      success: false,
      message: 'Product variant SKU is required'
    });
  }
  
  if (!variant.size) {
    return res.status(400).json({
      success: false,
      message: 'Product variant size is required'
    });
  }
  
  if (!variant.color || !variant.color.name) {
    return res.status(400).json({
      success: false,
      message: 'Product variant color is required'
    });
  }
  
  // Validate product ID format
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }
  
  // Validate quantity
  if (quantity !== undefined) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer between 1 and 10'
      });
    }
  }
  
  // Validate variant structure
  if (variant.color.hex && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(variant.color.hex)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid color hex code format'
    });
  }
  
  next();
};

// Validation for updating item quantity
export const validateUpdateQuantity = (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  
  // Validate item ID
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid item ID format'
    });
  }
  
  // Validate quantity
  if (quantity === undefined || quantity === null) {
    return res.status(400).json({
      success: false,
      message: 'Quantity is required'
    });
  }
  
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be an integer between 1 and 10'
    });
  }
  
  next();
};

// Validation for item ID parameter
export const validateItemId = (req, res, next) => {
  const { itemId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid item ID format'
    });
  }
  
  next();
};

// Validation for discount code
export const validateDiscountCode = (req, res, next) => {
  const { discountCode } = req.body;
  
  if (!discountCode) {
    return res.status(400).json({
      success: false,
      message: 'Discount code is required'
    });
  }
  
  if (typeof discountCode !== 'string' || discountCode.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Discount code must be a non-empty string'
    });
  }
  
  if (discountCode.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Discount code cannot exceed 50 characters'
    });
  }
  
  next();
};

// Validation for cart operations (general)
export const validateCartOperation = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for cart operations'
    });
  }
  
  next();
};

// Sanitize input data
export const sanitizeCartInput = (req, res, next) => {
  // Ensure req.body exists
  if (!req.body) {
    req.body = {};
  }
  
  // Sanitize string inputs
  if (req.body.discountCode) {
    req.body.discountCode = req.body.discountCode.trim().toUpperCase();
  }
  
  if (req.body.variant) {
    if (req.body.variant.sku) {
      req.body.variant.sku = req.body.variant.sku.trim().toUpperCase();
    }
    if (req.body.variant.size) {
      req.body.variant.size = req.body.variant.size.trim();
    }
    if (req.body.variant.color && req.body.variant.color.name) {
      req.body.variant.color.name = req.body.variant.color.name.trim();
    }
    if (req.body.variant.color && req.body.variant.color.hex) {
      req.body.variant.color.hex = req.body.variant.color.hex.trim().toUpperCase();
    }
  }
  
  // Convert quantity to integer if provided
  if (req.body.quantity !== undefined) {
    req.body.quantity = parseInt(req.body.quantity, 10);
  }
  
  next();
};
