import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import StockMovement from '../models/StockMovement.js';
import mongoose from 'mongoose';

// Get inventory overview
export const getInventoryOverview = async (req, res) => {
  try {
    const {
      product,
      category,
      brand,
      lowStockOnly,
      outOfStockOnly,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      product,
      category,
      brand,
      lowStockOnly: lowStockOnly === 'true',
      outOfStockOnly: outOfStockOnly === 'true',
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Inventory.getInventoryOverview(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting inventory overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory overview',
      error: error.message
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const {
      threshold,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      threshold: threshold ? parseInt(threshold) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Inventory.getLowStockProducts(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
    });
  }
};

// Get inventory statistics
export const getInventoryStatistics = async (req, res) => {
  try {
    const stats = await Inventory.getInventoryStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting inventory statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory statistics',
      error: error.message
    });
  }
};

// Get stock movements for a product
export const getProductStockMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      variant,
      movementType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const filters = {
      variant,
      movementType,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await StockMovement.getProductMovements(productId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting product stock movements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product stock movements',
      error: error.message
    });
  }
};

// Get stock movements for a variant
export const getVariantStockMovements = async (req, res) => {
  try {
    const { variantId } = req.params;
    const {
      movementType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variant ID'
      });
    }

    const filters = {
      movementType,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await StockMovement.getVariantMovements(variantId, filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting variant stock movements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching variant stock movements',
      error: error.message
    });
  }
};

// Update stock levels (manual adjustment)
export const updateStockLevels = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity, reason, notes, cost } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or variant ID'
      });
    }

    if (!quantity || quantity === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required and cannot be zero'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }

    // Find the product and variant
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    const previousStock = variant.stockQuantity;
    const newStock = Math.max(0, previousStock + quantity);

    // Create stock movement record
    const stockMovement = new StockMovement({
      product: productId,
      variant: variantId,
      movementType: 'adjustment',
      quantity,
      previousStock,
      newStock,
      reason,
      notes,
      cost,
      reference: {
        type: 'manual',
        id: null
      },
      performedBy: req.user.id
    });

    await stockMovement.save();

    // Update variant stock
    variant.stockQuantity = newStock;
    await product.save();

    // Update inventory record
    await Inventory.updateFromMovement(stockMovement);

    res.status(200).json({
      success: true,
      message: 'Stock levels updated successfully',
      data: {
        productId,
        variantId,
        previousStock,
        newStock,
        adjustment: quantity,
        movementId: stockMovement._id
      }
    });
  } catch (error) {
    console.error('Error updating stock levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock levels',
      error: error.message
    });
  }
};

// Transfer stock between variants
export const transferStock = async (req, res) => {
  try {
    const { fromVariantId, toVariantId } = req.params;
    const { quantity, reason, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(fromVariantId) || !mongoose.Types.ObjectId.isValid(toVariantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variant IDs'
      });
    }

    if (fromVariantId === toVariantId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer stock to the same variant'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }

    // Find products containing both variants
    const fromProduct = await Product.findOne({ 'variants._id': fromVariantId });
    const toProduct = await Product.findOne({ 'variants._id': toVariantId });

    if (!fromProduct || !toProduct) {
      return res.status(404).json({
        success: false,
        message: 'One or both variants not found'
      });
    }

    const fromVariant = fromProduct.variants.id(fromVariantId);
    const toVariant = toProduct.variants.id(toVariantId);

    if (fromVariant.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for transfer'
      });
    }

    const fromPreviousStock = fromVariant.stockQuantity;
    const toPreviousStock = toVariant.stockQuantity;
    const fromNewStock = fromPreviousStock - quantity;
    const toNewStock = toPreviousStock + quantity;

    // Create stock movement records
    const outMovement = new StockMovement({
      product: fromProduct._id,
      variant: fromVariantId,
      movementType: 'transfer',
      quantity: -quantity,
      previousStock: fromPreviousStock,
      newStock: fromNewStock,
      reason: `Transfer out: ${reason}`,
      notes,
      reference: {
        type: 'transfer',
        id: toVariantId
      },
      performedBy: req.user.id
    });

    const inMovement = new StockMovement({
      product: toProduct._id,
      variant: toVariantId,
      movementType: 'transfer',
      quantity: quantity,
      previousStock: toPreviousStock,
      newStock: toNewStock,
      reason: `Transfer in: ${reason}`,
      notes,
      reference: {
        type: 'transfer',
        id: fromVariantId
      },
      performedBy: req.user.id
    });

    await Promise.all([outMovement.save(), inMovement.save()]);

    // Update variant stocks
    fromVariant.stockQuantity = fromNewStock;
    toVariant.stockQuantity = toNewStock;

    await Promise.all([fromProduct.save(), toProduct.save()]);

    // Update inventory records
    await Promise.all([
      Inventory.updateFromMovement(outMovement),
      Inventory.updateFromMovement(inMovement)
    ]);

    res.status(200).json({
      success: true,
      message: 'Stock transfer completed successfully',
      data: {
        fromVariantId,
        toVariantId,
        quantity,
        fromPreviousStock,
        fromNewStock,
        toPreviousStock,
        toNewStock,
        movements: [outMovement._id, inMovement._id]
      }
    });
  } catch (error) {
    console.error('Error transferring stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error transferring stock',
      error: error.message
    });
  }
};

// Reserve stock for order
export const reserveStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity, orderId, orderNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or variant ID'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find the product and variant
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    if (variant.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for reservation'
      });
    }

    // Create stock movement record
    const stockMovement = new StockMovement({
      product: productId,
      variant: variantId,
      movementType: 'reservation',
      quantity: -quantity,
      previousStock: variant.stockQuantity,
      newStock: variant.stockQuantity,
      reason: `Stock reserved for order ${orderNumber || orderId}`,
      reference: {
        type: 'order',
        id: orderId,
        number: orderNumber
      },
      performedBy: req.user.id
    });

    await stockMovement.save();

    // Update inventory record
    await Inventory.updateFromMovement(stockMovement);

    res.status(200).json({
      success: true,
      message: 'Stock reserved successfully',
      data: {
        productId,
        variantId,
        quantity,
        orderId,
        movementId: stockMovement._id
      }
    });
  } catch (error) {
    console.error('Error reserving stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error reserving stock',
      error: error.message
    });
  }
};

// Restore stock from cancelled order
export const restoreStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity, orderId, orderNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or variant ID'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find the product and variant
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Create stock movement record
    const stockMovement = new StockMovement({
      product: productId,
      variant: variantId,
      movementType: 'restoration',
      quantity: quantity,
      previousStock: variant.stockQuantity,
      newStock: variant.stockQuantity,
      reason: `Stock restored from cancelled order ${orderNumber || orderId}`,
      reference: {
        type: 'order',
        id: orderId,
        number: orderNumber
      },
      performedBy: req.user.id
    });

    await stockMovement.save();

    // Update inventory record
    await Inventory.updateFromMovement(stockMovement);

    res.status(200).json({
      success: true,
      message: 'Stock restored successfully',
      data: {
        productId,
        variantId,
        quantity,
        orderId,
        movementId: stockMovement._id
      }
    });
  } catch (error) {
    console.error('Error restoring stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring stock',
      error: error.message
    });
  }
};

// Get inventory summary
export const getInventorySummary = async (req, res) => {
  try {
    const {
      product,
      variant,
      startDate,
      endDate
    } = req.query;

    const filters = {
      product,
      variant,
      startDate,
      endDate
    };

    const summary = await StockMovement.getInventorySummary(filters);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting inventory summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory summary',
      error: error.message
    });
  }
};

// Bulk stock update
export const bulkStockUpdate = async (req, res) => {
  try {
    const { updates, reason, notes } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and cannot be empty'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for bulk update'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, variantId, quantity } = update;

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
          errors.push({
            productId,
            variantId,
            error: 'Invalid product or variant ID'
          });
          continue;
        }

        if (!quantity || quantity === 0) {
          errors.push({
            productId,
            variantId,
            error: 'Quantity is required and cannot be zero'
          });
          continue;
        }

        // Find the product and variant
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({
            productId,
            variantId,
            error: 'Product not found'
          });
          continue;
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
          errors.push({
            productId,
            variantId,
            error: 'Variant not found'
          });
          continue;
        }

        const previousStock = variant.stockQuantity;
        const newStock = Math.max(0, previousStock + quantity);

        // Create stock movement record
        const stockMovement = new StockMovement({
          product: productId,
          variant: variantId,
          movementType: 'adjustment',
          quantity,
          previousStock,
          newStock,
          reason: `Bulk update: ${reason}`,
          notes,
          reference: {
            type: 'import',
            id: null
          },
          performedBy: req.user.id
        });

        await stockMovement.save();

        // Update variant stock
        variant.stockQuantity = newStock;
        await product.save();

        // Update inventory record
        await Inventory.updateFromMovement(stockMovement);

        results.push({
          productId,
          variantId,
          previousStock,
          newStock,
          adjustment: quantity,
          movementId: stockMovement._id
        });
      } catch (error) {
        errors.push({
          productId: update.productId,
          variantId: update.variantId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: updates.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Error in bulk stock update:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk stock update',
      error: error.message
    });
  }
};
