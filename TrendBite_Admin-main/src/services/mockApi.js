// Mock API responses for development when backend is not available

export const mockStats = {
  totalOrders: 1247,
  pendingOrders: 23,
  completedOrders: 1180,
  cancelledOrders: 44,
  totalRevenue: 45678.90,
  averageOrderValue: 36.65,
  ordersToday: 15,
  revenueToday: 549.75,
  topProducts: [
    {
      productId: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "Premium Cotton T-Shirt",
      totalSold: 245,
      revenue: 6122.55
    }
  ]
};

export const mockDiscounts = [
  {
    _id: "discount_1",
    code: "SAVE10",
    name: "10% Off Everything",
    description: "Get 10% off on all products",
    type: "percentage",
    value: 10,
    minimumOrderAmount: 50,
    maximumDiscountAmount: 100,
    usageLimit: 1000,
    usedCount: 245,
    totalSavings: 2450.00,
    validFrom: "2023-09-01T00:00:00Z",
    validUntil: "2023-12-31T23:59:59Z",
    isPublic: true,
    isActive: true,
    applicableProducts: [],
    applicableCategories: ["64f1a2b3c4d5e6f7g8h9i0j1"],
    applicableUsers: [],
    createdBy: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Admin",
      lastName: "User"
    },
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-15T14:30:00Z",
    __v: 0
  },
  {
    _id: "discount_2",
    code: "WELCOME20",
    name: "Welcome Discount",
    description: "Special welcome discount for new customers",
    type: "percentage",
    value: 20,
    minimumOrderAmount: 100,
    maximumDiscountAmount: 200,
    usageLimit: 500,
    usedCount: 89,
    totalSavings: 1780.00,
    validFrom: "2023-09-15T00:00:00Z",
    validUntil: "2023-10-15T23:59:59Z",
    isPublic: true,
    isActive: true,
    applicableProducts: [],
    applicableCategories: [],
    applicableUsers: [],
    createdBy: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Admin",
      lastName: "User"
    },
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
    __v: 0
  },
  {
    _id: "discount_3",
    code: "FREESHIP",
    name: "Free Shipping",
    description: "Free shipping on orders over $75",
    type: "fixed",
    value: 5.99,
    minimumOrderAmount: 75,
    maximumDiscountAmount: 5.99,
    usageLimit: null,
    usedCount: 156,
    totalSavings: 934.44,
    validFrom: "2023-08-01T00:00:00Z",
    validUntil: "2023-11-30T23:59:59Z",
    isPublic: true,
    isActive: true,
    applicableProducts: [],
    applicableCategories: [],
    applicableUsers: [],
    createdBy: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Admin",
      lastName: "User"
    },
    createdAt: "2023-08-01T10:00:00Z",
    updatedAt: "2023-09-10T16:20:00Z",
    __v: 0
  },
  {
    _id: "discount_4",
    code: "SUMMER25",
    name: "Summer Sale",
    description: "25% off summer collection",
    type: "percentage",
    value: 25,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 250,
    usageLimit: 200,
    usedCount: 45,
    totalSavings: 1125.00,
    validFrom: "2023-06-01T00:00:00Z",
    validUntil: "2023-08-31T23:59:59Z",
    isPublic: true,
    isActive: false,
    applicableProducts: ["64f1a2b3c4d5e6f7g8h9i0j2"],
    applicableCategories: ["64f1a2b3c4d5e6f7g8h9i0j1"],
    applicableUsers: [],
    createdBy: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Admin",
      lastName: "User"
    },
    createdAt: "2023-06-01T10:00:00Z",
    updatedAt: "2023-08-31T23:59:59Z",
    __v: 0
  },
  {
    _id: "discount_5",
    code: "VIP15",
    name: "VIP Customer Discount",
    description: "Exclusive discount for VIP customers",
    type: "percentage",
    value: 15,
    minimumOrderAmount: 200,
    maximumDiscountAmount: 300,
    usageLimit: 100,
    usedCount: 12,
    totalSavings: 360.00,
    validFrom: "2023-09-01T00:00:00Z",
    validUntil: "2023-12-31T23:59:59Z",
    isPublic: false,
    isActive: true,
    applicableProducts: [],
    applicableCategories: [],
    applicableUsers: ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"],
    createdBy: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Admin",
      lastName: "User"
    },
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-15T14:30:00Z",
    __v: 0
  }
];

export const mockUsers = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "customer",
    isActive: true,
    avatar: {
      url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    createdAt: "2023-09-01T10:00:00Z",
    lastLogin: "2023-09-15T14:30:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    role: "customer",
    isActive: true,
    avatar: {
      url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    createdAt: "2023-09-02T10:00:00Z",
    lastLogin: "2023-09-14T16:20:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    firstName: "Admin",
    lastName: "User",
    email: "admin@trendbite.com",
    role: "admin",
    isActive: true,
    avatar: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    createdAt: "2023-08-15T10:00:00Z",
    lastLogin: "2023-09-15T18:45:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@trendbite.com",
    role: "deliveryperson",
    isActive: true,
    phone: "+1-555-0123",
    avatar: {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    stats: {
      totalAssigned: 45,
      totalDelivered: 42,
      deliveryRate: 93,
      averageDeliveryTime: 1800000 // 30 minutes in milliseconds
    },
    createdAt: "2023-08-20T10:00:00Z",
    lastLogin: "2023-09-15T16:30:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j5",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@trendbite.com",
    role: "deliveryperson",
    isActive: true,
    phone: "+1-555-0124",
    avatar: {
      url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    stats: {
      totalAssigned: 38,
      totalDelivered: 35,
      deliveryRate: 92,
      averageDeliveryTime: 1950000 // 32.5 minutes in milliseconds
    },
    createdAt: "2023-08-25T10:00:00Z",
    lastLogin: "2023-09-15T15:45:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j6",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@trendbite.com",
    role: "deliveryperson",
    isActive: false,
    phone: "+1-555-0125",
    avatar: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    stats: {
      totalAssigned: 22,
      totalDelivered: 18,
      deliveryRate: 82,
      averageDeliveryTime: 2100000 // 35 minutes in milliseconds
    },
    createdAt: "2023-09-01T10:00:00Z",
    lastLogin: "2023-09-10T12:00:00Z"
  }
];

export const mockProducts = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    name: "Premium Cotton T-Shirt",
    description: "High-quality cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a comfortable fit and modern design.",
    shortDescription: "Comfortable cotton t-shirt",
    brand: "TrendBite",
    category: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      name: "T-Shirts"
    },
    gender: "unisex",
    material: "100% Organic Cotton",
    tags: ["casual", "cotton", "comfortable", "organic"],
    variants: [
      {
        size: "M",
        color: { name: "Red", hex: "#FF0000" },
        sku: "TSHIRT-M-RED-001",
        stockQuantity: 50,
        price: { regular: 29.99, sale: 24.99 }
      },
      {
        size: "L",
        color: { name: "Red", hex: "#FF0000" },
        sku: "TSHIRT-L-RED-001",
        stockQuantity: 30,
        price: { regular: 29.99, sale: 24.99 }
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        isMain: true,
        order: 1
      }
    ],
    averageRating: 4.5,
    totalSales: 150,
    isFeatured: true,
    status: "published",
    createdAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    name: "Classic Denim Jeans",
    description: "Comfortable and stylish denim jeans made from premium denim fabric. Perfect for casual wear with a modern fit.",
    shortDescription: "Stylish denim jeans",
    brand: "TrendBite",
    category: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j4",
      name: "Jeans"
    },
    gender: "unisex",
    material: "98% Cotton, 2% Elastane",
    tags: ["denim", "casual", "comfortable", "premium"],
    variants: [
      {
        size: "L",
        color: { name: "Blue", hex: "#0000FF" },
        sku: "JEANS-L-BLUE-001",
        stockQuantity: 25,
        price: { regular: 79.99, sale: 69.99 }
      },
      {
        size: "XL",
        color: { name: "Blue", hex: "#0000FF" },
        sku: "JEANS-XL-BLUE-001",
        stockQuantity: 15,
        price: { regular: 79.99, sale: 69.99 }
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        isMain: true,
        order: 1
      }
    ],
    averageRating: 4.2,
    totalSales: 89,
    isFeatured: false,
    status: "published",
    createdAt: "2023-09-02T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    name: "Running Sneakers",
    description: "High-performance running sneakers with advanced cushioning technology. Perfect for athletes and fitness enthusiasts.",
    shortDescription: "High-performance running shoes",
    brand: "TrendBite",
    category: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j5",
      name: "Shoes"
    },
    gender: "unisex",
    material: "Mesh Upper, Rubber Sole",
    tags: ["running", "sports", "athletic", "performance"],
    variants: [
      {
        size: "9",
        color: { name: "White", hex: "#FFFFFF" },
        sku: "SNEAKER-9-WHITE-001",
        stockQuantity: 8,
        price: { regular: 129.99, sale: 109.99 }
      },
      {
        size: "10",
        color: { name: "White", hex: "#FFFFFF" },
        sku: "SNEAKER-10-WHITE-001",
        stockQuantity: 5,
        price: { regular: 129.99, sale: 109.99 }
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        isMain: true,
        order: 1
      }
    ],
    averageRating: 4.7,
    totalSales: 203,
    isFeatured: true,
    status: "published",
    createdAt: "2023-09-03T10:00:00Z"
  }
];

export const mockOrders = [
  {
    _id: "order123",
    orderNumber: "TB-2023-001234",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    },
    items: [
      {
        _id: "item123",
        product: {
          _id: "64f1a2b3c4d5e6f7g8h9i0j2",
          name: "Premium Cotton T-Shirt",
          images: [
            {
              url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
              isMain: true
            }
          ]
        },
        variant: {
          size: "M",
          color: { name: "Red", hex: "#FF0000" },
          sku: "TSHIRT-M-RED-001"
        },
        quantity: 2,
        unitPrice: 24.99,
        totalPrice: 49.98
      }
    ],
    subtotal: 49.98,
    deliveryCost: 5.99,
    discount: {
      code: "SAVE10",
      amount: 4.99,
      type: "percentage"
    },
    totalAmount: 50.98,
    status: "pending",
    paymentStatus: "pending",
    shippingStatus: "not_shipped",
    deliveryAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US"
    },
    trackingInfo: null,
    paymentDetails: null,
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z"
  },
  {
    _id: "order124",
    orderNumber: "TB-2023-001235",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com"
    },
    items: [
      {
        _id: "item124",
        product: {
          _id: "64f1a2b3c4d5e6f7g8h9i0j3",
          name: "Classic Denim Jeans",
          images: [
            {
              url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
              isMain: true
            }
          ]
        },
        variant: {
          size: "L",
          color: { name: "Blue", hex: "#0000FF" },
          sku: "JEANS-L-BLUE-001"
        },
        quantity: 1,
        unitPrice: 69.99,
        totalPrice: 69.99
      }
    ],
    subtotal: 69.99,
    deliveryCost: 5.99,
    discount: null,
    totalAmount: 75.98,
    status: "processing",
    paymentStatus: "paid",
    shippingStatus: "shipped",
    deliveryAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "US"
    },
    trackingInfo: {
      trackingNumber: "1Z999AA1234567890",
      carrier: "UPS",
      estimatedDelivery: "2023-09-20T18:00:00Z",
      shippingMethod: "standard"
    },
    paymentDetails: {
      method: "credit_card",
      transactionId: "txn_1234567890",
      paidAt: "2023-09-15T10:15:00Z"
    },
    shippedAt: "2023-09-15T16:00:00Z",
    createdAt: "2023-09-15T09:30:00Z",
    updatedAt: "2023-09-15T16:00:00Z"
  },
  {
    _id: "order125",
    orderNumber: "TB-2023-001236",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    },
    items: [
      {
        _id: "item125",
        product: {
          _id: "64f1a2b3c4d5e6f7g8h9i0j4",
          name: "Running Sneakers",
          images: [
            {
              url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
              isMain: true
            }
          ]
        },
        variant: {
          size: "9",
          color: { name: "White", hex: "#FFFFFF" },
          sku: "SNEAKER-9-WHITE-001"
        },
        quantity: 1,
        unitPrice: 109.99,
        totalPrice: 109.99
      }
    ],
    subtotal: 109.99,
    deliveryCost: 0,
    discount: {
      code: "FREESHIP",
      amount: 5.99,
      type: "fixed"
    },
    totalAmount: 109.99,
    status: "delivered",
    paymentStatus: "paid",
    shippingStatus: "delivered",
    deliveryAddress: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "US"
    },
    trackingInfo: {
      trackingNumber: "1Z999AA9876543210",
      carrier: "FedEx",
      estimatedDelivery: "2023-09-18T14:00:00Z",
      shippingMethod: "express"
    },
    paymentDetails: {
      method: "paypal",
      transactionId: "txn_paypal_9876543210",
      paidAt: "2023-09-14T15:30:00Z"
    },
    shippedAt: "2023-09-14T18:00:00Z",
    createdAt: "2023-09-14T15:00:00Z",
    updatedAt: "2023-09-18T14:00:00Z"
  }
];

export const mockCategories = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j1",
    name: "Clothing",
    description: "All types of clothing and apparel",
    image: {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
      public_id: "category_clothing"
    },
    isActive: true,
    sortOrder: 1,
    productCount: 45,
    parent: null,
    children: [
      {
        _id: "64f1a2b3c4d5e6f7g8h9i0j2",
        name: "T-Shirts",
        description: "Comfortable and stylish t-shirts",
        productCount: 25,
        isActive: true
      },
      {
        _id: "64f1a2b3c4d5e6f7g8h9i0j3",
        name: "Jeans",
        description: "Classic and modern denim jeans",
        productCount: 20,
        isActive: true
      }
    ],
    seoTitle: "Clothing - Fashion & Apparel",
    seoDescription: "Shop our wide selection of clothing and apparel",
    seoKeywords: ["clothing", "apparel", "fashion", "style"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    name: "T-Shirts",
    description: "Comfortable and stylish t-shirts for everyday wear",
    image: {
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      public_id: "category_tshirts"
    },
    isActive: true,
    sortOrder: 1,
    productCount: 25,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      name: "Clothing"
    },
    children: [
      {
        _id: "64f1a2b3c4d5e6f7g8h9i0j4",
        name: "Men's T-Shirts",
        description: "T-shirts designed for men",
        productCount: 15,
        isActive: true
      },
      {
        _id: "64f1a2b3c4d5e6f7g8h9i0j5",
        name: "Women's T-Shirts",
        description: "T-shirts designed for women",
        productCount: 10,
        isActive: true
      }
    ],
    seoTitle: "T-Shirts - Comfortable & Stylish",
    seoDescription: "Shop our collection of comfortable and stylish t-shirts",
    seoKeywords: ["t-shirts", "cotton", "comfortable", "stylish"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    name: "Jeans",
    description: "Classic and modern denim jeans",
    image: {
      url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      public_id: "category_jeans"
    },
    isActive: true,
    sortOrder: 2,
    productCount: 20,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      name: "Clothing"
    },
    children: [],
    seoTitle: "Jeans - Classic Denim Collection",
    seoDescription: "Shop our premium collection of denim jeans",
    seoKeywords: ["jeans", "denim", "classic", "modern"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    name: "Men's T-Shirts",
    description: "T-shirts designed specifically for men",
    image: {
      url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop",
      public_id: "category_mens_tshirts"
    },
    isActive: true,
    sortOrder: 1,
    productCount: 15,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "T-Shirts"
    },
    children: [],
    seoTitle: "Men's T-Shirts - Comfortable Fit",
    seoDescription: "Premium t-shirts designed for men",
    seoKeywords: ["mens", "t-shirts", "comfortable", "fit"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j5",
    name: "Women's T-Shirts",
    description: "T-shirts designed specifically for women",
    image: {
      url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      public_id: "category_womens_tshirts"
    },
    isActive: true,
    sortOrder: 2,
    productCount: 10,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "T-Shirts"
    },
    children: [],
    seoTitle: "Women's T-Shirts - Stylish & Comfortable",
    seoDescription: "Fashionable t-shirts designed for women",
    seoKeywords: ["womens", "t-shirts", "stylish", "fashionable"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j6",
    name: "Shoes",
    description: "Footwear for all occasions",
    image: {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      public_id: "category_shoes"
    },
    isActive: true,
    sortOrder: 2,
    productCount: 30,
    parent: null,
    children: [
      {
        _id: "64f1a2b3c4d5e6f7g8h9i0j7",
        name: "Sneakers",
        description: "Comfortable athletic shoes",
        productCount: 20,
        isActive: true
      },
      {
        _id: "64f1a2b3c4d5e6f7g8h9i0j8",
        name: "Boots",
        description: "Durable and stylish boots",
        productCount: 10,
        isActive: true
      }
    ],
    seoTitle: "Shoes - Footwear Collection",
    seoDescription: "Shop our wide selection of shoes and footwear",
    seoKeywords: ["shoes", "footwear", "sneakers", "boots"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j7",
    name: "Sneakers",
    description: "Comfortable athletic shoes for sports and casual wear",
    image: {
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      public_id: "category_sneakers"
    },
    isActive: true,
    sortOrder: 1,
    productCount: 20,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j6",
      name: "Shoes"
    },
    children: [],
    seoTitle: "Sneakers - Athletic Footwear",
    seoDescription: "High-quality sneakers for sports and casual wear",
    seoKeywords: ["sneakers", "athletic", "sports", "casual"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j8",
    name: "Boots",
    description: "Durable and stylish boots for all seasons",
    image: {
      url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop",
      public_id: "category_boots"
    },
    isActive: true,
    sortOrder: 2,
    productCount: 10,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j6",
      name: "Shoes"
    },
    children: [],
    seoTitle: "Boots - Durable Footwear",
    seoDescription: "Stylish and durable boots for all occasions",
    seoKeywords: ["boots", "durable", "stylish", "footwear"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j9",
    name: "Accessories",
    description: "Fashion accessories to complete your look",
    image: {
      url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      public_id: "category_accessories"
    },
    isActive: true,
    sortOrder: 3,
    productCount: 15,
    parent: null,
    children: [],
    seoTitle: "Accessories - Fashion & Style",
    seoDescription: "Complete your look with our fashion accessories",
    seoKeywords: ["accessories", "fashion", "style", "jewelry"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j10",
    name: "Jackets",
    description: "Outerwear for all seasons",
    image: null,
    isActive: false,
    sortOrder: 3,
    productCount: 8,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      name: "Clothing"
    },
    children: [],
    seoTitle: "Jackets - Outerwear Collection",
    seoDescription: "Stylish jackets and outerwear for all seasons",
    seoKeywords: ["jackets", "outerwear", "coats", "winter"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j11",
    name: "Hats",
    description: "Headwear and caps for all occasions",
    image: {
      url: null,
      public_id: "category_hats"
    },
    isActive: true,
    sortOrder: 4,
    productCount: 12,
    parent: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j9",
      name: "Accessories"
    },
    children: [],
    seoTitle: "Hats - Headwear Collection",
    seoDescription: "Stylish hats and caps for all occasions",
    seoKeywords: ["hats", "caps", "headwear", "accessories"],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z"
  }
];

export const mockReviews = [
  {
    _id: "review123",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      avatar: {
        url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      }
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "Premium Cotton T-Shirt",
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 5,
    title: "Excellent quality!",
    description: "Great t-shirt, very comfortable and fits perfectly. The material is soft and the color is exactly as shown. Would definitely buy again!",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop"
      },
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
      }
    ],
    isVerified: true,
    status: "approved",
    helpfulCount: 12,
    adminReply: {
      message: "Thank you for your feedback! We're glad you love the product.",
      repliedBy: {
        firstName: "Admin",
        lastName: "User"
      },
      repliedAt: "2023-09-15T14:00:00Z"
    },
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T14:00:00Z"
  },
  {
    _id: "review124",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      avatar: {
        url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      }
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      name: "Classic Denim Jeans",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 4,
    title: "Good quality jeans",
    description: "Nice jeans, comfortable fit. The material feels durable. Only issue is the sizing runs a bit small, would recommend ordering one size up.",
    images: [],
    isVerified: true,
    status: "pending",
    helpfulCount: 5,
    adminReply: null,
    createdAt: "2023-09-14T15:30:00Z",
    updatedAt: "2023-09-14T15:30:00Z"
  },
  {
    _id: "review125",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      avatar: {
        url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      }
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j4",
      name: "Running Sneakers",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 5,
    title: "Perfect running shoes!",
    description: "These sneakers are amazing for running. Great cushioning and very comfortable. I've been using them for my daily runs and they've held up really well.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"
      }
    ],
    isVerified: true,
    status: "approved",
    helpfulCount: 8,
    adminReply: null,
    createdAt: "2023-09-13T12:00:00Z",
    updatedAt: "2023-09-13T12:00:00Z"
  },
  {
    _id: "review126",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      avatar: {
        url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      }
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "Premium Cotton T-Shirt",
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 2,
    title: "Disappointed with quality",
    description: "The shirt arrived with a small hole and the fabric feels thin. For the price, I expected better quality. Customer service was helpful though.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop"
      }
    ],
    isVerified: true,
    status: "rejected",
    rejectionReason: "Contains negative feedback about product defects",
    helpfulCount: 3,
    adminReply: {
      message: "We apologize for the quality issue. Please contact our customer service for a replacement or refund.",
      repliedBy: {
        firstName: "Admin",
        lastName: "User"
      },
      repliedAt: "2023-09-12T16:30:00Z"
    },
    createdAt: "2023-09-12T14:20:00Z",
    updatedAt: "2023-09-12T16:30:00Z"
  },
  {
    _id: "review127",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@example.com",
      avatar: null
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      name: "Classic Denim Jeans",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 3,
    title: "Average jeans",
    description: "Decent jeans for the price. Nothing special but gets the job done. The fit is okay but could be better.",
    images: [],
    isVerified: false,
    status: "pending",
    helpfulCount: 1,
    adminReply: null,
    createdAt: "2023-09-11T09:45:00Z",
    updatedAt: "2023-09-11T09:45:00Z"
  },
  {
    _id: "review128",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      avatar: {
        url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      }
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j4",
      name: "Running Sneakers",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 4,
    title: "Great sneakers",
    description: "Really comfortable sneakers. Good for both running and casual wear. The design is sleek and modern.",
    images: [],
    isVerified: true,
    status: "approved",
    helpfulCount: 6,
    adminReply: null,
    createdAt: "2023-09-10T18:15:00Z",
    updatedAt: "2023-09-10T18:15:00Z"
  },
  {
    _id: "review129",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      avatar: {
        url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      }
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "Premium Cotton T-Shirt",
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 5,
    title: "Love this shirt!",
    description: "Perfect fit and amazing quality. The cotton is so soft and comfortable. I've already ordered two more in different colors!",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
      }
    ],
    isVerified: true,
    status: "approved",
    helpfulCount: 15,
    adminReply: {
      message: "Thank you for your wonderful feedback! We're thrilled you love the quality.",
      repliedBy: {
        firstName: "Admin",
        lastName: "User"
      },
      repliedAt: "2023-09-09T11:20:00Z"
    },
    createdAt: "2023-09-09T10:30:00Z",
    updatedAt: "2023-09-09T11:20:00Z"
  },
  {
    _id: "review130",
    user: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@example.com",
      avatar: null
    },
    product: {
      _id: "64f1a2b3c4d5e6f7g8h9i0j4",
      name: "Running Sneakers",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          isMain: true
        }
      ]
    },
    rating: 1,
    title: "Poor quality",
    description: "These shoes fell apart after just two weeks of light use. The sole separated from the upper. Very disappointed.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"
      }
    ],
    isVerified: true,
    status: "pending",
    helpfulCount: 2,
    adminReply: null,
    createdAt: "2023-09-08T16:45:00Z",
    updatedAt: "2023-09-08T16:45:00Z"
  }
];

// Mock API functions
export const mockApi = {
  getStats: () => Promise.resolve({
    data: {
      success: true,
      message: "Order statistics retrieved successfully",
      data: {
        stats: mockStats
      }
    }
  }),
  
  getUsers: (params) => Promise.resolve({
    data: {
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: mockUsers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalUsers: mockUsers.length,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  }),

  createUser: (data) => Promise.resolve({
    data: {
      success: true,
      message: "User created successfully",
      data: {
        user: {
          _id: `mock_${Date.now()}`,
          ...data,
          role: data.role || 'customer',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: null
        }
      }
    }
  }),

  deleteUser: (userId) => Promise.resolve({
    data: {
      success: true,
      message: "User deleted successfully",
      data: {
        user: {
          _id: userId,
          deleted: true
        }
      }
    }
  }),
  
  getProducts: (params) => Promise.resolve({
    data: {
      success: true,
      message: "Products retrieved successfully",
      data: {
        products: mockProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProducts: mockProducts.length,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  }),

  createProduct: (data) => Promise.resolve({
    data: {
      success: true,
      message: "Product created successfully",
      data: {
        product: {
          _id: `mock_${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }
  }),

  uploadProductImages: (productId, formData) => Promise.resolve({
    data: {
      success: true,
      message: "Images uploaded successfully",
      data: {
        images: [
          {
            _id: `img_${Date.now()}`,
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
            public_id: `product_${productId}_1`,
            isMain: true,
            order: 1
          }
        ]
      }
    }
  }),

  updateProduct: (productId, data) => Promise.resolve({
    data: {
      success: true,
      message: "Product updated successfully",
      data: {
        product: {
          _id: productId,
          ...data,
          updatedAt: new Date().toISOString()
        }
      }
    }
  }),

  deleteProduct: (productId) => Promise.resolve({
    data: {
      success: true,
      message: "Product deleted successfully",
      data: {
        product: {
          _id: productId,
          deleted: true
        }
      }
    }
  }),

  // Order Management Mock Functions
  getOrders: (params) => Promise.resolve({
    data: {
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders: mockOrders,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalOrders: mockOrders.length,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  }),

  getOrderById: (orderId) => Promise.resolve({
    data: {
      success: true,
      message: "Order retrieved successfully",
      data: {
        order: mockOrders.find(order => order._id === orderId) || mockOrders[0]
      }
    }
  }),

  updateOrderStatus: (orderId, data) => Promise.resolve({
    data: {
      success: true,
      message: "Order status updated successfully",
      data: {
        order: {
          _id: orderId,
          status: data.status,
          updatedAt: new Date().toISOString(),
          ...data
        }
      }
    }
  }),

  updateOrderShipping: (orderId, data) => Promise.resolve({
    data: {
      success: true,
      message: "Shipping details updated successfully",
      data: {
        order: {
          _id: orderId,
          trackingInfo: data,
          shippingStatus: 'shipped',
          shippedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }
  }),

  updateOrderPayment: (orderId, data) => Promise.resolve({
    data: {
      success: true,
      message: "Payment details updated successfully",
      data: {
        order: {
          _id: orderId,
          paymentStatus: data.paymentStatus,
          paymentDetails: data,
          updatedAt: new Date().toISOString()
        }
      }
    }
  }),

  // Category Management Mock Functions
  getCategories: (params = {}) => {
    let filteredCategories = [...mockCategories];
    
    // Apply search filter
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredCategories = filteredCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (params?.isActive !== undefined) {
      filteredCategories = filteredCategories.filter(category =>
        category.isActive === params.isActive
      );
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Categories retrieved successfully",
        data: {
          categories: paginatedCategories,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredCategories.length / limit),
            totalCategories: filteredCategories.length,
            hasNext: endIndex < filteredCategories.length,
            hasPrev: page > 1
          }
        }
      }
    });
  },

  getCategoryById: (categoryId) => {
    const category = mockCategories.find(cat => cat._id === categoryId);
    return Promise.resolve({
      data: {
        success: true,
        message: "Category retrieved successfully",
        data: {
          category: category || mockCategories[0]
        }
      }
    });
  },

  getCategoryProducts: (categoryId, params) => {
    // Mock products for the category
    const categoryProducts = mockProducts.filter(product => 
      product.category._id === categoryId
    );
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Category products retrieved successfully",
        data: {
          products: categoryProducts.slice(0, params?.limit || 10)
        }
      }
    });
  },

  createCategory: (data) => {
    const newCategory = {
      _id: `mock_${Date.now()}`,
      ...data,
      productCount: 0,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCategories.push(newCategory);
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Category created successfully",
        data: {
          category: newCategory
        }
      }
    });
  },

  updateCategory: (categoryId, data) => {
    const categoryIndex = mockCategories.findIndex(cat => cat._id === categoryId);
    if (categoryIndex !== -1) {
      mockCategories[categoryIndex] = {
        ...mockCategories[categoryIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Category updated successfully",
        data: {
          category: mockCategories[categoryIndex] || mockCategories[0]
        }
      }
    });
  },

  deleteCategory: (categoryId) => {
    const categoryIndex = mockCategories.findIndex(cat => cat._id === categoryId);
    if (categoryIndex !== -1) {
      mockCategories.splice(categoryIndex, 1);
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Category deleted successfully",
        data: {
          category: {
            _id: categoryId,
            deleted: true
          }
        }
      }
    });
  },

  uploadCategoryImage: (categoryId, formData) => {
    return Promise.resolve({
      data: {
        success: true,
        message: "Category image uploaded successfully",
        data: {
          category: {
            _id: categoryId,
            image: {
              url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
              public_id: `category_${categoryId}_${Date.now()}`
            }
          }
        }
      }
    });
  },

  // Review Management Mock Functions
  getReviews: (params = {}) => {
    let filteredReviews = [...mockReviews];
    
    // Apply search filter
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredReviews = filteredReviews.filter(review =>
        review.title.toLowerCase().includes(searchTerm) ||
        review.description.toLowerCase().includes(searchTerm) ||
        review.user.firstName.toLowerCase().includes(searchTerm) ||
        review.user.lastName.toLowerCase().includes(searchTerm) ||
        review.product.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (params?.status && params.status !== 'all') {
      filteredReviews = filteredReviews.filter(review =>
        review.status === params.status
      );
    }
    
    // Apply rating filter
    if (params?.rating && params.rating !== 'all') {
      filteredReviews = filteredReviews.filter(review =>
        review.rating === parseInt(params.rating)
      );
    }
    
    // Apply sorting
    if (params?.sortBy && params?.sortOrder) {
      filteredReviews.sort((a, b) => {
        let aValue = a[params.sortBy];
        let bValue = b[params.sortBy];
        
        if (params.sortBy === 'createdAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (params.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Reviews retrieved successfully",
        data: {
          reviews: paginatedReviews,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredReviews.length / limit),
            totalReviews: filteredReviews.length,
            hasNext: endIndex < filteredReviews.length,
            hasPrev: page > 1
          }
        }
      }
    });
  },

  getReviewById: (reviewId) => {
    const review = mockReviews.find(r => r._id === reviewId);
    return Promise.resolve({
      data: {
        success: true,
        message: "Review retrieved successfully",
        data: {
          review: review || mockReviews[0]
        }
      }
    });
  },

  approveReview: (reviewId) => {
    const reviewIndex = mockReviews.findIndex(r => r._id === reviewId);
    if (reviewIndex !== -1) {
      mockReviews[reviewIndex].status = 'approved';
      mockReviews[reviewIndex].updatedAt = new Date().toISOString();
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Review approved successfully",
        data: {
          review: mockReviews[reviewIndex] || mockReviews[0]
        }
      }
    });
  },

  rejectReview: (reviewId, reason) => {
    const reviewIndex = mockReviews.findIndex(r => r._id === reviewId);
    if (reviewIndex !== -1) {
      mockReviews[reviewIndex].status = 'rejected';
      mockReviews[reviewIndex].rejectionReason = reason;
      mockReviews[reviewIndex].updatedAt = new Date().toISOString();
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Review rejected successfully",
        data: {
          review: mockReviews[reviewIndex] || mockReviews[0]
        }
      }
    });
  },

  addReplyToReview: (reviewId, data) => {
    const reviewIndex = mockReviews.findIndex(r => r._id === reviewId);
    if (reviewIndex !== -1) {
      mockReviews[reviewIndex].adminReply = {
        message: data.message,
        repliedBy: {
          firstName: "Admin",
          lastName: "User"
        },
        repliedAt: new Date().toISOString()
      };
      mockReviews[reviewIndex].updatedAt = new Date().toISOString();
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Admin reply added successfully",
        data: {
          review: mockReviews[reviewIndex] || mockReviews[0]
        }
      }
    });
  },

  // Discount Management
  getDiscounts: (params = {}) => {
    const { page = 1, limit = 20, search, isActive, type } = params;
    
    let filteredDiscounts = [...mockDiscounts];
    
    // Apply filters
    if (search) {
      filteredDiscounts = filteredDiscounts.filter(discount => 
        discount.code.toLowerCase().includes(search.toLowerCase()) ||
        discount.name.toLowerCase().includes(search.toLowerCase()) ||
        discount.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (isActive !== undefined) {
      filteredDiscounts = filteredDiscounts.filter(discount => discount.isActive === isActive);
    }
    
    if (type) {
      filteredDiscounts = filteredDiscounts.filter(discount => discount.type === type);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount codes retrieved successfully",
        data: paginatedDiscounts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredDiscounts.length / limit),
          totalDiscounts: filteredDiscounts.length,
          hasNextPage: endIndex < filteredDiscounts.length,
          hasPrevPage: page > 1
        }
      }
    });
  },

  getDiscountById: (discountId) => {
    const discount = mockDiscounts.find(d => d._id === discountId);
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount retrieved successfully",
        data: {
          discount: discount || mockDiscounts[0]
        }
      }
    });
  },

  createDiscount: (discountData) => {
    const newDiscount = {
      _id: `discount_${Date.now()}`,
      ...discountData,
      usedCount: 0,
      totalSavings: 0,
      isActive: true,
      createdBy: {
        _id: "64f1a2b3c4d5e6f7g8h9i0j3",
        firstName: "Admin",
        lastName: "User"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0
    };
    
    mockDiscounts.unshift(newDiscount);
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount created successfully",
        data: {
          discount: newDiscount
        }
      }
    });
  },

  updateDiscount: (discountId, discountData) => {
    const discountIndex = mockDiscounts.findIndex(d => d._id === discountId);
    if (discountIndex !== -1) {
      mockDiscounts[discountIndex] = {
        ...mockDiscounts[discountIndex],
        ...discountData,
        updatedAt: new Date().toISOString()
      };
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount updated successfully",
        data: {
          discount: mockDiscounts[discountIndex] || mockDiscounts[0]
        }
      }
    });
  },

  deleteDiscount: (discountId) => {
    const discountIndex = mockDiscounts.findIndex(d => d._id === discountId);
    if (discountIndex !== -1) {
      mockDiscounts.splice(discountIndex, 1);
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount deleted successfully"
      }
    });
  },

  toggleDiscountStatus: (discountId) => {
    const discountIndex = mockDiscounts.findIndex(d => d._id === discountId);
    if (discountIndex !== -1) {
      mockDiscounts[discountIndex].isActive = !mockDiscounts[discountIndex].isActive;
      mockDiscounts[discountIndex].updatedAt = new Date().toISOString();
    }
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount status updated successfully",
        data: {
          discount: mockDiscounts[discountIndex] || mockDiscounts[0]
        }
      }
    });
  },

  getDiscountStats: () => {
    const stats = {
      totalDiscounts: mockDiscounts.length,
      activeDiscounts: mockDiscounts.filter(d => d.isActive).length,
      expiredDiscounts: mockDiscounts.filter(d => new Date(d.validUntil) < new Date()).length,
      totalUsage: mockDiscounts.reduce((sum, d) => sum + (d.usedCount || 0), 0),
      totalSavings: mockDiscounts.reduce((sum, d) => sum + (d.totalSavings || 0), 0),
      topDiscounts: mockDiscounts
        .sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))
        .slice(0, 5)
        .map(d => ({
          code: d.code,
          name: d.name,
          usedCount: d.usedCount || 0,
          totalSavings: d.totalSavings || 0
        })),
      recentActivity: mockDiscounts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(d => ({
          discountCode: d.code,
          action: "created",
          timestamp: d.createdAt
        }))
    };
    
    return Promise.resolve({
      data: {
        success: true,
        message: "Discount statistics retrieved successfully",
        data: {
          stats
        }
      }
    });
  },

  // Auth Mock Functions
  getProfile: () => Promise.resolve({
    data: {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: mockUsers[0] // Return first user as current user
      }
    }
  }),

  updateProfile: (data) => Promise.resolve({
    data: {
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          ...mockUsers[0],
          ...data,
          updatedAt: new Date().toISOString()
        },
        token: "mock_token_123"
      }
    }
  }),

  uploadAvatar: (formData) => Promise.resolve({
    data: {
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: {
          url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
          public_id: `avatar_${Date.now()}`
        }
      }
    }
  }),

  deleteAvatar: () => Promise.resolve({
    data: {
      success: true,
      message: "Avatar deleted successfully"
    }
  }),

  changePassword: (data) => Promise.resolve({
    data: {
      success: true,
      message: "Password changed successfully"
    }
  }),

  // Delivery API Mock Functions
  getDeliveryPersons: (params) => Promise.resolve({
    data: {
      success: true,
      message: "Delivery persons retrieved successfully",
      data: mockUsers.filter(user => user.role === 'deliveryperson')
    }
  }),

  getDeliveryStats: (params) => Promise.resolve({
    data: {
      success: true,
      message: "Delivery statistics retrieved successfully",
      data: {
        overall: {
          totalAssigned: 105,
          totalDelivered: 95,
          totalCompleted: 95
        },
        deliveryPersons: mockUsers
          .filter(user => user.role === 'deliveryperson')
          .map(user => ({
            _id: user._id,
            deliveryPersonName: `${user.firstName} ${user.lastName}`,
            totalAssigned: user.stats?.totalAssigned || 0,
            totalDelivered: user.stats?.totalDelivered || 0,
            deliveryRate: user.stats?.deliveryRate || 0,
            averageDeliveryTime: user.stats?.averageDeliveryTime || 0
          }))
      }
    }
  }),

  assignOrder: (orderId, deliveryPersonId) => Promise.resolve({
    data: {
      success: true,
      message: "Order assigned successfully",
      data: {
        order: {
          _id: orderId,
          deliveryPerson: mockUsers.find(user => user._id === deliveryPersonId)
        }
      }
    }
  }),

  reassignOrder: (orderId, deliveryPersonId) => Promise.resolve({
    data: {
      success: true,
      message: "Order reassigned successfully",
      data: {
        order: {
          _id: orderId,
          deliveryPerson: mockUsers.find(user => user._id === deliveryPersonId)
        }
      }
    }
  }),

  // Dashboard API Mock Functions
  getDashboardOverview: () => Promise.resolve({
    data: {
      success: true,
      data: {
        totalOrders: 1250,
        totalRevenue: 125000.50,
        pendingOrders: 45,
        averageOrderValue: 100.00,
        totalCustomers: 850,
        totalProducts: 120,
        totalReviews: 340
      }
    }
  }),

  getRevenueOverview: () => Promise.resolve({
    data: {
      success: true,
      data: {
        monthlyRevenue: [
          {
            month: "2024-01",
            revenue: 15000.00,
            orderCount: 120
          },
          {
            month: "2024-02",
            revenue: 18000.50,
            orderCount: 145
          },
          {
            month: "2024-03",
            revenue: 22000.75,
            orderCount: 180
          },
          {
            month: "2024-04",
            revenue: 19500.25,
            orderCount: 165
          },
          {
            month: "2024-05",
            revenue: 25000.00,
            orderCount: 200
          },
          {
            month: "2024-06",
            revenue: 28000.00,
            orderCount: 225
          }
        ],
        totalRevenue: 125000.50,
        totalOrders: 1250
      }
    }
  }),

  getRecentActivity: (params = {}) => {
    const limit = params.limit || 10;
    const recentActivities = [
      {
        id: "activity_1",
        type: "order",
        message: "New order #TB-2023-001234 received",
        time: "2 minutes ago",
        status: "pending",
        orderNumber: "TB-2023-001234",
        customer: {
          name: "John Doe",
          email: "john@example.com"
        },
        totalAmount: 150.00,
        itemCount: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: "activity_2",
        type: "user",
        message: "New user registration: jane.smith@example.com",
        time: "15 minutes ago",
        status: "success",
        user: {
          name: "Jane Smith",
          email: "jane.smith@example.com"
        },
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: "activity_3",
        type: "product",
        message: "Product 'Premium Cotton T-Shirt' stock is low",
        time: "1 hour ago",
        status: "warning",
        product: {
          name: "Premium Cotton T-Shirt",
          currentStock: 5,
          minStock: 10
        },
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: "activity_4",
        type: "review",
        message: "New review pending approval",
        time: "2 hours ago",
        status: "pending",
        review: {
          rating: 5,
          product: "Running Sneakers",
          user: "Bob Johnson"
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    return Promise.resolve({
      data: {
        success: true,
        data: {
          recentOrders: recentActivities.filter(a => a.type === 'order').slice(0, limit),
          recentCustomers: recentActivities.filter(a => a.type === 'user').slice(0, limit),
          recentReviews: recentActivities.filter(a => a.type === 'review').slice(0, limit)
        }
      }
    });
  },

  getOrderStatistics: () => Promise.resolve({
    data: {
      success: true,
      data: {
        orderStatistics: [
          {
            status: "completed",
            count: 800,
            totalValue: 80000.00
          },
          {
            status: "pending",
            count: 45,
            totalValue: 4500.00
          },
          {
            status: "processing",
            count: 120,
            totalValue: 12000.00
          },
          {
            status: "cancelled",
            count: 25,
            totalValue: 2500.00
          }
        ],
        totalOrders: 1250
      }
    }
  }),

  getTopSellingProducts: (params = {}) => {
    const limit = params.limit || 10;
    const topProducts = [
      {
        productId: "64f1a2b3c4d5e6f7g8h9i0j2",
        productName: "Premium Cotton T-Shirt",
        brand: "TrendBite",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        totalQuantity: 150,
        totalRevenue: 15000.00,
        orderCount: 75
      },
      {
        productId: "64f1a2b3c4d5e6f7g8h9i0j4",
        productName: "Running Sneakers",
        brand: "TrendBite",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        totalQuantity: 89,
        totalRevenue: 12000.00,
        orderCount: 45
      },
      {
        productId: "64f1a2b3c4d5e6f7g8h9i0j3",
        productName: "Classic Denim Jeans",
        brand: "TrendBite",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        totalQuantity: 65,
        totalRevenue: 8000.00,
        orderCount: 32
      }
    ];

    return Promise.resolve({
      data: {
        success: true,
        data: {
          topSellingProducts: topProducts.slice(0, limit)
        }
      }
    });
  },

  getCustomerAnalytics: () => Promise.resolve({
    data: {
      success: true,
      data: {
        totalCustomers: 850,
        newCustomersThisMonth: 45,
        customersWithOrders: 650,
        averageOrdersPerCustomer: 1.47,
        customerTrend: [
          {
            _id: {
              year: 2024,
              month: 1
            },
            count: 45
          },
          {
            _id: {
              year: 2024,
              month: 2
            },
            count: 52
          },
          {
            _id: {
              year: 2024,
              month: 3
            },
            count: 38
          },
          {
            _id: {
              year: 2024,
              month: 4
            },
            count: 41
          },
          {
            _id: {
              year: 2024,
              month: 5
            },
            count: 48
          },
          {
            _id: {
              year: 2024,
              month: 6
            },
            count: 55
          }
        ]
      }
    }
  })
};
