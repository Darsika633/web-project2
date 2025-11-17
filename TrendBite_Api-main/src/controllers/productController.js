import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      gender,
      minPrice,
      maxPrice,
      size,
      color,
      material,
      tags,
      search,
      status,
      isActive,
      isFeatured,
      skinTone,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const filters = {
      category,
      brand,
      gender,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      size,
      color,
      material,
      tags,
      search,
      status,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
      skinTone,
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    };

    const result = await Product.getFilteredProducts(filters);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name slug path")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get related products
    const relatedProducts = await Product.getRelatedProducts(id, 4);

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Validate category exists
    if (productData.category) {
      let category;

      // Check if category is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(productData.category)) {
        category = await Category.findById(productData.category);
      } else {
        // If not a valid ObjectId, try to find by name or slug
        category = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${productData.category}$`, "i") } },
            { slug: productData.category.toLowerCase() },
          ],
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            "Category not found. Please provide a valid category ID, name, or slug.",
        });
      }

      // Update the category field with the actual ObjectId
      productData.category = category._id;
    }

    // Sanitize boolean fields - convert empty strings to undefined
    const booleanFields = ["isActive", "isFeatured"];
    booleanFields.forEach((field) => {
      if (productData[field] === "") {
        delete productData[field];
      } else if (productData[field] !== undefined) {
        // Convert string representations to boolean
        if (typeof productData[field] === "string") {
          productData[field] = productData[field].toLowerCase() === "true";
        }
      }
    });

    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");
    }

    // Generate SKUs for variants if not provided
    if (productData.variants && productData.variants.length > 0) {
      productData.variants = productData.variants.map((variant, index) => {
        if (!variant.sku) {
          const baseSku = productData.name
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 6)
            .toUpperCase();
          variant.sku = `${baseSku}-${String(index + 1).padStart(3, "0")}`;
        }
        return variant;
      });
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name slug path"
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product: populatedProduct,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate category exists if provided
    if (updateData.category) {
      let category;

      // Check if category is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(updateData.category)) {
        category = await Category.findById(updateData.category);
      } else {
        // If not a valid ObjectId, try to find by name or slug
        category = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${updateData.category}$`, "i") } },
            { slug: updateData.category.toLowerCase() },
          ],
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            "Category not found. Please provide a valid category ID, name, or slug.",
        });
      }

      // Update the category field with the actual ObjectId
      updateData.category = category._id;
    }

    // Sanitize boolean fields - convert empty strings to undefined
    const booleanFields = ["isActive", "isFeatured"];
    booleanFields.forEach((field) => {
      if (updateData[field] === "") {
        delete updateData[field];
      } else if (updateData[field] !== undefined) {
        // Convert string representations to boolean
        if (typeof updateData[field] === "string") {
          updateData[field] = updateData[field].toLowerCase() === "true";
        }
      }
    });

    // Generate SKUs for new variants if not provided
    if (updateData.variants && updateData.variants.length > 0) {
      const existingProduct = await Product.findById(id);
      const existingSkus = existingProduct
        ? existingProduct.variants.map((v) => v.sku)
        : [];

      updateData.variants = updateData.variants.map((variant, index) => {
        if (!variant.sku) {
          const baseSku = (updateData.name || existingProduct?.name || "PROD")
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 6)
            .toUpperCase();

          let sku = `${baseSku}-${String(index + 1).padStart(3, "0")}`;
          let counter = 1;
          while (existingSkus.includes(sku)) {
            sku = `${baseSku}-${String(index + 1).padStart(3, "0")}-${counter}`;
            counter++;
          }
          variant.sku = sku;
        }
        return variant;
      });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug path");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    const allImages = [
      ...product.images,
      ...product.variants.flatMap((variant) => variant.images),
    ];

    for (const image of allImages) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update product image order
// @route   PUT /api/products/:id/images/order
// @access  Private/Admin
export const updateImageOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrders } = req.body; // Array of { imageId, order }

    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({
        success: false,
        message: "imageOrders must be an array",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update image orders
    imageOrders.forEach(({ imageId, order, isMain }) => {
      const image = product.images.find(
        (img) => img._id.toString() === imageId
      );
      if (image) {
        image.order = order;
        if (isMain !== undefined) {
          if (isMain) {
            // Unset other main images
            product.images.forEach((img) => {
              if (img._id.toString() !== imageId) {
                img.isMain = false;
              }
            });
          }
          image.isMain = isMain;
        }
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Image order updated successfully",
    });
  } catch (error) {
    console.error("Update image order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating image order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filters = {
      search: q.trim(),
      page: parseInt(page),
      limit: parseInt(limit),
      status: "published",
      isActive: true,
    };

    const result = await Product.getFilteredProducts(filters);

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const filters = {
      isFeatured: true,
      status: "published",
      isActive: true,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: parseInt(limit),
    };

    const result = await Product.getFilteredProducts(filters);

    res.status(200).json({
      success: true,
      message: "Featured products retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving featured products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
export const getLowStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find({
      status: "published",
      isActive: true,
      $expr: {
        $gt: ["$lowStockThreshold", "$totalStock"],
      },
    })
      .populate("category", "name slug")
      .sort({ totalStock: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments({
      status: "published",
      isActive: true,
      $expr: {
        $gt: ["$lowStockThreshold", "$totalStock"],
      },
    });

    res.status(200).json({
      success: true,
      message: "Low stock products retrieved successfully",
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving low stock products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Upload product images
// @route   POST /api/products/:id/upload-images
// @access  Private/Admin
export const uploadProductImages = async (req, res) => {
  try {
    console.log("Controller - uploadProductImages called");
    console.log("Controller - req.params:", req.params);
    console.log("Controller - req.cloudinaryResults:", req.cloudinaryResults);

    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      console.log("Product not found:", id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product found:", product.name);

    // Check if Cloudinary results are available (from middleware)
    if (!req.cloudinaryResults || req.cloudinaryResults.length === 0) {
      console.log("No cloudinary results found");
      return res.status(400).json({
        success: false,
        message: "No image files uploaded",
      });
    }

    console.log("Adding", req.cloudinaryResults.length, "images to product");

    // Add new images to product
    product.images.push(...req.cloudinaryResults);

    // Ensure only one main image
    const mainImages = product.images.filter((img) => img.isMain);
    if (mainImages.length > 1) {
      // Keep only the first main image
      let mainFound = false;
      product.images.forEach((img) => {
        if (img.isMain && !mainFound) {
          mainFound = true;
        } else if (img.isMain && mainFound) {
          img.isMain = false;
        }
      });
    }

    console.log("Saving product with", product.images.length, "total images");
    await product.save();
    console.log("Product saved successfully");

    res.status(200).json({
      success: true,
      message: "Product images uploaded successfully",
      data: {
        product: {
          _id: product._id,
          name: product.name,
          images: product.images,
        },
      },
    });
    console.log("Response sent successfully");
  } catch (error) {
    console.error("Upload product images error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading product images",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
export const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the image to delete
    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const imageToDelete = product.images[imageIndex];

    // Delete image from Cloudinary
    if (imageToDelete.public_id) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.public_id);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    // Remove image from product
    product.images.splice(imageIndex, 1);

    // If deleted image was main, set first remaining image as main
    if (imageToDelete.isMain && product.images.length > 0) {
      product.images[0].isMain = true;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
      data: {
        product: {
          _id: product._id,
          name: product.name,
          images: product.images,
        },
      },
    });
  } catch (error) {
    console.error("Delete product image error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
