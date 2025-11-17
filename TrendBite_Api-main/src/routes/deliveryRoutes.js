import express from 'express';
import {
  assignDeliveryPerson,
  getAllDeliveryPersons,
  getDeliveryPersonOrders,
  updateDeliveryStatus,
  reassignDeliveryPerson,
  getDeliveryStats,
  getDeliveryOrderDetails,
  deleteDeliveredOrders
} from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateAssignDeliveryPerson,
  validateUpdateDeliveryStatus,
  validateReassignDeliveryPerson,
  validateGetDeliveryPersons,
  validateGetDeliveryPersonOrders,
  validateGetDeliveryStats,
  validateGetOrderDetails,
  validateDeleteDeliveredOrders
} from '../middleware/deliveryValidation.js';

const router = express.Router();

// Admin only routes
router.use(authenticate); // All routes require authentication

// Assign delivery person to order (Admin only)
router.post('/orders/:orderId/assign', 
  validateAssignDeliveryPerson,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }, 
  assignDeliveryPerson
);

// Get all delivery persons (Admin only)
router.get('/delivery-persons', 
  validateGetDeliveryPersons,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }, 
  getAllDeliveryPersons
);

// Reassign order to different delivery person (Admin only)
router.put('/orders/:orderId/reassign', 
  validateReassignDeliveryPerson,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }, 
  reassignDeliveryPerson
);

// Get delivery statistics (Admin only)
router.get('/stats', 
  validateGetDeliveryStats,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }, 
  getDeliveryStats
);

// Delete delivered orders (Admin only)
router.delete('/orders/delivered', 
  validateDeleteDeliveredOrders,
  (req, res, next) => {
    if (req.user.role !== 'deliveryperson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }, 
  deleteDeliveredOrders
);

// Delivery person only routes
// Get orders assigned to delivery person
router.get('/my-orders', 
  validateGetDeliveryPersonOrders,
  (req, res, next) => {
    if (req.user.role !== 'deliveryperson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    next();
  }, 
  getDeliveryPersonOrders
);

// Update delivery status
router.put('/orders/:orderId/status', 
  validateUpdateDeliveryStatus,
  (req, res, next) => {
    if (req.user.role !== 'deliveryperson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    next();
  }, 
  updateDeliveryStatus
);

// Get order details for delivery person
router.get('/orders/:orderId', 
  validateGetOrderDetails,
  (req, res, next) => {
    if (req.user.role !== 'deliveryperson') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery person role required.'
      });
    }
    next();
  }, 
  getDeliveryOrderDetails
);

export default router;
