import mongoose from "mongoose";
import Category from "./Category.js";

const productVariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
    },
    color: {
      name: {
        type: String,
        required: [true, "Color name is required"],
        trim: true,
      },
      hex: {
        type: String,
        trim: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code"],
      },
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    price: {
      regular: {
        type: Number,
        required: [true, "Regular price is required"],
        min: [0, "Price cannot be negative"],
      },
      sale: {
        type: Number,
        min: [0, "Sale price cannot be negative"],
      },
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ["cm", "in"],
        default: "cm",
      },
    },
    images: [
      {
        public_id: String,
        url: String,
        alt: String,
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      min: [0, "Low stock threshold cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["men", "women", "unisex"],
      default: "unisex",
    },
    material: {
      type: String,
      trim: true,
      maxlength: [200, "Material description cannot exceed 200 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    suitableSkinTone: [
      {
        name: {
          type: String,
          trim: true,
        },
        hex: {
          type: String,
          trim: true,
          match: [
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            "Invalid hex color code",
          ],
        },
      },
    ],
    variants: [productVariantSchema],
    images: [
      {
        public_id: String,
        url: String,
        alt: String,
        order: {
          type: Number,
          default: 0,
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
      default: 0,
    },
    bulkPricing: [
      {
        minQuantity: {
          type: Number,
          required: true,
          min: [1, "Minimum quantity must be at least 1"],
        },
        maxQuantity: {
          type: Number,
          min: [1, "Maximum quantity must be at least 1"],
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
          required: true,
        },
        discountValue: {
          type: Number,
          required: true,
          min: [0, "Discount value cannot be negative"],
        },
      },
    ],
    currency: {
      type: String,
      required: true,
      enum: ["USD", "LKR", "EUR", "GBP"],
      default: "USD",
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Low stock threshold cannot be negative"],
    },
    totalStock: {
      type: Number,
      default: 0,
      min: [0, "Total stock cannot be negative"],
    },
    totalSales: {
      type: Number,
      default: 0,
      min: [0, "Total sales cannot be negative"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for main image
productSchema.virtual("mainImage").get(function () {
  const mainImage = this.images.find((img) => img.isMain);
  return mainImage || this.images[0] || null;
});

// Virtual for gallery images
productSchema.virtual("galleryImages").get(function () {
  return this.images
    .filter((img) => !img.isMain)
    .sort((a, b) => a.order - b.order);
});

// Virtual for available variants
productSchema.virtual("availableVariants").get(function () {
  if (!this.variants || !Array.isArray(this.variants)) {
    return [];
  }
  return this.variants.filter(
    (variant) => variant.isActive && variant.stockQuantity > 0
  );
});

// Virtual for out of stock variants
productSchema.virtual("outOfStockVariants").get(function () {
  if (!this.variants || !Array.isArray(this.variants)) {
    return [];
  }
  return this.variants.filter(
    (variant) => variant.isActive && variant.stockQuantity === 0
  );
});

// Virtual for low stock variants
productSchema.virtual("lowStockVariants").get(function () {
  if (!this.variants || !Array.isArray(this.variants)) {
    return [];
  }
  return this.variants.filter((variant) => {
    if (!variant.isActive || variant.stockQuantity <= 0) return false;

    // Use variant-specific threshold if available, otherwise use product threshold
    const threshold =
      variant.lowStockThreshold !== undefined
        ? variant.lowStockThreshold
        : this.lowStockThreshold;

    return variant.stockQuantity <= threshold;
  });
});

// Virtual for current price (considering sale price)
productSchema.virtual("currentPrice").get(function () {
  if (
    !this.variants ||
    !Array.isArray(this.variants) ||
    this.variants.length === 0
  ) {
    return 0;
  }
  const variant = this.variants[0];
  return variant.price.sale || variant.price.regular;
});

// Indexes for better performance
// Note: slug index is already created by unique: true in schema
// Note: variants.sku index is already created by unique: true in productVariantSchema
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ averageRating: -1 });

// Text index for search
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  tags: "text",
  material: "text",
});

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Generate slug from name if name is modified or slug doesn't exist
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }

  // Calculate total stock
  if (
    this.isModified("variants") &&
    this.variants &&
    Array.isArray(this.variants)
  ) {
    this.totalStock = this.variants.reduce((total, variant) => {
      return total + (variant.isActive ? variant.stockQuantity : 0);
    }, 0);
  }

  // Ensure only one main image
  if (this.isModified("images")) {
    const mainImages = this.images.filter((img) => img.isMain);
    if (mainImages.length > 1) {
      // Keep only the first main image
      this.images.forEach((img, index) => {
        if (index > 0 && img.isMain) {
          img.isMain = false;
        }
      });
    }
  }

  next();
});

// Static method to get products with filters
productSchema.statics.getFilteredProducts = async function (filters = {}) {
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
    status = "published",
    isActive = true,
    isFeatured,
    skinTone,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 12,
  } = filters;

  const query = { status, isActive };

  // Category filter
  if (category) {
    if (typeof category === "string") {
      // Check if category is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // If not a valid ObjectId, try to find by name or slug
        const categoryDoc = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${category}$`, "i") } },
            { slug: category.toLowerCase() },
          ],
        });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // If category not found, return empty results
          query.category = new mongoose.Types.ObjectId();
        }
      }
    } else if (Array.isArray(category)) {
      // Handle array of categories
      const categoryIds = [];
      for (const cat of category) {
        if (mongoose.Types.ObjectId.isValid(cat)) {
          categoryIds.push(cat);
        } else {
          const categoryDoc = await Category.findOne({
            $or: [
              { name: { $regex: new RegExp(`^${cat}$`, "i") } },
              { slug: cat.toLowerCase() },
            ],
          });
          if (categoryDoc) {
            categoryIds.push(categoryDoc._id);
          }
        }
      }
      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      } else {
        // If no valid categories found, return empty results
        query.category = new mongoose.Types.ObjectId();
      }
    }
  }

  // Brand filter
  if (brand) {
    if (typeof brand === "string") {
      query.brand = new RegExp(brand, "i");
    } else if (Array.isArray(brand)) {
      query.brand = { $in: brand.map((b) => new RegExp(b, "i")) };
    }
  }

  // Gender filter
  if (gender) {
    query.gender = { $in: Array.isArray(gender) ? gender : [gender] };
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query["variants.price.regular"] = {};
    if (minPrice !== undefined) query["variants.price.regular"].$gte = minPrice;
    if (maxPrice !== undefined) query["variants.price.regular"].$lte = maxPrice;
  }

  // Size filter
  if (size) {
    query["variants.size"] = { $in: Array.isArray(size) ? size : [size] };
  }

  // Color filter
  if (color) {
    query["variants.color.name"] = {
      $in: Array.isArray(color) ? color : [color],
    };
  }

  // Skin tone filter
  if (skinTone) {
    query["suitableSkinTone.name"] = {
      $in: Array.isArray(skinTone) ? skinTone : [skinTone],
    };
  }

  // Material filter
  if (material) {
    query.material = new RegExp(material, "i");
  }

  // Tags filter
  if (tags) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Featured filter
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured;
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Pagination
  const skip = (page - 1) * limit;

  const products = await this.find(query)
    .populate("category", "name slug path")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

// Static method to get related products
productSchema.statics.getRelatedProducts = async function (
  productId,
  limit = 4
) {
  const product = await this.findById(productId);
  if (!product) return [];

  return this.find({
    _id: { $ne: productId },
    $or: [
      { category: product.category },
      { brand: product.brand },
      { tags: { $in: product.tags } },
    ],
    status: "published",
    isActive: true,
  })
    .populate("category", "name slug")
    .limit(limit)
    .lean();
};

const Product = mongoose.model("Product", productSchema);

export default Product;
