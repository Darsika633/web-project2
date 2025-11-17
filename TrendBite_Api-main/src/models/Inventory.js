import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Variant is required']
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Current stock cannot be negative'],
    default: 0
  },
  reservedStock: {
    type: Number,
    required: [true, 'Reserved stock is required'],
    min: [0, 'Reserved stock cannot be negative'],
    default: 0
  },
  availableStock: {
    type: Number,
    required: [true, 'Available stock is required'],
    min: [0, 'Available stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    required: [true, 'Low stock threshold is required'],
    min: [0, 'Low stock threshold cannot be negative'],
    default: 10
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  isOutOfStock: {
    type: Boolean,
    default: false
  },
  lastRestocked: {
    type: Date
  },
  lastSold: {
    type: Date
  },
  totalIn: {
    type: Number,
    default: 0,
    min: [0, 'Total in cannot be negative']
  },
  totalOut: {
    type: Number,
    default: 0,
    min: [0, 'Total out cannot be negative']
  },
  averageCost: {
    type: Number,
    min: [0, 'Average cost cannot be negative']
  },
  totalValue: {
    type: Number,
    min: [0, 'Total value cannot be negative']
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

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.isOutOfStock || this.currentStock === 0) {
    return 'out_of_stock';
  } else if (this.isLowStock || this.currentStock <= this.lowStockThreshold) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function() {
  if (this.lowStockThreshold === 0) return 100;
  return Math.min(100, (this.currentStock / this.lowStockThreshold) * 100);
});

// Indexes for better performance
inventorySchema.index({ product: 1, variant: 1 }, { unique: true });
inventorySchema.index({ product: 1 });
inventorySchema.index({ variant: 1 });
inventorySchema.index({ isLowStock: 1 });
inventorySchema.index({ isOutOfStock: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ availableStock: 1 });

// Pre-save middleware to calculate available stock and update flags
inventorySchema.pre('save', function(next) {
  // Calculate available stock
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  
  // Update low stock flag
  this.isLowStock = this.currentStock <= this.lowStockThreshold && this.currentStock > 0;
  
  // Update out of stock flag
  this.isOutOfStock = this.currentStock === 0;
  
  // Calculate total value if average cost is available
  if (this.averageCost && this.currentStock > 0) {
    this.totalValue = this.averageCost * this.currentStock;
  }
  
  next();
});

// Static method to get inventory overview
inventorySchema.statics.getInventoryOverview = async function(filters = {}) {
  const {
    product,
    category,
    brand,
    lowStockOnly = false,
    outOfStockOnly = false,
    page = 1,
    limit = 20
  } = filters;

  const matchQuery = { isActive: true };

  if (product) {
    matchQuery.product = product;
  }

  if (lowStockOnly) {
    matchQuery.isLowStock = true;
  }

  if (outOfStockOnly) {
    matchQuery.isOutOfStock = true;
  }

  const skip = (page - 1) * limit;

  let pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    }
  ];

  // Add category filter if specified
  if (category) {
    pipeline.push({
      $match: {
        'product.category': category
      }
    });
  }

  // Add brand filter if specified
  if (brand) {
    pipeline.push({
      $match: {
        'product.brand': new RegExp(brand, 'i')
      }
    });
  }

  // Add pagination and sorting
  pipeline.push(
    {
      $project: {
        productId: '$product._id',
        productName: '$product.name',
        brand: '$product.brand',
        category: '$product.category',
        variant: 1,
        currentStock: 1,
        reservedStock: 1,
        availableStock: 1,
        lowStockThreshold: 1,
        isLowStock: 1,
        isOutOfStock: 1,
        stockStatus: 1,
        stockPercentage: 1,
        lastRestocked: 1,
        lastSold: 1,
        totalValue: 1,
        updatedAt: 1
      }
    },
    {
      $sort: { isOutOfStock: 1, isLowStock: 1, currentStock: 1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  );

  const inventory = await this.aggregate(pipeline);

  // Get total count for pagination
  const countPipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    }
  ];

  if (category) {
    countPipeline.push({
      $match: {
        'product.category': category
      }
    });
  }

  if (brand) {
    countPipeline.push({
      $match: {
        'product.brand': new RegExp(brand, 'i')
      }
    });
  }

  countPipeline.push({ $count: 'total' });

  const countResult = await this.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  return {
    inventory,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to get low stock products
inventorySchema.statics.getLowStockProducts = async function(filters = {}) {
  const {
    threshold,
    page = 1,
    limit = 20
  } = filters;

  const matchQuery = {
    isActive: true,
    isLowStock: true
  };

  if (threshold !== undefined) {
    matchQuery.currentStock = { $lte: threshold };
  }

  const skip = (page - 1) * limit;

  const lowStockProducts = await this.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $project: {
        productId: '$product._id',
        productName: '$product.name',
        brand: '$product.brand',
        categoryName: '$category.name',
        variant: 1,
        currentStock: 1,
        lowStockThreshold: 1,
        stockPercentage: 1,
        lastRestocked: 1,
        lastSold: 1,
        updatedAt: 1
      }
    },
    {
      $sort: { currentStock: 1, updatedAt: -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]);

  const total = await this.countDocuments(matchQuery);

  return {
    lowStockProducts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to get inventory statistics
inventorySchema.statics.getInventoryStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$currentStock' },
        totalReserved: { $sum: '$reservedStock' },
        totalAvailable: { $sum: '$availableStock' },
        totalValue: { $sum: '$totalValue' },
        lowStockCount: {
          $sum: {
            $cond: [{ $eq: ['$isLowStock', true] }, 1, 0]
          }
        },
        outOfStockCount: {
          $sum: {
            $cond: [{ $eq: ['$isOutOfStock', true] }, 1, 0]
          }
        },
        inStockCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isOutOfStock', false] },
                  { $eq: ['$isLowStock', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalProducts: 0,
    totalStock: 0,
    totalReserved: 0,
    totalAvailable: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0
  };
};

// Static method to update inventory from stock movement
inventorySchema.statics.updateFromMovement = async function(movement) {
  const { product, variant, quantity, movementType } = movement;

  let inventory = await this.findOne({ product, variant });

  if (!inventory) {
    // Create new inventory record
    inventory = new this({
      product,
      variant,
      currentStock: 0,
      reservedStock: 0,
      lowStockThreshold: 10 // Default threshold
    });
  }

  // Update stock based on movement type
  switch (movementType) {
    case 'in':
    case 'adjustment':
      if (quantity > 0) {
        inventory.currentStock += quantity;
        inventory.lastRestocked = new Date();
      }
      break;
    case 'out':
      if (quantity < 0) {
        // Ensure currentStock doesn't go negative
        const stockReduction = Math.abs(quantity);
        inventory.currentStock = Math.max(0, inventory.currentStock - stockReduction);
        inventory.lastSold = new Date();
      }
      break;
    case 'reservation':
      if (quantity < 0) {
        inventory.reservedStock += Math.abs(quantity);
      }
      break;
    case 'restoration':
      if (quantity > 0) {
        inventory.reservedStock = Math.max(0, inventory.reservedStock - quantity);
      }
      break;
    case 'transfer':
      // Transfer doesn't change total stock, handled separately
      break;
  }

  // Update totals
  if (movementType === 'in' || movementType === 'adjustment') {
    if (quantity > 0) {
      inventory.totalIn += quantity;
    }
  } else if (movementType === 'out') {
    if (quantity < 0) {
      inventory.totalOut += Math.abs(quantity);
    }
  }

  await inventory.save();
  return inventory;
};

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
