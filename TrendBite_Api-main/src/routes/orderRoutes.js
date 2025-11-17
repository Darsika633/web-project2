import express from 'express';
import {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  updateOrderShipping,
  updateOrderPayment,
  updateDeliveryAddress,
  cancelOrder,
  getOrderStats,
  validateDiscountCode,
  rateDeliveryPerson,
  getDeliveryPersonRatings,
  getAllDeliveryPersonsWithRatings
} from '../controllers/orderController.js';

import { authenticate, authorizeAdmin, authorizeAdminOrDeliveryPerson } from '../middleware/auth.js';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateUpdateShipping,
  validateUpdatePayment,
  validateUpdateDeliveryAddress,
  validateCancelOrder,
  validateDiscountCode as validateDiscountCodeMiddleware,
  validateOrderFilters,
  validateOrderId,
  validateRateDeliveryPerson,
  validateGetDeliveryPersonRatings,
  validateGetDeliveryPersonsWithRatings
} from '../middleware/orderValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Customer routes
router.post('/', validateCreateOrder, createOrder);
router.get('/my-orders', validateOrderFilters, getCustomerOrders);
router.post('/validate-discount', validateDiscountCodeMiddleware, validateDiscountCode);

// Order by ID routes (with ownership/admin checks in controller)
router.get('/:orderId', validateOrderId, getOrderById);
router.put('/:orderId', validateOrderId, updateOrder); // Generic update route
router.put('/:orderId/delivery-address', validateUpdateDeliveryAddress, updateDeliveryAddress);
router.put('/:orderId/cancel', validateCancelOrder, cancelOrder);

// Admin only routes
router.get('/', authorizeAdmin, validateOrderFilters, getAllOrders);
router.get('/stats/overview', authorizeAdmin, getOrderStats);
router.put('/:orderId/status', authorizeAdmin, validateUpdateOrderStatus, updateOrderStatus);
router.put('/:orderId/shipping', authorizeAdmin, validateUpdateShipping, updateOrderShipping);
router.put('/:orderId/payment', authorizeAdmin, validateUpdatePayment, updateOrderPayment);

// Delivery Rating routes
// Customer: Rate delivery person after order delivery
router.post('/:orderId/rate-delivery', validateRateDeliveryPerson, rateDeliveryPerson);

// Admin or Delivery Person: Get delivery person ratings (delivery person can only view own ratings)
router.get('/delivery-ratings/:deliveryPersonId', authorizeAdminOrDeliveryPerson, validateGetDeliveryPersonRatings, getDeliveryPersonRatings);

// Admin: Get all delivery persons with ratings
router.get('/delivery-persons/ratings', authorizeAdmin, validateGetDeliveryPersonsWithRatings, getAllDeliveryPersonsWithRatings);

export default router;
