import express from 'express';
import {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  getCartSummary,
  validateCart,
  updateCartPrices,
  debugGetDiscounts
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCartOperation,
  validateAddToCart,
  validateUpdateQuantity,
  validateItemId,
  validateDiscountCode,
  sanitizeCartInput
} from '../middleware/cartValidation.js';

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(authenticate);

// Apply general cart validation middleware
router.use(validateCartOperation);

// Apply input sanitization middleware
router.use(sanitizeCartInput);

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Cart item ID
 *         product:
 *           type: string
 *           description: Product ID
 *         variant:
 *           type: object
 *           properties:
 *             size:
 *               type: string
 *             color:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 hex:
 *                   type: string
 *             sku:
 *               type: string
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         unitPrice:
 *           type: number
 *         totalPrice:
 *           type: number
 *         addedAt:
 *           type: string
 *           format: date-time
 *     
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         subtotal:
 *           type: number
 *         deliveryCost:
 *           type: number
 *         discount:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             amount:
 *               type: number
 *             type:
 *               type: string
 *               enum: [percentage, fixed]
 *             appliedAt:
 *               type: string
 *               format: date-time
 *         totalAmount:
 *           type: number
 *         itemCount:
 *           type: integer
 *         currency:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     AddToCartRequest:
 *       type: object
 *       required:
 *         - productId
 *         - variant
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID
 *         variant:
 *           type: object
 *           required:
 *             - sku
 *             - size
 *             - color
 *           properties:
 *             sku:
 *               type: string
 *             size:
 *               type: string
 *             color:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                 hex:
 *                   type: string
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 1
 *     
 *     UpdateQuantityRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *     
 *     ApplyDiscountRequest:
 *       type: object
 *       required:
 *         - discountCode
 *       properties:
 *         discountCode:
 *           type: string
 *           maxLength: 50
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *                     invalidItems:
 *                       type: array
 *                       description: Items that were removed due to unavailability
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - Invalid input or business rule violation
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or not available
 *       500:
 *         description: Internal server error
 */
router.post('/items', validateAddToCart, addItemToCart);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuantityRequest'
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - Invalid input or business rule violation
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found in cart
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - Invalid item ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found in cart
 *       500:
 *         description: Internal server error
 */
router.put('/items/:itemId', validateItemId, validateUpdateQuantity, updateItemQuantity);
router.delete('/items/:itemId', validateItemId, removeItemFromCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/', clearCart);

/**
 * @swagger
 * /api/cart/apply-discount:
 *   post:
 *     summary: Apply discount code to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyDiscountRequest'
 *     responses:
 *       200:
 *         description: Discount applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - Invalid discount code or cart is empty
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/apply-discount', validateDiscountCode, applyDiscount);

/**
 * @swagger
 * /api/cart/discount:
 *   delete:
 *     summary: Remove discount from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Discount removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/discount', removeDiscount);

/**
 * @swagger
 * /api/cart/summary:
 *   get:
 *     summary: Get cart summary for checkout
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         itemCount:
 *                           type: integer
 *                         subtotal:
 *                           type: number
 *                         deliveryCost:
 *                           type: number
 *                         discount:
 *                           type: object
 *                         totalAmount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         items:
 *                           type: array
 *                         invalidItems:
 *                           type: array
 *       400:
 *         description: Bad request - Cart is empty
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/summary', getCartSummary);

/**
 * @swagger
 * /api/cart/validate:
 *   post:
 *     summary: Validate cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *                     invalidItems:
 *                       type: array
 *                     isValid:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/validate', validateCart);

// Update cart prices
router.post('/update-prices', updateCartPrices);

// Debug route (temporary - remove in production)
router.get('/debug/discounts', debugGetDiscounts);

export default router;
