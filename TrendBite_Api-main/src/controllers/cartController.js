import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Discount from '../models/Discount.js';
import mongoose from 'mongoose';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Validate cart items and remove invalid ones
    const invalidItems = await cart.validateCartItems();
    
    if (invalidItems.length > 0) {
      await cart.save();
    }
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart,
        invalidItems: invalidItems.length > 0 ? invalidItems : undefined
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addItemToCart = async (req, res) => {
  try {
    const { productId, variant, quantity = 1 } = req.body;
    
    // Validate required fields
    if (!productId || !variant || !variant.sku || !variant.size || !variant.color?.name) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, variant SKU, size, and color are required'
      });
    }
    
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 10'
      });
    }
    
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Add item to cart
    await cart.addItem(productId, variant, quantity);
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Add item to cart error:', error);
    
    if (error.message.includes('not found') || error.message.includes('not available')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('stock') || error.message.includes('quantity') || error.message.includes('Maximum')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    // Validate item ID
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 10'
      });
    }
    
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Update item quantity
    await cart.updateItemQuantity(itemId, quantity);
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Item quantity updated successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Update item quantity error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('stock') || error.message.includes('quantity')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update item quantity',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Validate item ID
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Remove item from cart
    cart.removeItem(itemId);
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Remove item from cart error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Clear cart
    cart.clearCart();
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// @desc    Apply discount code to cart
// @route   POST /api/cart/apply-discount
// @access  Private
export const applyDiscount = async (req, res) => {
  try {
    const { discountCode } = req.body;
    
    if (!discountCode) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
    }
    
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Check if cart is empty
    if (cart.isEmpty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply discount to empty cart'
      });
    }
    
    // Apply discount
    await cart.applyDiscount(discountCode);
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Discount applied successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('Minimum')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to apply discount',
      error: error.message
    });
  }
};

// @desc    Remove discount from cart
// @route   DELETE /api/cart/discount
// @access  Private
export const removeDiscount = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Remove discount
    cart.removeDiscount();
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Discount removed successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Remove discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove discount',
      error: error.message
    });
  }
};

// @desc    Get cart summary (for checkout)
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Validate cart items
    const invalidItems = await cart.validateCartItems();
    
    if (invalidItems.length > 0) {
      await cart.save();
    }
    
    // Check if cart is empty
    if (cart.isEmpty) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Populate minimal product details for summary
    await cart.populate({
      path: 'items.product',
      select: 'name brand images variants',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
    
    // Create summary object
    const summary = {
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      deliveryCost: cart.deliveryCost,
      discount: cart.discount,
      totalAmount: cart.totalAmount,
      currency: cart.currency,
      items: cart.items.map(item => ({
        id: item._id,
        product: {
          id: item.product._id,
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.images?.[0]?.url || null
        },
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      invalidItems: invalidItems.length > 0 ? invalidItems : undefined
    };
    
    res.status(200).json({
      success: true,
      message: 'Cart summary retrieved successfully',
      data: { summary }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart summary',
      error: error.message
    });
  }
};

// @desc    Validate cart items
// @route   POST /api/cart/validate
// @access  Private
export const validateCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Validate cart items
    const invalidItems = await cart.validateCartItems();
    
    if (invalidItems.length > 0) {
      await cart.save();
    }
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart validation completed',
      data: {
        cart,
        invalidItems,
        isValid: invalidItems.length === 0
      }
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart',
      error: error.message
    });
  }
};

// @desc    Update cart item prices
// @route   POST /api/cart/update-prices
// @access  Private
export const updateCartPrices = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Update prices for all cart items
    const pricesUpdated = await cart.updatePrices();
    
    if (pricesUpdated) {
      await cart.save();
    }
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name brand images status isActive',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });
    
    res.status(200).json({
      success: true,
      message: pricesUpdated ? 'Cart prices updated successfully' : 'No price updates needed',
      data: { cart }
    });
  } catch (error) {
    console.error('Update cart prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart prices',
      error: error.message
    });
  }
};

// @desc    Debug - Get all discount codes (temporary endpoint for debugging)
// @route   GET /api/cart/debug/discounts
// @access  Private
export const debugGetDiscounts = async (req, res) => {
  try {
    const Discount = mongoose.model('Discount');
    const discounts = await Discount.find({}).select('code name isActive validFrom validUntil value type minimumOrderAmount');
    
    res.status(200).json({
      success: true,
      message: 'Discount codes retrieved for debugging',
      data: {
        discounts,
        currentDate: new Date(),
        totalCount: discounts.length
      }
    });
  } catch (error) {
    console.error('Debug get discounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve discount codes',
      error: error.message
    });
  }
};
