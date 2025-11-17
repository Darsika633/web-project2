import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Variant is required']
  },
  movementType: {
    type: String,
    required: [true, 'Movement type is required'],
    enum: {
      values: ['in', 'out', 'adjustment', 'transfer', 'reservation', 'restoration'],
      message: 'Movement type must be one of: in, out, adjustment, transfer, reservation, restoration'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    validate: {
      validator: function(value) {
        return value !== 0;
      },
      message: 'Quantity cannot be zero'
    }
  },
  previousStock: {
    type: Number,
    required: [true, 'Previous stock is required'],
    min: [0, 'Previous stock cannot be negative']
  },
  newStock: {
    type: Number,
    required: [true, 'New stock is required'],
    min: [0, 'New stock cannot be negative']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  reference: {
    type: {
      type: String,
      enum: ['order', 'adjustment', 'transfer', 'import', 'export', 'manual'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    number: {
      type: String,
      required: false
    }
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performed by user is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for absolute quantity (always positive)
stockMovementSchema.virtual('absoluteQuantity').get(function() {
  return Math.abs(this.quantity);
});

// Virtual for movement direction
stockMovementSchema.virtual('direction').get(function() {
  return this.quantity > 0 ? 'in' : 'out';
});

// Indexes for better performance
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ variant: 1, createdAt: -1 });
stockMovementSchema.index({ movementType: 1 });
stockMovementSchema.index({ performedBy: 1 });
stockMovementSchema.index({ 'reference.type': 1, 'reference.id': 1 });
stockMovementSchema.index({ createdAt: -1 });

// Static method to get stock movements for a product
stockMovementSchema.statics.getProductMovements = async function(productId, filters = {}) {
  const {
    variant,
    movementType,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters;

  const query = { product: productId };

  if (variant) {
    query.variant = variant;
  }

  if (movementType) {
    query.movementType = movementType;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const movements = await this.find(query)
    .populate('product', 'name brand')
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    movements,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMovements: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to get stock movements for a variant
stockMovementSchema.statics.getVariantMovements = async function(variantId, filters = {}) {
  const {
    movementType,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters;

  const query = { variant: variantId };

  if (movementType) {
    query.movementType = movementType;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const movements = await this.find(query)
    .populate('product', 'name brand')
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    movements,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMovements: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to get inventory summary
stockMovementSchema.statics.getInventorySummary = async function(filters = {}) {
  const {
    product,
    variant,
    startDate,
    endDate
  } = filters;

  const matchQuery = {};

  if (product) {
    matchQuery.product = product;
  }

  if (variant) {
    matchQuery.variant = variant;
  }

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const summary = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          product: '$product',
          variant: '$variant',
          movementType: '$movementType'
        },
        totalQuantity: { $sum: '$quantity' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          product: '$_id.product',
          variant: '$_id.variant'
        },
        movements: {
          $push: {
            type: '$_id.movementType',
            quantity: '$totalQuantity',
            count: '$count'
          }
        },
        totalMovements: { $sum: '$count' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        productId: '$_id.product',
        variantId: '$_id.variant',
        productName: '$product.name',
        brand: '$product.brand',
        movements: 1,
        totalMovements: 1
      }
    }
  ]);

  return summary;
};

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
