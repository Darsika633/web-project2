import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Review description is required'],
    trim: true,
    maxlength: [1000, 'Review description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminReply: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin reply cannot exceed 500 characters']
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repliedAt: {
      type: Date
    }
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
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

// Virtual for review status display
reviewSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for rating display (stars)
reviewSchema.virtual('ratingDisplay').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Indexes for better performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isActive: 1 });

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Mark as edited if description or title is modified (not on first save)
  if (this.isModified('description') || this.isModified('title')) {
    if (!this.isNew) {
      this.isEdited = true;
      this.editedAt = new Date();
    }
  }
  next();
});

// Static method to get reviews with filters
reviewSchema.statics.getFilteredReviews = async function(filters = {}) {
  const {
    product,
    user,
    status,
    rating,
    isActive = true,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters;

  const query = { isActive };

  // Product filter
  if (product) {
    query.product = product;
  }

  // User filter
  if (user) {
    query.user = user;
  }

  // Status filter
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Rating filter
  if (rating) {
    if (Array.isArray(rating)) {
      query.rating = { $in: rating };
    } else if (typeof rating === 'object') {
      // For range queries like { min: 4, max: 5 }
      if (rating.min !== undefined) query.rating.$gte = rating.min;
      if (rating.max !== undefined) query.rating.$lte = rating.max;
    } else {
      query.rating = rating;
    }
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const skip = (page - 1) * limit;

  const reviews = await this.find(query)
    .populate('user', 'firstName lastName avatar')
    .populate('product', 'name brand images')
    .populate('adminReply.repliedBy', 'firstName lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductReviewStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };
  }

  const result = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10, // Round to 1 decimal place
    ratingDistribution: distribution
  };
};

// Static method to check if user can review a product
reviewSchema.statics.canUserReview = async function(userId, productId) {
  // Check if user has already reviewed this product
  const existingReview = await this.findOne({ user: userId, product: productId });
  if (existingReview) {
    return { canReview: false, reason: 'User has already reviewed this product' };
  }

  // Check if user has purchased this product (delivered orders only)
  const Order = mongoose.model('Order');
  const hasPurchased = await Order.findOne({
    customer: userId,
    'items.product': productId,
    status: { $in: ['delivered', 'completed'] }
  });

  if (!hasPurchased) {
    return { canReview: false, reason: 'User must purchase the product before reviewing' };
  }

  return { canReview: true };
};

// Instance method to approve review
reviewSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  // Don't save here - let the calling code handle the save
};

// Instance method to reject review
reviewSchema.methods.reject = function(rejectedBy) {
  this.status = 'rejected';
  // Don't save here - let the calling code handle the save
};

// Instance method to add admin reply
reviewSchema.methods.addAdminReply = function(message, repliedBy) {
  this.adminReply = {
    message,
    repliedBy,
    repliedAt: new Date()
  };
  // Don't save here - let the calling code handle the save
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
