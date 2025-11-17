import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Discount code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Discount code cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true,
    maxlength: [100, 'Discount name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    min: [0, 'Minimum order amount cannot be negative'],
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount cannot be negative']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining usage
discountSchema.virtual('remainingUsage').get(function() {
  if (!this.usageLimit) return null;
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for is valid
discountSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now && 
         (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Virtual for discount display
discountSchema.virtual('displayValue').get(function() {
  if (this.type === 'percentage') {
    return `${this.value}%`;
  } else {
    return `LKR ${this.value}`;
  }
});

// Virtual to check if a specific user has used this discount
discountSchema.methods.hasUserUsed = function(userId) {
  return this.usedBy.some(usage => usage.user.toString() === userId);
};

// Indexes for better performance
// Note: code index is already created by unique: true in schema
discountSchema.index({ isActive: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });
discountSchema.index({ isPublic: 1 });
discountSchema.index({ createdBy: 1 });
discountSchema.index({ 'usedBy.user': 1 });

// Pre-save middleware to validate dates
discountSchema.pre('save', function(next) {
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid until date must be after valid from date'));
  }
  
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  next();
});

// Static method to find valid discount by code
discountSchema.statics.findValidDiscount = async function(code, userId, orderAmount) {
  const now = new Date();
  
  // First, find the discount by code (without other restrictions)
  const discount = await this.findOne({
    code: code.toUpperCase()
  });

  if (!discount) {
    console.log(`Discount not found for code: ${code.toUpperCase()}`);
    return null;
  }

  console.log(`Found discount: ${discount.code}, isActive: ${discount.isActive}, validFrom: ${discount.validFrom}, validUntil: ${discount.validUntil}, now: ${now}`);

  // Check if discount is active
  if (!discount.isActive) {
    console.log(`Discount ${discount.code} is not active`);
    return null;
  }

  // Check date validity
  if (discount.validFrom > now) {
    console.log(`Discount ${discount.code} is not yet valid. Valid from: ${discount.validFrom}, Now: ${now}`);
    return null;
  }

  if (discount.validUntil < now) {
    console.log(`Discount ${discount.code} has expired. Valid until: ${discount.validUntil}, Now: ${now}`);
    return null;
  }

  // Check usage limit
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    console.log(`Discount ${discount.code} has reached usage limit. Used: ${discount.usedCount}, Limit: ${discount.usageLimit}`);
    return null;
  }

  // Check if user is eligible
  if (discount.applicableUsers.length > 0 && !discount.applicableUsers.some(user => user.toString() === userId)) {
    console.log(`User ${userId} is not eligible for discount ${discount.code}. Applicable users: ${discount.applicableUsers.map(u => u.toString())}`);
    return null;
  }

  // Check if user has already used this discount
  if (discount.usedBy.some(usage => usage.user.toString() === userId)) {
    console.log(`User ${userId} has already used discount ${discount.code}`);
    return null;
  }

  // Check minimum order amount
  if (orderAmount < discount.minimumOrderAmount) {
    console.log(`Order amount ${orderAmount} is below minimum required ${discount.minimumOrderAmount} for discount ${discount.code}`);
    return null;
  }

  console.log(`Discount ${discount.code} is valid!`);
  return discount;
};

// Static method to calculate discount amount
discountSchema.methods.calculateDiscountAmount = function(orderAmount) {
  let discountAmount = 0;
  
  if (this.type === 'percentage') {
    discountAmount = (orderAmount * this.value) / 100;
  } else {
    discountAmount = this.value;
  }
  
  // Apply maximum discount limit if set
  if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
    discountAmount = this.maximumDiscountAmount;
  }
  
  // Ensure discount doesn't exceed order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }
  
  return discountAmount;
};

// Instance method to increment usage
discountSchema.methods.incrementUsage = function(userId) {
  // Add user to usedBy array if not already present
  const userAlreadyUsed = this.usedBy.some(usage => usage.user.toString() === userId);
  if (!userAlreadyUsed) {
    this.usedBy.push({
      user: userId,
      usedAt: new Date()
    });
  }
  
  this.usedCount += 1;
  return this.save();
};

// Static method to get active discounts
discountSchema.statics.getActiveDiscounts = async function(userId = null) {
  const now = new Date();
  const query = {
    isActive: true,
    isPublic: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $and: [
      // Usage limit check
      {
        $or: [
          { usageLimit: { $exists: false } },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
      }
    ]
  };

  // Add user eligibility check if userId is provided
  if (userId) {
    query.$and.push({
      $or: [
        { applicableUsers: { $size: 0 } }, // No specific users (public for all)
        { applicableUsers: new mongoose.Types.ObjectId(userId) } // User is in applicable users list
      ]
    });

    // Exclude discounts that the user has already used
    query.$and.push({
      'usedBy.user': { $ne: new mongoose.Types.ObjectId(userId) }
    });
  }

  return this.find(query)
    .populate('applicableProducts', 'name')
    .populate('applicableCategories', 'name')
    .populate('usedBy.user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

const Discount = mongoose.model('Discount', discountSchema);

export default Discount;
