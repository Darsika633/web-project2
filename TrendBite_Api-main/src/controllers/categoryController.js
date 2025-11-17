import Category from "../models/Category.js";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const filter = includeInactive === "true" ? {} : { isActive: true };

    const categories = await Category.find(filter)
      .populate("children")
      .populate("productsCount")
      .sort({ level: 1, sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving categories",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = async (req, res) => {
  try {
    const tree = await Category.getCategoryTree();

    res.status(200).json({
      success: true,
      message: "Category tree retrieved successfully",
      data: {
        tree,
      },
    });
  } catch (error) {
    console.error("Get category tree error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving category tree",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate("parent", "name slug path")
      .populate("children", "name slug path isActive")
      .populate("productsCount")
      .lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get breadcrumb
    const breadcrumb = await Category.getBreadcrumb(id);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: {
        category,
        breadcrumb,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };

    // Validate parent category exists if provided
    if (categoryData.parent) {
      const parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }

      // Check if adding this category would exceed max level
      if (parentCategory.level >= 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum category depth (3 levels) exceeded",
        });
      }
    }

    // Generate slug if not provided
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");
    }

    // Generate path if not provided
    if (!categoryData.path && categoryData.name) {
      if (categoryData.parent) {
        const parentCategory = await Category.findById(categoryData.parent);
        if (parentCategory) {
          categoryData.path = `${parentCategory.path} > ${categoryData.name}`;
          categoryData.level = parentCategory.level + 1;
        } else {
          categoryData.path = categoryData.name;
          categoryData.level = 0;
        }
      } else {
        categoryData.path = categoryData.name;
        categoryData.level = 0;
      }
    }

    const category = new Category(categoryData);
    await category.save();

    const populatedCategory = await Category.findById(category._id).populate(
      "parent",
      "name slug path"
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category: populatedCategory,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate parent category exists if provided
    if (updateData.parent) {
      if (updateData.parent === id) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be its own parent",
        });
      }

      const parentCategory = await Category.findById(updateData.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }

      // Check if adding this category would exceed max level
      if (parentCategory.level >= 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum category depth (3 levels) exceeded",
        });
      }
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("parent", "name slug path");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with subcategories. Please delete subcategories first.",
      });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with products. Please move or delete products first.",
      });
    }

    // Delete category image from Cloudinary if exists
    if (category.image && category.image.public_id) {
      try {
        const cloudinary = await import("../config/cloudinary.js");
        await cloudinary.default.uploader.destroy(category.image.public_id);
      } catch (error) {
        console.error("Error deleting category image from Cloudinary:", error);
      }
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get products by category
// @route   GET /api/categories/:id/products
// @access  Public
export const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice,
      brand,
      gender,
      size,
      color,
      skinTone,
    } = req.query;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const filters = {
      category: id,
      status: "published",
      isActive: true,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      brand,
      gender,
      size,
      color,
      skinTone,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await Product.getFilteredProducts(filters);

    res.status(200).json({
      success: true,
      message: "Category products retrieved successfully",
      data: {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          path: category.path,
        },
        ...result,
      },
    });
  } catch (error) {
    console.error("Get category products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving category products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Upload category image
// @route   POST /api/categories/:id/upload-image
// @access  Private/Admin
export const uploadCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Delete old image from Cloudinary if exists
    if (category.image && category.image.public_id) {
      try {
        await cloudinary.uploader.destroy(category.image.public_id);
      } catch (error) {
        console.error("Error deleting old category image:", error);
      }
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: `trendbite/categories/${id}`,
        transformation: [
          { width: 400, height: 400, crop: "fill", quality: "auto" },
        ],
        public_id: `category_${id}_${Date.now()}`,
      }
    );

    // Update category with new image
    category.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category image uploaded successfully",
      data: {
        category: {
          _id: category._id,
          name: category.name,
          image: category.image,
        },
      },
    });
  } catch (error) {
    console.error("Upload category image error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading category image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
