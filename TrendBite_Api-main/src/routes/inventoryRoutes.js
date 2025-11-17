import express from 'express';
import {
  getInventoryOverview,
  getLowStockProducts,
  getInventoryStatistics,
  getProductStockMovements,
  getVariantStockMovements,
  updateStockLevels,
  transferStock,
  reserveStock,
  restoreStock,
  getInventorySummary,
  bulkStockUpdate
} from '../controllers/inventoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { validateInventoryUpdate, validateStockTransfer, validateBulkUpdate } from '../middleware/inventoryValidation.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Inventory overview and statistics
router.get('/overview', getInventoryOverview);
router.get('/low-stock', getLowStockProducts);
router.get('/statistics', getInventoryStatistics);
router.get('/summary', getInventorySummary);

// Stock movements
router.get('/products/:productId/movements', getProductStockMovements);
router.get('/variants/:variantId/movements', getVariantStockMovements);

// Stock management operations
router.put('/products/:productId/variants/:variantId/stock', validateInventoryUpdate, updateStockLevels);
router.post('/transfer/:fromVariantId/:toVariantId', validateStockTransfer, transferStock);
router.post('/bulk-update', validateBulkUpdate, bulkStockUpdate);

// Order-related stock operations
router.post('/products/:productId/variants/:variantId/reserve', reserveStock);
router.post('/products/:productId/variants/:variantId/restore', restoreStock);

export default router;
