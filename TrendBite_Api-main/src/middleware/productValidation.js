// Validation middleware for product creation
export const validateProductCreation = (req, res, next) => {
  const { name, description, brand, category, gender, variants } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (name.trim().length > 200) {
    errors.push('Product name cannot exceed 200 characters');
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push('Product description is required');
  } else if (description.trim().length > 2000) {
    errors.push('Product description cannot exceed 2000 characters');
  }

  // Brand validation
  if (!brand || brand.trim().length === 0) {
    errors.push('Brand is required');
  } else if (brand.trim().length > 100) {
    errors.push('Brand name cannot exceed 100 characters');
  }

  // Category validation
  if (!category) {
    errors.push('Category is required');
  } else if (typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category must be a valid string');
  }

  // Boolean fields validation (optional but if provided, must be valid boolean or string representation)
  const booleanFields = ['isActive', 'isFeatured'];
  booleanFields.forEach(field => {
    if (req.body[field] !== undefined) {
      const value = req.body[field];
      if (value !== '' && value !== true && value !== false && 
          value !== 'true' && value !== 'false' && 
          value !== '1' && value !== '0') {
        errors.push(`${field} must be a valid boolean value (true/false)`);
      }
    }
  });

  // Gender validation
  if (!gender) {
    errors.push('Gender is required');
  } else if (!['men', 'women', 'unisex'].includes(gender)) {
    errors.push('Gender must be one of: men, women, unisex');
  }

  // Variants validation
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    errors.push('At least one product variant is required');
  } else {
    variants.forEach((variant, index) => {
      if (!variant.size || variant.size.trim().length === 0) {
        errors.push(`Variant ${index + 1}: Size is required`);
      }
      if (!variant.color || !variant.color.name || variant.color.name.trim().length === 0) {
        errors.push(`Variant ${index + 1}: Color name is required`);
      }
      if (!variant.price || !variant.price.regular || variant.price.regular < 0) {
        errors.push(`Variant ${index + 1}: Valid regular price is required`);
      }
      if (variant.price && variant.price.sale && variant.price.sale < 0) {
        errors.push(`Variant ${index + 1}: Sale price cannot be negative`);
      }
      if (variant.stockQuantity === undefined || variant.stockQuantity < 0) {
        errors.push(`Variant ${index + 1}: Valid stock quantity is required`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for product update
export const validateProductUpdate = (req, res, next) => {
  const { name, description, brand, category, gender, variants } = req.body;
  const errors = [];

  // Name validation (optional but if provided, must be valid)
  if (name !== undefined) {
    if (name.trim().length === 0) {
      errors.push('Product name cannot be empty');
    } else if (name.trim().length > 200) {
      errors.push('Product name cannot exceed 200 characters');
    }
  }

  // Description validation (optional but if provided, must be valid)
  if (description !== undefined) {
    if (description.trim().length === 0) {
      errors.push('Product description cannot be empty');
    } else if (description.trim().length > 2000) {
      errors.push('Product description cannot exceed 2000 characters');
    }
  }

  // Brand validation (optional but if provided, must be valid)
  if (brand !== undefined) {
    if (brand.trim().length === 0) {
      errors.push('Brand name cannot be empty');
    } else if (brand.trim().length > 100) {
      errors.push('Brand name cannot exceed 100 characters');
    }
  }

  // Category validation (optional but if provided, must be valid ObjectId or string)
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category must be a valid string');
    }
  }

  // Boolean fields validation (optional but if provided, must be valid boolean or string representation)
  const booleanFields = ['isActive', 'isFeatured'];
  booleanFields.forEach(field => {
    if (req.body[field] !== undefined) {
      const value = req.body[field];
      if (value !== '' && value !== true && value !== false && 
          value !== 'true' && value !== 'false' && 
          value !== '1' && value !== '0') {
        errors.push(`${field} must be a valid boolean value (true/false)`);
      }
    }
  });

  // Gender validation (optional but if provided, must be valid)
  if (gender !== undefined) {
    if (!['men', 'women', 'unisex'].includes(gender)) {
      errors.push('Gender must be one of: men, women, unisex');
    }
  }

  // Variants validation (optional but if provided, must be valid)
  if (variants !== undefined) {
    if (!Array.isArray(variants)) {
      errors.push('Variants must be an array');
    } else if (variants.length === 0) {
      errors.push('At least one product variant is required');
    } else {
      variants.forEach((variant, index) => {
        if (!variant.size || variant.size.trim().length === 0) {
          errors.push(`Variant ${index + 1}: Size is required`);
        }
        if (!variant.color || !variant.color.name || variant.color.name.trim().length === 0) {
          errors.push(`Variant ${index + 1}: Color name is required`);
        }
        if (!variant.price || !variant.price.regular || variant.price.regular < 0) {
          errors.push(`Variant ${index + 1}: Valid regular price is required`);
        }
        if (variant.price && variant.price.sale && variant.price.sale < 0) {
          errors.push(`Variant ${index + 1}: Sale price cannot be negative`);
        }
        if (variant.stockQuantity === undefined || variant.stockQuantity < 0) {
          errors.push(`Variant ${index + 1}: Valid stock quantity is required`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for category creation
export const validateCategoryCreation = (req, res, next) => {
  const { name, parent } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Category name is required');
  } else if (name.trim().length > 100) {
    errors.push('Category name cannot exceed 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for category update
export const validateCategoryUpdate = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  // Name validation (optional but if provided, must be valid)
  if (name !== undefined) {
    if (name.trim().length === 0) {
      errors.push('Category name cannot be empty');
    } else if (name.trim().length > 100) {
      errors.push('Category name cannot exceed 100 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for bulk pricing
export const validateBulkPricing = (req, res, next) => {
  const { bulkPricing } = req.body;
  const errors = [];

  if (bulkPricing !== undefined) {
    if (!Array.isArray(bulkPricing)) {
      errors.push('Bulk pricing must be an array');
    } else {
      bulkPricing.forEach((pricing, index) => {
        if (!pricing.minQuantity || pricing.minQuantity < 1) {
          errors.push(`Bulk pricing ${index + 1}: Valid minimum quantity is required`);
        }
        if (pricing.maxQuantity && pricing.maxQuantity < pricing.minQuantity) {
          errors.push(`Bulk pricing ${index + 1}: Maximum quantity must be greater than minimum quantity`);
        }
        if (!pricing.discountType || !['percentage', 'fixed'].includes(pricing.discountType)) {
          errors.push(`Bulk pricing ${index + 1}: Discount type must be 'percentage' or 'fixed'`);
        }
        if (!pricing.discountValue || pricing.discountValue < 0) {
          errors.push(`Bulk pricing ${index + 1}: Valid discount value is required`);
        }
        if (pricing.discountType === 'percentage' && pricing.discountValue > 100) {
          errors.push(`Bulk pricing ${index + 1}: Percentage discount cannot exceed 100%`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};
