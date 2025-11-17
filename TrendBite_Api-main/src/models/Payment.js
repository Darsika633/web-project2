import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer reference is required']
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Payment Details
  method: {
    type: String,
    enum: ['cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  status: {
    type: String,
    enum: ['pending', 'paid_on_delivery', 'completed', 'failed', 'partial'],
    default: 'pending'
  },
  
  // Amount Details
  expectedAmount: {
    type: Number,
    required: [true, 'Expected payment amount is required'],
    min: [0, 'Expected amount cannot be negative']
  },
  collectedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Collected amount cannot be negative']
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: [0, 'Balance amount cannot be negative']
  },
  
  // Collection Details
  collectionTimestamp: {
    type: Date,
    default: null
  },
  collectionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Collection notes cannot exceed 500 characters']
  },
  collectionStatus: {
    type: String,
    enum: ['not_collected', 'collected', 'partial_collected', 'failed_collection'],
    default: 'not_collected'
  },
  
  // Collection Issues
  collectionIssues: {
    type: [String],
    enum: ['customer_not_available', 'customer_refused', 'address_incorrect', 'insufficient_cash', 'other'],
    default: []
  },
  issueDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Issue description cannot exceed 1000 characters']
  },
  
  // Tracking
  deliveryAttempts: {
    type: Number,
    default: 0,
    min: [0, 'Delivery attempts cannot be negative']
  },
  lastAttemptDate: {
    type: Date,
    default: null
  },
  
  // Admin Management
  isOutstanding: {
    type: Boolean,
    default: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ deliveryPerson: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ collectionStatus: 1 });
paymentSchema.index({ isOutstanding: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for calculating balance
paymentSchema.virtual('calculatedBalance').get(function() {
  return this.expectedAmount - this.collectedAmount;
});

// Pre-save middleware to update balance amount
paymentSchema.pre('save', function(next) {
  this.balanceAmount = this.expectedAmount - this.collectedAmount;
  
  // Update collection status based on amounts
  if (this.collectedAmount === 0) {
    this.collectionStatus = 'not_collected';
  } else if (this.collectedAmount === this.expectedAmount) {
    this.collectionStatus = 'collected';
    this.status = 'completed';
    this.isOutstanding = false;
  } else if (this.collectedAmount > 0 && this.collectedAmount < this.expectedAmount) {
    this.collectionStatus = 'partial_collected';
    this.status = 'partial';
  }
  
  next();
});

// Static method to find outstanding payments
paymentSchema.statics.findOutstandingPayments = function(filters = {}) {
  const query = { isOutstanding: true, ...filters };
  return this.find(query).populate('order customer deliveryPerson');
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStatistics = async function(dateRange = {}) {
  const matchStage = {};
  
  if (dateRange.startDate || dateRange.endDate) {
    matchStage.createdAt = {};
    if (dateRange.startDate) matchStage.createdAt.$gte = new Date(dateRange.startDate);
    if (dateRange.endDate) matchStage.createdAt.$lte = new Date(dateRange.endDate);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalExpectedAmount: { $sum: '$expectedAmount' },
        totalCollectedAmount: { $sum: '$collectedAmount' },
        totalOutstanding: {
          $sum: {
            $cond: [{ $eq: ['$isOutstanding', true] }, 1, 0]
          }
        },
        totalOutstandingAmount: {
          $sum: {
            $cond: [{ $eq: ['$isOutstanding', true] }, '$balanceAmount', 0]
          }
        },
        completedPayments: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        partialPayments: {
          $sum: {
            $cond: [{ $eq: ['$status', 'partial'] }, 1, 0]
          }
        },
        failedPayments: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalExpectedAmount: 0,
    totalCollectedAmount: 0,
    totalOutstanding: 0,
    totalOutstandingAmount: 0,
    completedPayments: 0,
    partialPayments: 0,
    failedPayments: 0
  };
};

// Instance method to collect payment
paymentSchema.methods.collectPayment = function(amount, deliveryPersonId, notes = '') {
  this.collectedAmount += amount;
  this.deliveryPerson = deliveryPersonId;
  this.collectionTimestamp = new Date();
  this.collectionNotes = notes;
  this.lastAttemptDate = new Date();
  this.deliveryAttempts += 1;
  
  // Update status based on collection
  if (this.collectedAmount >= this.expectedAmount) {
    this.status = 'completed';
    this.collectionStatus = 'collected';
    this.isOutstanding = false;
  } else if (this.collectedAmount > 0) {
    this.status = 'partial';
    this.collectionStatus = 'partial_collected';
  }
  
  return this.save();
};

// Instance method to report collection issue
paymentSchema.methods.reportCollectionIssue = function(issues, description = '', deliveryPersonId) {
  this.collectionIssues = issues;
  this.issueDescription = description;
  this.deliveryPerson = deliveryPersonId;
  this.lastAttemptDate = new Date();
  this.deliveryAttempts += 1;
  this.collectionStatus = 'failed_collection';
  
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

