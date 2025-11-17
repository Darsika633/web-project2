import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  variant: {
    size: {
      type: String,
      required: [true, 'Size is required']
    },
    color: {
      name: {
        type: String,
        required: [true, 'Color name is required']
      },
      hex: String
    },
    sku: {
      type: String,
      required: [true, 'SKU is required']
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Maximum quantity per item is 10']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  items: [cartItemSchema],
  
  // Cart totals (calculated in real-time)
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryCost: {
    type: Number,
    default: 400, // Fixed cost in LKR
    min: [0, 'Delivery cost cannot be negative']
  },
  discount: {
    code: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    appliedAt: {
      type: Date
    }
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  
  // Cart metadata
  itemCount: {
    type: Number,
    default: 0,
    min: [0, 'Item count cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Cart expires after 30 days of inactivity
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR', 'GBP']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for cart status
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

cartSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Indexes for better performance
// Note: user index is already created by unique: true in schema
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup
cartSchema.index({ lastUpdated: -1 });

// Pre-save middleware
cartSchema.pre('save', function(next) {
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  // Extend expiration date when cart is updated
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // Calculate totals
  this.calculateTotals();
  
  next();
});

// Instance method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);
  
  // Calculate discount amount
  let discountAmount = 0;
  if (this.discount.code && this.discount.amount > 0) {
    if (this.discount.type === 'percentage') {
      discountAmount = (this.subtotal * this.discount.amount) / 100;
    } else {
      discountAmount = this.discount.amount;
    }
  }
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.deliveryCost - discountAmount;
  
  // Ensure total amount is not negative
  if (this.totalAmount < 0) {
    this.totalAmount = 0;
  }
  
  // Update item count
  this.itemCount = this.items.length;
};

// Instance method to add item to cart
cartSchema.methods.addItem = async function(productId, variant, quantity = 1) {
  const Product = mongoose.model('Product');
  
  // Validate product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive || product.status !== 'published') {
    throw new Error('Product not found or not available');
  }
  
  // Find the specific variant
  const productVariant = product.variants.find(v => 
    v.sku === variant.sku && 
    v.isActive && 
    v.stockQuantity > 0
  );
  
  if (!productVariant) {
    throw new Error('Product variant not found or out of stock');
  }
  
  // Check stock availability
  if (productVariant.stockQuantity < quantity) {
    throw new Error(`Only ${productVariant.stockQuantity} items available in stock`);
  }
  
  // Check if item already exists in cart
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId && 
    item.variant.sku === variant.sku
  );
  
  if (existingItemIndex !== -1) {
    // Update existing item quantity
    const newQuantity = this.items[existingItemIndex].quantity + quantity;
    
    // Check maximum quantity per item
    if (newQuantity > 10) {
      throw new Error('Maximum quantity per item is 10');
    }
    
    // Check stock availability for new total quantity
    if (productVariant.stockQuantity < newQuantity) {
      throw new Error(`Only ${productVariant.stockQuantity} items available in stock`);
    }
    
    this.items[existingItemIndex].quantity = newQuantity;
    this.items[existingItemIndex].totalPrice = this.items[existingItemIndex].unitPrice * newQuantity;
  } else {
    // Check maximum items in cart
    if (this.items.length >= 5) {
      throw new Error('Maximum 5 items allowed in cart');
    }
    
    // Add new item
    const unitPrice = productVariant.price.sale || productVariant.price.regular;
    this.items.push({
      product: productId,
      variant: {
        size: variant.size,
        color: {
          name: variant.color.name,
          hex: variant.color.hex
        },
        sku: variant.sku
      },
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: unitPrice * quantity
    });
  }
  
  // Recalculate totals
  this.calculateTotals();
  
  return this;
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = async function(itemId, newQuantity) {
  // Convert itemId to ObjectId for proper comparison
  const itemIndex = this.items.findIndex(item => 
    item._id.toString() === itemId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (newQuantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  
  if (newQuantity > 10) {
    throw new Error('Maximum quantity per item is 10');
  }
  
  // Validate stock availability
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.items[itemIndex].product);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  const productVariant = product.variants.find(v => 
    v.sku === this.items[itemIndex].variant.sku
  );
  
  if (!productVariant || !productVariant.isActive) {
    throw new Error('Product variant not available');
  }
  
  if (productVariant.stockQuantity < newQuantity) {
    throw new Error(`Only ${productVariant.stockQuantity} items available in stock`);
  }
  
  // Update quantity and price
  this.items[itemIndex].quantity = newQuantity;
  this.items[itemIndex].totalPrice = this.items[itemIndex].unitPrice * newQuantity;
  
  // Recalculate totals
  this.calculateTotals();
  
  return this;
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  const itemIndex = this.items.findIndex(item => 
    item._id.toString() === itemId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  this.items.splice(itemIndex, 1);
  
  // Recalculate totals
  this.calculateTotals();
  
  return this;
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.discount = {
    code: null,
    amount: 0,
    type: 'fixed',
    appliedAt: null
  };
  
  // Recalculate totals
  this.calculateTotals();
  
  return this;
};

// Instance method to apply discount
cartSchema.methods.applyDiscount = async function(discountCode) {
  const Discount = mongoose.model('Discount');
  
  // Debug logging
  console.log('Looking for discount code:', discountCode.toUpperCase());
  
  // Find active discount
  const discount = await Discount.findOne({
    code: discountCode.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });
  
  // Debug logging
  console.log('Found discount:', discount ? 'Yes' : 'No');
  if (discount) {
    console.log('Discount details:', {
      code: discount.code,
      isActive: discount.isActive,
      validFrom: discount.validFrom,
      validUntil: discount.validUntil,
      currentDate: new Date()
    });
  }
  
  if (!discount) {
    // Check if discount exists but is inactive
    const inactiveDiscount = await Discount.findOne({
      code: discountCode.toUpperCase()
    });
    
    if (inactiveDiscount) {
      console.log('Found inactive discount:', {
        code: inactiveDiscount.code,
        isActive: inactiveDiscount.isActive,
        validFrom: inactiveDiscount.validFrom,
        validUntil: inactiveDiscount.validUntil
      });
      throw new Error('Discount code is not active or has expired');
    } else {
      throw new Error('Discount code not found');
    }
  }
  
  // Check minimum order amount
  if (this.subtotal < discount.minimumOrderAmount) {
    throw new Error(`Minimum order amount of ${discount.minimumOrderAmount} ${this.currency} required`);
  }
  
  // Apply discount
  this.discount = {
    code: discount.code,
    amount: discount.value,
    type: discount.type,
    appliedAt: new Date()
  };
  
  // Recalculate totals
  this.calculateTotals();
  
  return this;
};

// Instance method to remove discount
cartSchema.methods.removeDiscount = function() {
  this.discount = {
    code: null,
    amount: 0,
    type: 'fixed',
    appliedAt: null
  };
  
  // Recalculate totals
  this.calculateTotals();
  
  return this;
};

// Instance method to update prices for all cart items
cartSchema.methods.updatePrices = async function() {
  const Product = mongoose.model('Product');
  let pricesUpdated = false;
  
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i];
    
    try {
      const product = await Product.findById(item.product);
      
      if (product && product.isActive && product.status === 'published') {
        const productVariant = product.variants.find(v => 
          v.sku === item.variant.sku && v.isActive
        );
        
        if (productVariant) {
          // Update price if it has changed
          const currentPrice = productVariant.price.sale || productVariant.price.regular;
          if (item.unitPrice !== currentPrice) {
            item.unitPrice = currentPrice;
            item.totalPrice = currentPrice * item.quantity;
            pricesUpdated = true;
          }
        }
      }
    } catch (error) {
      console.error('Error updating price for item:', item._id, error);
    }
  }
  
  // Recalculate totals if prices were updated
  if (pricesUpdated) {
    this.calculateTotals();
  }
  
  return pricesUpdated;
};

// Instance method to validate cart items
cartSchema.methods.validateCartItems = async function() {
  const Product = mongoose.model('Product');
  const invalidItems = [];
  
  for (let i = this.items.length - 1; i >= 0; i--) {
    const item = this.items[i];
    
    try {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive || product.status !== 'published') {
        invalidItems.push({
          itemId: item._id,
          reason: 'Product not available'
        });
        this.items.splice(i, 1);
        continue;
      }
      
      const productVariant = product.variants.find(v => 
        v.sku === item.variant.sku && v.isActive
      );
      
      if (!productVariant) {
        invalidItems.push({
          itemId: item._id,
          reason: 'Product variant not available'
        });
        this.items.splice(i, 1);
        continue;
      }
      
      if (productVariant.stockQuantity < item.quantity) {
        // Adjust quantity to available stock
        if (productVariant.stockQuantity === 0) {
          invalidItems.push({
            itemId: item._id,
            reason: 'Product out of stock'
          });
          this.items.splice(i, 1);
        } else {
          item.quantity = productVariant.stockQuantity;
          item.totalPrice = item.unitPrice * item.quantity;
        }
        continue;
      }
      
      // Update price if it has changed
      const currentPrice = productVariant.price.sale || productVariant.price.regular;
      if (item.unitPrice !== currentPrice) {
        item.unitPrice = currentPrice;
        item.totalPrice = currentPrice * item.quantity;
      }
      
    } catch (error) {
      invalidItems.push({
        itemId: item._id,
        reason: 'Error validating item'
      });
      this.items.splice(i, 1);
    }
  }
  
  // Recalculate totals if items were modified
  if (invalidItems.length > 0) {
    this.calculateTotals();
  }
  
  return invalidItems;
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({ user: userId });
    await cart.save();
  } else if (cart.isExpired) {
    // Clear expired cart
    cart.clearCart();
    await cart.save();
  } else if (cart.items.length > 0) {
    // Update prices for existing cart items
    const pricesUpdated = await cart.updatePrices();
    if (pricesUpdated) {
      await cart.save();
    }
  }
  
  return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
