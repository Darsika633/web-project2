import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3 // Maximum 3 levels deep
  },
  path: {
    type: String
  },
  image: {
    public_id: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Indexes for better performance
// Note: slug index is already created by unique: true in schema
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ isActive: 1 });

// Pre-save middleware to generate slug and path
categorySchema.pre('save', async function(next) {
  try {
    // Generate slug from name if name is modified or slug doesn't exist
    if (this.isModified('name') || !this.slug) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    // Generate path based on parent hierarchy
    if (this.isModified('parent') || this.isModified('name') || !this.path) {
      await this.generatePath();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to generate category path
categorySchema.methods.generatePath = async function() {
  if (!this.parent) {
    this.path = this.name;
    this.level = 0;
  } else {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.path = `${parent.path} > ${this.name}`;
      this.level = parent.level + 1;
    } else {
      // If parent not found, treat as root level
      this.path = this.name;
      this.level = 0;
    }
  }
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .sort({ level: 1, sortOrder: 1, name: 1 })
    .lean();

  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => (cat.parent && cat.parent.toString()) === (parentId && parentId.toString()))
      .map(cat => ({
        ...cat,
        children: buildTree(cat._id)
      }));
  };

  return buildTree();
};

// Static method to get breadcrumb path
categorySchema.statics.getBreadcrumb = async function(categoryId) {
  const breadcrumb = [];
  let current = await this.findById(categoryId);
  
  while (current) {
    breadcrumb.unshift({
      _id: current._id,
      name: current.name,
      slug: current.slug
    });
    current = current.parent ? await this.findById(current.parent) : null;
  }
  
  return breadcrumb;
};

const Category = mongoose.model('Category', categorySchema);

export default Category;