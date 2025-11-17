import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  updateImageOrder,
  searchProducts,
  getFeaturedProducts,
  getLowStockProducts
} from '../controllers/productController.js';

import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { uploadProductImages as uploadMiddleware, uploadToCloudinary, handleUploadError } from '../middleware/productUpload.js';
import {
  validateProductCreation,
  validateProductUpdate,
  validateBulkPricing
} from '../middleware/productValidation.js';

const router = express.Router();

// Public routes
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [men, women, unisex]
 *         description: Filter by gender
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Filter by size
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *         description: Filter by material
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, price, totalSales, averageRating]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Products per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Products per page
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 8
 *         description: Number of featured products
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/featured', getFeaturedProducts);

/**
 * @swagger
 * /api/products/{id}/upload-images:
 *   post:
 *     summary: Upload product images
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (max 5 files, 5MB each)
 *               isMain:
 *                 type: string
 *                 description: Set first image as main image
 *               alt:
 *                 type: string
 *                 description: Alt text for images
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/:id/upload-images', authenticate, authorizeAdmin, uploadMiddleware, uploadToCloudinary, handleUploadError, uploadProductImages);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getProduct);

// Admin routes
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - brand
 *               - category
 *               - gender
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Premium Cotton T-Shirt"
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "High-quality cotton t-shirt perfect for everyday wear"
 *               shortDescription:
 *                 type: string
 *                 maxLength: 300
 *                 example: "Comfortable cotton t-shirt"
 *               brand:
 *                 type: string
 *                 maxLength: 100
 *                 example: "TrendBite"
 *               category:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7g8h9i0j1"
 *               gender:
 *                 type: string
 *                 enum: [men, women, unisex]
 *                 example: "unisex"
 *               material:
 *                 type: string
 *                 maxLength: 200
 *                 example: "100% Cotton"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["casual", "cotton", "comfortable"]
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - size
 *                     - color
 *                     - price
 *                     - stockQuantity
 *                   properties:
 *                     size:
 *                       type: string
 *                       example: "M"
 *                     color:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Red"
 *                         hex:
 *                           type: string
 *                           example: "#FF0000"
 *                     sku:
 *                       type: string
 *                       example: "TSHIRT-M-RED-001"
 *                     stockQuantity:
 *                       type: number
 *                       minimum: 0
 *                       example: 50
 *                     price:
 *                       type: object
 *                       properties:
 *                         regular:
 *                           type: number
 *                           minimum: 0
 *                           example: 29.99
 *                         sale:
 *                           type: number
 *                           minimum: 0
 *                           example: 24.99
 *               currency:
 *                 type: string
 *                 enum: [USD, LKR, EUR, GBP]
 *                 default: USD
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               discountPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 0
 *               bulkPricing:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     minQuantity:
 *                       type: number
 *                       minimum: 1
 *                     maxQuantity:
 *                       type: number
 *                       minimum: 1
 *                     discountType:
 *                       type: string
 *                       enum: [percentage, fixed]
 *                     discountValue:
 *                       type: number
 *                       minimum: 0
 *               lowStockThreshold:
 *                 type: number
 *                 minimum: 0
 *                 default: 10
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, authorizeAdmin, validateProductCreation, validateBulkPricing, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               shortDescription:
 *                 type: string
 *                 maxLength: 300
 *               brand:
 *                 type: string
 *                 maxLength: 100
 *               category:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [men, women, unisex]
 *               material:
 *                 type: string
 *                 maxLength: 200
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               discountPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               bulkPricing:
 *                 type: array
 *                 items:
 *                   type: object
 *               lowStockThreshold:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, authorizeAdmin, validateProductUpdate, validateBulkPricing, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);


/**
 * @swagger
 * /api/products/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete product image
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product or image not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/images/:imageId', authenticate, authorizeAdmin, deleteProductImage);

/**
 * @swagger
 * /api/products/{id}/images/order:
 *   put:
 *     summary: Update product image order
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageId:
 *                       type: string
 *                     order:
 *                       type: number
 *                     isMain:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Image order updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id/images/order', authenticate, authorizeAdmin, updateImageOrder);

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get low stock products (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Products per page
 *     responses:
 *       200:
 *         description: Low stock products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/low-stock', authenticate, authorizeAdmin, getLowStockProducts);

export default router;
