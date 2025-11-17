# TrendBite API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints in the TrendBite e-commerce platform, categorized by access levels and functionality.

## Base URL
```
/api
```

## Authentication
- **Bearer Token**: Required for protected endpoints
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: As configured in JWT_EXPIRES_IN

## Request Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token> (for protected endpoints)
```

## Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "errors": array (optional, for validation errors)
}
```

---

## 📊 Access Level Legend

| Symbol | Access Level | Description |
|--------|-------------|-------------|
| 🌐 | **Public** | No authentication required |
| 👤 | **Customer** | Authenticated customer access |
| 👨‍💼 | **Admin** | Admin-only access |
| 🚚 | **Delivery Person** | Delivery person-only access |
| 🔒 | **Protected** | Authenticated user (customer or admin) |

---

## 📊 **ADMIN DASHBOARD** (`/api/admin`)

### 👨‍💼 Admin-Only Endpoints

#### **GET** `/dashboard/overview` - Get dashboard overview statistics
**Description**: Retrieve key metrics for the admin dashboard including total orders, revenue, pending orders, and average order value.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 1250,
    "totalRevenue": 125000.50,
    "pendingOrders": 45,
    "averageOrderValue": 100.00,
    "totalCustomers": 850,
    "totalProducts": 120,
    "totalReviews": 340,
    "codPayments": {
      "totalPayments": 125,
      "totalExpectedAmount": 125000.50,
      "totalCollectedAmount": 110000.25,
      "totalOutstanding": 15,
      "totalOutstandingAmount": 15000.25,
      "collectionRate": 88.0,
      "outstandingCount": 15
    }
  }
}
```

#### **GET** `/dashboard/revenue-overview` - Get monthly revenue for past 6 months
**Description**: Retrieve monthly revenue breakdown for the past 6 months with order counts.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "monthlyRevenue": [
      {
        "month": "2024-01",
        "revenue": 15000.00,
        "orderCount": 120
      },
      {
        "month": "2024-02",
        "revenue": 18000.50,
        "orderCount": 145
      }
    ],
    "totalRevenue": 125000.50,
    "totalOrders": 1250
  }
}
```

#### **GET** `/dashboard/recent-activity` - Get recent activity
**Description**: Retrieve recent orders, new customers, and reviews for the dashboard.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `limit` (optional): Number of items to return (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "recentOrders": [
      {
        "id": "order_id",
        "orderNumber": "TB000123",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "status": "pending",
        "totalAmount": 150.00,
        "itemCount": 2,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "recentCustomers": [
      {
        "id": "user_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "joinedAt": "2024-01-15T09:00:00Z"
      }
    ],
    "recentReviews": [
      {
        "id": "review_id",
        "user": {
          "name": "Bob Johnson"
        },
        "product": {
          "name": "Cotton T-Shirt",
          "brand": "TrendBite"
        },
        "rating": 5,
        "comment": "Great quality!",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### **GET** `/dashboard/order-statistics` - Get order statistics by status
**Description**: Retrieve order counts and total values grouped by order status.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderStatistics": [
      {
        "status": "completed",
        "count": 800,
        "totalValue": 80000.00
      },
      {
        "status": "pending",
        "count": 45,
        "totalValue": 4500.00
      }
    ],
    "totalOrders": 1250
  }
}
```

#### **GET** `/dashboard/top-selling-products` - Get top selling products
**Description**: Retrieve the most popular products based on quantity sold. This is a public endpoint that doesn't require authentication.

**Query Parameters**:
- `limit` (optional): Number of products to return (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "topSellingProducts": [
      {
        "productId": "product_id",
        "productName": "Cotton T-Shirt",
        "brand": "TrendBite",
        "image": "image_url",
        "price": 99.99,
        "totalQuantity": 150,
        "totalRevenue": 15000.00,
        "orderCount": 75
      }
    ]
  }
}
```

#### **GET** `/dashboard/customer-analytics` - Get customer analytics
**Description**: Retrieve customer-related statistics and trends.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCustomers": 850,
    "newCustomersThisMonth": 45,
    "customersWithOrders": 650,
    "averageOrdersPerCustomer": 1.47,
    "customerTrend": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "count": 45
      }
    ]
  }
}
```

#### **GET** `/dashboard/inventory` - Get inventory dashboard overview
**Description**: Retrieve comprehensive inventory dashboard with key metrics, low stock alerts, and recent movements.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "inventoryStats": {
      "totalProducts": 120,
      "totalStock": 2500,
      "totalReserved": 150,
      "totalAvailable": 2350,
      "totalValue": 125000.50,
      "lowStockCount": 15,
      "outOfStockCount": 5,
      "inStockCount": 100
    },
    "lowStockProducts": [
      {
        "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
        "productName": "Premium Cotton T-Shirt",
        "brand": "TrendBite",
        "categoryName": "T-Shirts",
        "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
        "currentStock": 5,
        "lowStockThreshold": 10,
        "stockPercentage": 50,
        "lastRestocked": "2023-09-10T10:00:00Z",
        "lastSold": "2023-09-15T14:30:00Z"
      }
    ],
    "recentMovements": [
      {
        "_id": "movement123",
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "brand": "TrendBite"
        },
        "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
        "movementType": "out",
        "quantity": -2,
        "reason": "Order placed - Order #TB000123",
        "performedBy": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2023-09-15T14:30:00Z"
      }
    ],
    "outOfStockCount": 5,
    "totalInventoryValue": 125000.50,
    "movementSummary": [
      {
        "_id": "out",
        "count": 45,
        "totalQuantity": -120
      },
      {
        "_id": "in",
        "count": 12,
        "totalQuantity": 500
      }
    ]
  }
}
```

#### **GET** `/inventory/alerts` - Get inventory alerts
**Description**: Retrieve inventory alerts including low stock, out of stock, and stale inventory warnings.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `limit` (optional): Number of alerts to return (default: 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "lowStockAlerts": [
      {
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "brand": "TrendBite"
        },
        "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
        "currentStock": 5,
        "lowStockThreshold": 10,
        "stockPercentage": 50
      }
    ],
    "outOfStockAlerts": [
      {
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "Nike Air Max",
          "brand": "Nike"
        },
        "variant": "64f1a2b3c4d5e6f7g8h9i0j5",
        "lastSold": "2023-09-10T10:00:00Z",
        "updatedAt": "2023-09-15T14:30:00Z"
      }
    ],
    "staleInventory": [
      {
        "productId": "64f1a2b3c4d5e6f7g8h9i0j6",
        "productName": "Old Product",
        "brand": "BrandX",
        "variant": "64f1a2b3c4d5e6f7g8h9i0j7",
        "currentStock": 25,
        "lastSold": "2023-08-15T10:00:00Z",
        "updatedAt": "2023-08-15T10:00:00Z"
      }
    ],
    "summary": {
      "lowStockCount": 15,
      "outOfStockCount": 5,
      "staleInventoryCount": 8
    }
  }
}
```

#### **GET** `/inventory/reports` - Get inventory reports
**Description**: Generate various inventory reports including overview, movements, low stock, and valuation reports.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `reportType` (optional): Type of report - `overview`, `movements`, `low-stock`, `valuation` (default: overview)
- `startDate` (optional): Start date for report (ISO 8601 format)
- `endDate` (optional): End date for report (ISO 8601 format)
- `category` (optional): Filter by category ID
- `brand` (optional): Filter by brand name
- `lowStockOnly` (optional): Show only low stock items (true/false)
- `outOfStockOnly` (optional): Show only out of stock items (true/false)

**Response** (Overview Report):
```json
{
  "success": true,
  "data": {
    "reportType": "overview",
    "filters": {
      "startDate": null,
      "endDate": null,
      "category": null,
      "brand": null,
      "lowStockOnly": false,
      "outOfStockOnly": false
    },
    "reportData": {
      "inventory": [
        {
          "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
          "productName": "Premium Cotton T-Shirt",
          "brand": "TrendBite",
          "category": "64f1a2b3c4d5e6f7g8h9i0j1",
          "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
          "currentStock": 50,
          "reservedStock": 5,
          "availableStock": 45,
          "lowStockThreshold": 10,
          "isLowStock": false,
          "isOutOfStock": false,
          "stockStatus": "in_stock",
          "stockPercentage": 500,
          "lastRestocked": "2023-09-10T10:00:00Z",
          "lastSold": "2023-09-15T14:30:00Z",
          "totalValue": 1250.00,
          "updatedAt": "2023-09-15T14:30:00Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 120,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    },
    "generatedAt": "2023-09-15T15:00:00Z"
  }
}
```

#### **GET** `/dashboard/payments` - Get payment dashboard overview
**Description**: Retrieve comprehensive payment dashboard with COD payment statistics, outstanding payments, recent collections, and delivery person performance.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `period` (optional): Time period for statistics - `day`, `week`, `month`, `year` (default: month)

**Response**:
```json
{
  "success": true,
  "message": "Payment dashboard data retrieved successfully",
  "data": {
    "period": "month",
    "dateRange": {
      "startDate": "2023-12-01T00:00:00Z",
      "endDate": "2024-01-01T00:00:00Z"
    },
    "statistics": {
      "totalPayments": 125,
      "totalExpectedAmount": 125000.50,
      "totalCollectedAmount": 110000.25,
      "totalOutstanding": 15,
      "totalOutstandingAmount": 15000.25,
      "completedPayments": 110,
      "partialPayments": 5,
      "failedPayments": 10,
      "collectionRate": 88.0
    },
    "outstandingPayments": [
      {
        "_id": "payment123",
        "order": {
          "orderNumber": "TB000001",
          "status": "delivered",
          "totalAmount": 2500.00,
          "deliveryAddress": {
            "street": "123 Main St",
            "city": "Colombo",
            "state": "Western",
            "zipCode": "10000"
          }
        },
        "customer": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+94123456789"
        },
        "expectedAmount": 2500.00,
        "collectedAmount": 0,
        "balanceAmount": 2500.00,
        "status": "pending",
        "collectionStatus": "not_collected",
        "createdAt": "2023-12-15T10:00:00Z"
      }
    ],
    "recentCollections": [
      {
        "_id": "payment124",
        "order": {
          "orderNumber": "TB000002"
        },
        "customer": {
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "deliveryPerson": {
          "firstName": "Mike",
          "lastName": "Johnson"
        },
        "expectedAmount": 1800.00,
        "collectedAmount": 1800.00,
        "collectionTimestamp": "2023-12-15T14:30:00Z",
        "collectionNotes": "Customer paid exact amount"
      }
    ],
    "collectionIssues": [
      {
        "_id": "payment125",
        "order": {
          "orderNumber": "TB000003"
        },
        "customer": {
          "firstName": "Bob",
          "lastName": "Wilson"
        },
        "deliveryPerson": {
          "firstName": "Sarah",
          "lastName": "Brown"
        },
        "collectionIssues": ["customer_not_available"],
        "issueDescription": "Customer not home, left delivery note",
        "lastAttemptDate": "2023-12-15T16:00:00Z"
      }
    ],
    "deliveryPersonPerformance": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "deliveryPersonName": "Mike Johnson",
        "totalAssigned": 25,
        "totalCollected": 22,
        "totalPartial": 2,
        "totalFailed": 1,
        "totalAmountCollected": 45000.00,
        "collectionRate": 96.0
      }
    ]
  }
}
```

---

## 📦 **INVENTORY MANAGEMENT** (`/api/inventory`)

### 👨‍💼 Admin-Only Endpoints

#### **GET** `/overview` - Get inventory overview
**Description**: Retrieve comprehensive inventory overview with filtering options.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `product` (optional): Filter by product ID
- `category` (optional): Filter by category ID
- `brand` (optional): Filter by brand name
- `lowStockOnly` (optional): Show only low stock items (true/false)
- `outOfStockOnly` (optional): Show only out of stock items (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "inventory": [
      {
        "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
        "productName": "Premium Cotton T-Shirt",
        "brand": "TrendBite",
        "category": "64f1a2b3c4d5e6f7g8h9i0j1",
        "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
        "currentStock": 50,
        "reservedStock": 5,
        "availableStock": 45,
        "lowStockThreshold": 10,
        "isLowStock": false,
        "isOutOfStock": false,
        "stockStatus": "in_stock",
        "stockPercentage": 500,
        "lastRestocked": "2023-09-10T10:00:00Z",
        "lastSold": "2023-09-15T14:30:00Z",
        "totalValue": 1250.00,
        "updatedAt": "2023-09-15T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 120,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### **GET** `/low-stock` - Get low stock products
**Description**: Retrieve products with low stock levels.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `threshold` (optional): Custom low stock threshold
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "lowStockProducts": [
      {
        "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
        "productName": "Premium Cotton T-Shirt",
        "brand": "TrendBite",
        "categoryName": "T-Shirts",
        "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
        "currentStock": 5,
        "lowStockThreshold": 10,
        "stockPercentage": 50,
        "lastRestocked": "2023-09-10T10:00:00Z",
        "lastSold": "2023-09-15T14:30:00Z",
        "updatedAt": "2023-09-15T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### **GET** `/statistics` - Get inventory statistics
**Description**: Retrieve overall inventory statistics and metrics.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalProducts": 120,
    "totalStock": 2500,
    "totalReserved": 150,
    "totalAvailable": 2350,
    "totalValue": 125000.50,
    "lowStockCount": 15,
    "outOfStockCount": 5,
    "inStockCount": 100
  }
}
```

#### **GET** `/products/{productId}/movements` - Get product stock movements
**Description**: Retrieve stock movement history for a specific product.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `variant` (optional): Filter by variant ID
- `movementType` (optional): Filter by movement type (in, out, adjustment, transfer, reservation, restoration)
- `startDate` (optional): Start date filter (ISO 8601 format)
- `endDate` (optional): End date filter (ISO 8601 format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "movements": [
      {
        "_id": "movement123",
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "brand": "TrendBite"
        },
        "variant": "64f1a2b3c4d5e6f7g8h9i0j3",
        "movementType": "out",
        "quantity": -2,
        "previousStock": 52,
        "newStock": 50,
        "reason": "Order placed - Order #TB000123",
        "reference": {
          "type": "order",
          "id": "order123",
          "number": "TB000123"
        },
        "performedBy": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "createdAt": "2023-09-15T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMovements": 95,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### **GET** `/variants/{variantId}/movements` - Get variant stock movements
**Description**: Retrieve stock movement history for a specific variant.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `movementType` (optional): Filter by movement type
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response**: Same format as product movements

#### **PUT** `/products/{productId}/variants/{variantId}/stock` - Update stock levels
**Description**: Manually adjust stock levels for a specific variant.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "quantity": 10,
  "reason": "Stock adjustment",
  "notes": "Received new shipment",
  "cost": 25.50
}
```

**Response**:
```json
{
  "success": true,
  "message": "Stock levels updated successfully",
  "data": {
    "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "variantId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "previousStock": 50,
    "newStock": 60,
    "adjustment": 10,
    "movementId": "movement123"
  }
}
```

#### **POST** `/transfer/{fromVariantId}/{toVariantId}` - Transfer stock between variants
**Description**: Transfer stock from one variant to another.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "quantity": 5,
  "reason": "Transfer between sizes",
  "notes": "Moving from M to L size"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Stock transfer completed successfully",
  "data": {
    "fromVariantId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "toVariantId": "64f1a2b3c4d5e6f7g8h9i0j4",
    "quantity": 5,
    "fromPreviousStock": 50,
    "fromNewStock": 45,
    "toPreviousStock": 30,
    "toNewStock": 35,
    "movements": ["movement123", "movement124"]
  }
}
```

#### **POST** `/bulk-update` - Bulk stock update
**Description**: Update multiple stock levels at once.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "updates": [
    {
      "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "variantId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "quantity": 10
    },
    {
      "productId": "64f1a2b3c4d5e6f7g8h9i0j4",
      "variantId": "64f1a2b3c4d5e6f7g8h9i0j5",
      "quantity": -5
    }
  ],
  "reason": "Bulk import",
  "notes": "Monthly stock update"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bulk update completed. 2 successful, 0 failed.",
  "data": {
    "successful": [
      {
        "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
        "variantId": "64f1a2b3c4d5e6f7g8h9i0j3",
        "previousStock": 50,
        "newStock": 60,
        "adjustment": 10,
        "movementId": "movement123"
      }
    ],
    "failed": [],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

#### **POST** `/products/{productId}/variants/{variantId}/reserve` - Reserve stock for order
**Description**: Reserve stock for an order (used internally by order system).

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "quantity": 2,
  "orderId": "order123",
  "orderNumber": "TB000123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Stock reserved successfully",
  "data": {
    "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "variantId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "quantity": 2,
    "orderId": "order123",
    "movementId": "movement123"
  }
}
```

#### **POST** `/products/{productId}/variants/{variantId}/restore` - Restore stock from cancelled order
**Description**: Restore stock from a cancelled order (used internally by order system).

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "quantity": 2,
  "orderId": "order123",
  "orderNumber": "TB000123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Stock restored successfully",
  "data": {
    "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "variantId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "quantity": 2,
    "orderId": "order123",
    "movementId": "movement123"
  }
}
```

#### **GET** `/summary` - Get inventory summary
**Description**: Get inventory summary with movement statistics.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `product` (optional): Filter by product ID
- `variant` (optional): Filter by variant ID
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "variantId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "productName": "Premium Cotton T-Shirt",
      "brand": "TrendBite",
      "movements": [
        {
          "type": "out",
          "quantity": -120,
          "count": 45
        },
        {
          "type": "in",
          "quantity": 500,
          "count": 12
        }
      ],
      "totalMovements": 57
    }
  ]
}
```

---

## 💳 **PAYMENT MANAGEMENT** (`/api/payments`)

### 👨‍💼 Admin Endpoints

#### **GET** `/admin/all` - Get all COD payments with filtering
**Description**: Retrieve all COD payments with comprehensive filtering, pagination, and search capabilities.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by payment status - `pending`, `paid_on_delivery`, `completed`, `failed`, `partial`
- `collectionStatus` (optional): Filter by collection status - `not_collected`, `collected`, `partial_collected`, `failed_collection`
- `deliveryPersonId` (optional): Filter by delivery person ID
- `isOutstanding` (optional): Filter outstanding payments (true/false)
- `startDate` (optional): Start date filter (ISO 8601 format)
- `endDate` (optional): End date filter (ISO 8601 format)
- `search` (optional): Search by order number, customer name, or delivery person name

**Response**:
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "payment123",
        "order": {
          "orderNumber": "TB000001",
          "status": "delivered",
          "totalAmount": 2500.00,
          "deliveryAddress": {
            "street": "123 Main St",
            "city": "Colombo",
            "state": "Western",
            "zipCode": "10000"
          }
        },
        "customer": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+94123456789"
        },
        "deliveryPerson": {
          "firstName": "Mike",
          "lastName": "Johnson"
        },
        "expectedAmount": 2500.00,
        "collectedAmount": 0,
        "balanceAmount": 2500.00,
        "status": "pending",
        "collectionStatus": "not_collected",
        "method": "cash_on_delivery",
        "isOutstanding": true,
        "createdAt": "2023-12-15T10:00:00Z",
        "updatedAt": "2023-12-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPayments": 95,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### **GET** `/admin/statistics` - Get payment statistics
**Description**: Retrieve comprehensive payment statistics for admin dashboard with period-based filtering.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `period` (optional): Time period - `day`, `week`, `month`, `year` (default: month)

**Response**:
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "statistics": {
      "totalPayments": 125,
      "totalExpectedAmount": 125000.50,
      "totalCollectedAmount": 110000.25,
      "totalOutstanding": 15,
      "totalOutstandingAmount": 15000.25,
      "completedPayments": 110,
      "partialPayments": 5,
      "failedPayments": 10,
      "outstandingCount": 15,
      "collectionRate": 88.0
    },
    "recentActivities": [
      {
        "_id": "payment124",
        "order": {
          "orderNumber": "TB000002"
        },
        "customer": {
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "deliveryPerson": {
          "firstName": "Mike",
          "lastName": "Johnson"
        },
        "collectedAmount": 1800.00,
        "collectionTimestamp": "2023-12-15T14:30:00Z"
      }
    ],
    "period": "month"
  }
}
```

#### **GET** `/admin/reports` - Generate payment reports
**Description**: Generate detailed payment reports with various filters and report types.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `startDate` (required): Start date for report (ISO 8601 format)
- `endDate` (required): End date for report (ISO 8601 format)
- `reportType` (optional): Type of report - `summary`, `detailed`, `outstanding` (default: summary)
- `deliveryPersonId` (optional): Filter by delivery person ID
- `status` (optional): Filter by payment status

**Response**:
```json
{
  "success": true,
  "message": "Payment report generated successfully",
  "data": {
    "reportType": "detailed",
    "dateRange": {
      "startDate": "2023-12-01T00:00:00Z",
      "endDate": "2023-12-31T23:59:59Z"
    },
    "filters": {
      "deliveryPersonId": null,
      "status": null
    },
    "report": [
      {
        "_id": "payment123",
        "order": {
          "orderNumber": "TB000001",
          "status": "delivered",
          "totalAmount": 2500.00
        },
        "customer": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "deliveryPerson": {
          "firstName": "Mike",
          "lastName": "Johnson"
        },
        "expectedAmount": 2500.00,
        "collectedAmount": 2500.00,
        "status": "completed",
        "collectionTimestamp": "2023-12-15T14:30:00Z"
      }
    ]
  }
}
```

#### **GET** `/admin/{paymentId}` - Get payment by ID
**Description**: Retrieve detailed information for a specific payment.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "payment": {
      "_id": "payment123",
      "order": {
        "orderNumber": "TB000001",
        "status": "delivered",
        "items": [
          {
            "product": {
              "name": "Premium Cotton T-Shirt",
              "brand": "TrendBite"
            },
            "quantity": 2,
            "unitPrice": 1200.00,
            "totalPrice": 2400.00
          }
        ],
        "subtotal": 2400.00,
        "totalAmount": 2800.00,
        "deliveryAddress": {
          "street": "123 Main St",
          "city": "Colombo",
          "state": "Western",
          "zipCode": "10000"
        }
      },
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+94123456789"
      },
      "deliveryPerson": {
        "firstName": "Mike",
        "lastName": "Johnson",
        "email": "mike@example.com",
        "phone": "+94123456790"
      },
      "expectedAmount": 2800.00,
      "collectedAmount": 0,
      "balanceAmount": 2800.00,
      "status": "pending",
      "collectionStatus": "not_collected",
      "method": "cash_on_delivery",
      "collectionIssues": [],
      "issueDescription": "",
      "deliveryAttempts": 0,
      "isOutstanding": true,
      "adminNotes": "",
      "createdAt": "2023-12-15T10:00:00Z",
      "updatedAt": "2023-12-15T10:00:00Z"
    }
  }
}
```

#### **PUT** `/admin/{paymentId}/mark-received` - Mark payment as received
**Description**: Manually mark a payment as received/collected by admin.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 2500.00,
  "notes": "Payment received via bank transfer"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment marked as received successfully",
  "data": {
    "payment": {
      "_id": "payment123",
      "expectedAmount": 2500.00,
      "collectedAmount": 2500.00,
      "balanceAmount": 0,
      "status": "completed",
      "collectionStatus": "collected",
      "collectionTimestamp": "2023-12-15T16:00:00Z",
      "collectionNotes": "Payment received via bank transfer",
      "isOutstanding": false
    }
  }
}
```

#### **PUT** `/admin/{paymentId}/update` - Update payment details
**Description**: Update payment details including admin notes, collection issues, and issue descriptions.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "adminNotes": "Customer contacted, will pay next week",
  "collectionIssues": ["customer_not_available"],
  "issueDescription": "Customer is traveling, will be back next week"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment details updated successfully",
  "data": {
    "payment": {
      "_id": "payment123",
      "adminNotes": "Customer contacted, will pay next week",
      "collectionIssues": ["customer_not_available"],
      "issueDescription": "Customer is traveling, will be back next week",
      "updatedAt": "2023-12-15T17:00:00Z"
    }
  }
}
```

### 🚚 Delivery Person Endpoints

#### **GET** `/delivery/my-payments` - Get assigned payments
**Description**: Retrieve payments assigned to the authenticated delivery person.

**Headers**:
```
Authorization: Bearer <deliveryperson_jwt_token>
```

**Query Parameters**:
- `status` (optional): Filter by payment status
- `isOutstanding` (optional): Filter outstanding payments (true/false)

**Response**:
```json
{
  "success": true,
  "message": "Assigned payments retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "payment123",
        "order": {
          "orderNumber": "TB000001",
          "status": "delivered",
          "deliveryAddress": {
            "street": "123 Main St",
            "city": "Colombo",
            "state": "Western",
            "zipCode": "10000"
          },
          "totalAmount": 2500.00
        },
        "customer": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+94123456789"
        },
        "expectedAmount": 2500.00,
        "collectedAmount": 0,
        "balanceAmount": 2500.00,
        "status": "pending",
        "collectionStatus": "not_collected",
        "createdAt": "2023-12-15T10:00:00Z"
      }
    ]
  }
}
```

#### **POST** `/delivery/{paymentId}/collect` - Collect payment
**Description**: Record payment collection during delivery (full or partial payment).

**Headers**:
```
Authorization: Bearer <deliveryperson_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 2500.00,
  "notes": "Customer paid exact amount in cash"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment collected successfully",
  "data": {
    "payment": {
      "_id": "payment123",
      "expectedAmount": 2500.00,
      "collectedAmount": 2500.00,
      "balanceAmount": 0,
      "status": "completed",
      "collectionStatus": "collected",
      "collectionTimestamp": "2023-12-15T14:30:00Z",
      "collectionNotes": "Customer paid exact amount in cash",
      "deliveryAttempts": 1,
      "isOutstanding": false
    }
  }
}
```

#### **POST** `/delivery/{paymentId}/report-issue` - Report collection issue
**Description**: Report issues encountered during payment collection attempt.

**Headers**:
```
Authorization: Bearer <deliveryperson_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "issues": ["customer_not_available", "address_incorrect"],
  "description": "Customer not home and address seems incorrect. Left delivery note with contact information."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Collection issue reported successfully",
  "data": {
    "payment": {
      "_id": "payment123",
      "collectionIssues": ["customer_not_available", "address_incorrect"],
      "issueDescription": "Customer not home and address seems incorrect. Left delivery note with contact information.",
      "collectionStatus": "failed_collection",
      "deliveryAttempts": 1,
      "lastAttemptDate": "2023-12-15T16:00:00Z"
    }
  }
}
```

### 🔒 General Endpoints

#### **GET** `/outstanding` - Get outstanding payments
**Description**: Get outstanding payments (all for admin, assigned only for delivery person).

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Outstanding payments retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "payment123",
        "order": {
          "orderNumber": "TB000001",
          "status": "delivered"
        },
        "customer": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "expectedAmount": 2500.00,
        "collectedAmount": 0,
        "balanceAmount": 2500.00,
        "status": "pending",
        "isOutstanding": true
      }
    ]
  }
}
```

---

## 🏠 **USER MANAGEMENT** (`/api/users`)

### 🌐 Public Endpoints

#### **POST** `/register` - Register a new user
**Headers:** `Content-Type: application/json`
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **POST** `/login` - User login
**Headers:** `Content-Type: application/json`
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **POST** `/forgot-password` - Request password reset
**Description**: Send a password reset link to the user's email. The link expires in 1 hour.
**Headers:** `Content-Type: application/json`
**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

**Note**: For security reasons, the same success message is returned whether the email exists or not.

#### **POST** `/reset-password/:token` - Reset password with token
**Description**: Reset the user's password using the token received in email. Returns a new JWT token for automatic login.
**Headers:** `Content-Type: application/json`
**Request Body:**
```json
{
  "password": "newpassword123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

### 👤 Customer Endpoints

#### **GET** `/profile` - Get current user profile
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "avatar": {
        "url": "https://cloudinary.com/image.jpg",
        "public_id": "avatar_123"
      },
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US"
      }
    }
  }
}
```

#### **PUT** `/profile` - Update user profile
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "US"
  }
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.doe@example.com"
    }
  }
}
```

#### **POST** `/upload-avatar` - Upload user avatar
**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
**Request Body:** Form data with `avatar` file
**Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": {
      "url": "https://cloudinary.com/avatar.jpg",
      "public_id": "avatar_456"
    }
  }
}
```

#### **DELETE** `/avatar` - Delete user avatar
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

#### **PUT** `/change-password` - Change user password
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 👨‍💼 Admin Endpoints

#### **GET** `/` - Get all users with filtering
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:** `page=1&limit=10&role=customer&search=john&isActive=true`
**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "customer",
        "isActive": true,
        "createdAt": "2023-09-01T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 47,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### **GET** `/{id}` - Get user by ID
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2023-09-01T10:00:00Z",
      "lastLogin": "2023-09-15T14:30:00Z"
    }
  }
}
```

#### **PUT** `/{id}/role` - Update user role
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "role": "admin"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "role": "admin"
    }
  }
}
```

**Available Roles:**
- `customer` - Default role for regular users
- `admin` - Full administrative access
- `deliveryperson` - Access to delivery management features

#### **PUT** `/{id}/deactivate` - Deactivate user
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "isActive": false
    }
  }
}
```

#### **PUT** `/{id}/activate` - Activate user
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "isActive": true
    }
  }
}
```

#### **DELETE** `/{id}` - Delete user
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🛍️ **PRODUCT MANAGEMENT** (`/api/products`)

### 🌐 Public Endpoints

#### **GET** `/` - Get all products with filtering
**Query Parameters:** `category=64f1a2b3c4d5e6f7g8h9i0j1&brand=Nike&gender=men&minPrice=50&maxPrice=200&size=M&color=red&page=1&limit=12&sortBy=price&sortOrder=asc`
**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Premium Cotton T-Shirt",
        "description": "High-quality cotton t-shirt perfect for everyday wear",
        "brand": "TrendBite",
        "category": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "name": "T-Shirts"
        },
        "variants": [
          {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "sku": "TSHIRT-M-RED-001",
            "stockQuantity": 50,
            "price": { "regular": 29.99, "sale": 24.99 }
          }
        ],
        "images": [
          {
            "url": "https://cloudinary.com/product1.jpg",
            "isMain": true,
            "order": 1
          }
        ],
        "averageRating": 4.5,
        "totalSales": 150,
        "isFeatured": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalProducts": 120,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": ["T-Shirts", "Jeans", "Shoes"],
      "brands": ["Nike", "Adidas", "TrendBite"],
      "priceRange": { "min": 10, "max": 500 }
    }
  }
}
```

#### **GET** `/search` - Search products
**Query Parameters:** `q=red shirt&page=1&limit=12`
**Response (200):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "products": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Red Cotton T-Shirt",
        "description": "Comfortable red cotton t-shirt",
        "brand": "TrendBite",
        "variants": [
          {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "price": { "regular": 29.99 }
          }
        ],
        "images": [
          {
            "url": "https://cloudinary.com/red-shirt.jpg",
            "isMain": true
          }
        ]
      }
    ],
    "searchQuery": "red shirt",
    "totalResults": 25,
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "hasNext": true
    }
  }
}
```

#### **GET** `/featured` - Get featured products
**Query Parameters:** `limit=8`
**Response (200):**
```json
{
  "success": true,
  "message": "Featured products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Premium Cotton T-Shirt",
        "description": "High-quality cotton t-shirt",
        "brand": "TrendBite",
        "variants": [
          {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "price": { "regular": 29.99, "sale": 24.99 }
          }
        ],
        "images": [
          {
            "url": "https://cloudinary.com/featured-shirt.jpg",
            "isMain": true
          }
        ],
        "averageRating": 4.5,
        "totalSales": 150
      }
    ]
  }
}
```

#### **GET** `/{id}` - Get single product by ID
**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Premium Cotton T-Shirt",
      "description": "High-quality cotton t-shirt perfect for everyday wear",
      "shortDescription": "Comfortable cotton t-shirt",
      "brand": "TrendBite",
      "category": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "T-Shirts"
      },
      "gender": "unisex",
      "material": "100% Cotton",
      "tags": ["casual", "cotton", "comfortable"],
      "variants": [
        {
          "size": "M",
          "color": { "name": "Red", "hex": "#FF0000" },
          "sku": "TSHIRT-M-RED-001",
          "stockQuantity": 50,
          "price": { "regular": 29.99, "sale": 24.99 }
        }
      ],
      "images": [
        {
          "_id": "img123",
          "url": "https://cloudinary.com/product1.jpg",
          "isMain": true,
          "order": 1,
          "alt": "Red cotton t-shirt front view"
        }
      ],
      "averageRating": 4.5,
      "totalReviews": 25,
      "totalSales": 150,
      "isFeatured": true,
      "status": "published",
      "createdAt": "2023-09-01T10:00:00Z"
    }
  }
}
```

### 👨‍💼 Admin Endpoints

#### **POST** `/` - Create new product
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "name": "Premium Cotton T-Shirt",
  "description": "High-quality cotton t-shirt perfect for everyday wear",
  "shortDescription": "Comfortable cotton t-shirt",
  "brand": "TrendBite",
  "category": "64f1a2b3c4d5e6f7g8h9i0j1",
  "gender": "unisex",
  "material": "100% Cotton",
  "tags": ["casual", "cotton", "comfortable"],
  "variants": [
    {
      "size": "M",
      "color": { "name": "Red", "hex": "#FF0000" },
      "sku": "TSHIRT-M-RED-001",
      "stockQuantity": 50,
      "price": { "regular": 29.99, "sale": 24.99 }
    }
  ],
  "currency": "USD",
  "status": "draft",
  "isFeatured": false,
  "discountPercentage": 0,
  "lowStockThreshold": 10
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Premium Cotton T-Shirt",
      "description": "High-quality cotton t-shirt perfect for everyday wear",
      "brand": "TrendBite",
      "status": "draft",
      "createdAt": "2023-09-01T10:00:00Z"
    }
  }
}
```

#### **PUT** `/{id}` - Update product
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "name": "Updated Premium Cotton T-Shirt",
  "status": "published",
  "isFeatured": true,
  "discountPercentage": 15
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Updated Premium Cotton T-Shirt",
      "status": "published",
      "isFeatured": true,
      "updatedAt": "2023-09-02T15:30:00Z"
    }
  }
}
```

#### **DELETE** `/{id}` - Delete product
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### **POST** `/{id}/upload-images` - Upload product images
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: multipart/form-data`
**Request Body:** Form data with `images` files (max 5 files, 5MB each)
**Response (200):**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      {
        "_id": "img123",
        "url": "https://cloudinary.com/product1.jpg",
        "public_id": "product_123_1",
        "isMain": true,
        "order": 1
      },
      {
        "_id": "img124",
        "url": "https://cloudinary.com/product2.jpg",
        "public_id": "product_123_2",
        "isMain": false,
        "order": 2
      }
    ]
  }
}
```

#### **DELETE** `/{id}/images/{imageId}` - Delete product image
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

#### **PUT** `/{id}/images/order` - Update image order
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "imageOrders": [
    {
      "imageId": "img124",
      "order": 1,
      "isMain": true
    },
    {
      "imageId": "img123",
      "order": 2,
      "isMain": false
    }
  ]
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Image order updated successfully"
}
```

#### **GET** `/low-stock` - Get low stock products
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:** `page=1&limit=20`
**Response (200):**
```json
{
  "success": true,
  "message": "Low stock products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Premium Cotton T-Shirt",
        "variants": [
          {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "stockQuantity": 5,
            "lowStockThreshold": 10
          }
        ],
        "stockStatus": "low"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalProducts": 45
    }
  }
}
```

---

## 🛒 **CART MANAGEMENT** (`/api/cart`)

### 👤 Customer Endpoints

#### **GET** `/` - Get user's cart
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "user": "64f1a2b3c4d5e6f7g8h9i0j1",
      "items": [
        {
          "_id": "item123",
          "product": {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
            "name": "Premium Cotton T-Shirt",
            "images": [
              {
                "url": "https://cloudinary.com/shirt.jpg",
                "isMain": true
              }
            ]
          },
          "variant": {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "sku": "TSHIRT-M-RED-001"
          },
          "quantity": 2,
          "unitPrice": 24.99,
          "totalPrice": 49.98,
          "addedAt": "2023-09-15T10:00:00Z"
        }
      ],
      "subtotal": 49.98,
      "deliveryCost": 5.99,
      "discount": {
        "code": "SAVE10",
        "amount": 5.00,
        "type": "percentage",
        "appliedAt": "2023-09-15T10:05:00Z"
      },
      "totalAmount": 50.97,
      "itemCount": 2,
      "currency": "USD",
      "expiresAt": "2023-09-22T10:00:00Z"
    }
  }
}
```

#### **POST** `/items` - Add item to cart
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "variant": {
    "sku": "TSHIRT-M-RED-001",
    "size": "M",
    "color": {
      "name": "Red",
      "hex": "#FF0000"
    }
  },
  "quantity": 2
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "items": [
        {
          "_id": "item123",
          "product": "64f1a2b3c4d5e6f7g8h9i0j2",
          "variant": {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "sku": "TSHIRT-M-RED-001"
          },
          "quantity": 2,
          "unitPrice": 24.99,
          "totalPrice": 49.98
        }
      ],
      "subtotal": 49.98,
      "totalAmount": 55.97
    }
  }
}
```

#### **PUT** `/items/{itemId}` - Update item quantity
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "quantity": 3
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Item quantity updated successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "items": [
        {
          "_id": "item123",
          "quantity": 3,
          "unitPrice": 24.99,
          "totalPrice": 74.97
        }
      ],
      "subtotal": 74.97,
      "totalAmount": 80.96
    }
  }
}
```

#### **DELETE** `/items/{itemId}` - Remove item from cart
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "items": [],
      "subtotal": 0,
      "totalAmount": 0
    }
  }
}
```

#### **DELETE** `/` - Clear entire cart
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "items": [],
      "subtotal": 0,
      "totalAmount": 0
    }
  }
}
```

#### **POST** `/apply-discount` - Apply discount code
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "discountCode": "SAVE10"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "subtotal": 49.98,
      "discount": {
        "code": "SAVE10",
        "amount": 4.99,
        "type": "percentage"
      },
      "totalAmount": 50.98
    }
  }
}
```

#### **DELETE** `/discount` - Remove discount
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Discount removed successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "subtotal": 49.98,
      "discount": null,
      "totalAmount": 55.97
    }
  }
}
```

#### **GET** `/summary` - Get cart summary for checkout
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Cart summary retrieved successfully",
  "data": {
    "summary": {
      "itemCount": 2,
      "subtotal": 49.98,
      "deliveryCost": 5.99,
      "discount": {
        "code": "SAVE10",
        "amount": 4.99
      },
      "totalAmount": 50.98,
      "currency": "USD",
      "items": [
        {
          "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "variant": {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" }
          },
          "quantity": 2,
          "unitPrice": 24.99,
          "totalPrice": 49.98
        }
      ]
    }
  }
}
```

#### **POST** `/validate` - Validate cart items
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Cart validation completed",
  "data": {
    "cart": {
      "_id": "cart123",
      "items": [
        {
          "_id": "item123",
          "quantity": 2,
          "isValid": true,
          "availability": "in-stock"
        }
      ],
      "invalidItems": [],
      "isValid": true
    }
  }
}
```

#### **POST** `/update-prices` - Update cart prices
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Cart prices updated successfully",
  "data": {
    "cart": {
      "_id": "cart123",
      "items": [
        {
          "_id": "item123",
          "unitPrice": 22.99,
          "totalPrice": 45.98
        }
      ],
      "subtotal": 45.98,
      "totalAmount": 51.97
    }
  }
}
```

---

## 📦 **ORDER MANAGEMENT** (`/api/orders`)

### 👤 Customer Endpoints

#### **POST** `/` - Create new order
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "items": [
    {
      "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "variant": {
        "sku": "TSHIRT-M-RED-001",
        "size": "M",
        "color": { "name": "Red", "hex": "#FF0000" }
      },
      "quantity": 2,
      "unitPrice": 24.99
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethod": "credit_card",
  "shippingMethod": "standard",
  "discountCode": "SAVE10",
  "notes": "Please deliver during business hours"
}
```

**Shipping Method Options:**
- `standard` - 3 working days delivery (Cost: 400 LKR)
- `express` - Within 1 day delivery (Cost: 1000 LKR)
- Default: `standard` if not specified

**Request Body:**
```json
{
  "items": [...],
  "deliveryAddress": {...},
  "billingAddress": {...},
  "paymentMethod": "cash_on_delivery",
  "shippingMethod": "express",
  "discountCode": "SAVE10",
  "notes": "Please deliver during business hours"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order123",
    "orderNumber": "TB000001",
    "customer": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "deliveryPerson": null,
    "assignedAt": null,
    "items": [
      {
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "brand": "TrendBite",
          "images": [
            {
              "url": "https://cloudinary.com/shirt.jpg",
              "isMain": true
            }
          ]
        },
        "variant": {
          "size": "M",
          "color": { "name": "Red", "hex": "#FF0000" },
          "sku": "TSHIRT-M-RED-001"
        },
        "quantity": 2,
        "unitPrice": 24.99,
        "totalPrice": 49.98
      }
    ],
    "subtotal": 49.98,
    "deliveryCost": 400,
    "discount": {
      "code": "SAVE10",
      "amount": 4.99,
      "type": "fixed"
    },
    "totalAmount": 445.99,
    "status": "pending",
    "payment": {
      "method": "credit_card",
      "status": "pending"
    },
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "phone": "+1234567890"
    },
    "billingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "shipping": {
      "method": "standard",
      "estimatedDeliveryDate": "2023-12-18T10:00:00Z",
      "deliveryPersonEstimatedTime": null,
      "deliveryNotes": null
    },
    "statusHistory": [
      {
        "status": "pending",
        "changedAt": "2023-12-15T10:00:00Z",
        "notes": "Order created"
      }
    ],
    "createdAt": "2023-12-15T10:00:00Z"
  }
}
```

**Note:** 
- If `shippingMethod` is `standard`, `deliveryCost` will be **400 LKR** and estimated delivery is **3 working days**
- If `shippingMethod` is `express`, `deliveryCost` will be **1000 LKR** and estimated delivery is **within 1 day**
- The `estimatedDeliveryDate` is automatically calculated based on the selected shipping method
```

#### **GET** `/my-orders` - Get customer's orders
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:** `page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=desc`
**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "order123",
        "orderNumber": "TB-2023-001234",
        "items": [
          {
            "product": {
              "name": "Premium Cotton T-Shirt",
              "images": [
                {
                  "url": "https://cloudinary.com/shirt.jpg",
                  "isMain": true
                }
              ]
            },
            "variant": {
              "size": "M",
              "color": { "name": "Red", "hex": "#FF0000" }
            },
            "quantity": 2,
            "totalPrice": 49.98
          }
        ],
        "totalAmount": 50.98,
        "status": "pending",
        "paymentStatus": "pending",
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 47,
      "hasNext": true
    }
  }
}
```

#### **GET** `/{orderId}` - Get order by ID
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order": {
      "_id": "order123",
      "orderNumber": "TB-2023-001234",
      "user": "64f1a2b3c4d5e6f7g8h9i0j1",
      "items": [
        {
          "product": {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
            "name": "Premium Cotton T-Shirt",
            "images": [
              {
                "url": "https://cloudinary.com/shirt.jpg",
                "isMain": true
              }
            ]
          },
          "variant": {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "sku": "TSHIRT-M-RED-001"
          },
          "quantity": 2,
          "unitPrice": 24.99,
          "totalPrice": 49.98
        }
      ],
      "subtotal": 49.98,
      "deliveryCost": 5.99,
      "discount": {
        "code": "SAVE10",
        "amount": 4.99
      },
      "totalAmount": 50.98,
      "status": "pending",
      "paymentStatus": "pending",
      "shippingStatus": "not_shipped",
      "deliveryAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US"
      },
      "trackingInfo": null,
      "createdAt": "2023-09-15T10:00:00Z",
      "updatedAt": "2023-09-15T10:00:00Z"
    }
  }
}
```

#### **PUT** `/{orderId}/delivery-address` - Update delivery address
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "deliveryAddress": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "US"
  }
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Delivery address updated successfully",
  "data": {
    "order": {
      "_id": "order123",
      "deliveryAddress": {
        "street": "456 Oak Ave",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90210",
        "country": "US"
      },
      "updatedAt": "2023-09-15T11:00:00Z"
    }
  }
}
```

#### **PUT** `/{orderId}/cancel` - Cancel order
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "reason": "Changed mind",
  "notes": "Customer requested cancellation"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order": {
      "_id": "order123",
      "status": "cancelled",
      "cancellationReason": "Changed mind",
      "cancelledAt": "2023-09-15T12:00:00Z"
    }
  }
}
```

#### **POST** `/validate-discount` - Validate discount code
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Description:** Validate a discount code and calculate discount amount. Each user can only use a discount code once due to per-user tracking.
**Request Body:**
```json
{
  "discountCode": "SAVE10",
  "orderAmount": 49.98
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Discount code validated successfully",
  "data": {
    "discount": {
      "code": "SAVE10",
      "name": "10% Off",
      "type": "percentage",
      "value": 10,
      "amount": 4.99,
      "isValid": true,
      "validUntil": "2023-12-31T23:59:59Z"
    }
  }
}
```

### 👨‍💼 Admin Endpoints

#### **GET** `/` - Get all orders with filtering
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:** `page=1&limit=20&status=pending&paymentStatus=paid&sortBy=createdAt&sortOrder=desc`
**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "order123",
        "orderNumber": "TB-2023-001234",
        "user": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "items": [
          {
            "product": {
              "name": "Premium Cotton T-Shirt"
            },
            "variant": {
              "size": "M",
              "color": { "name": "Red", "hex": "#FF0000" }
            },
            "quantity": 2,
            "totalPrice": 49.98
          }
        ],
        "totalAmount": 50.98,
        "status": "pending",
        "paymentStatus": "pending",
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalOrders": 487,
      "hasNext": true
    }
  }
}
```

#### **GET** `/stats/overview` - Get order statistics
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": {
    "stats": {
      "totalOrders": 1247,
      "pendingOrders": 23,
      "completedOrders": 1180,
      "cancelledOrders": 44,
      "totalRevenue": 45678.90,
      "averageOrderValue": 36.65,
      "ordersToday": 15,
      "revenueToday": 549.75,
      "topProducts": [
        {
          "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "totalSold": 245,
          "revenue": 6122.55
        }
      ]
    }
  }
}
```

#### **PUT** `/{orderId}/status` - Update order status
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed and ready for assignment"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "order123",
    "orderNumber": "TB000001",
    "customer": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "deliveryPerson": null,
    "status": "confirmed",
    "statusHistory": [
      {
        "status": "pending",
        "changedAt": "2023-12-15T10:00:00Z",
        "notes": "Order created"
      },
      {
        "status": "confirmed",
        "changedAt": "2023-12-15T14:30:00Z",
        "changedBy": "64f1a2b3c4d5e6f7g8h9i0j9",
        "notes": "Order confirmed and ready for assignment"
      }
    ],
    "updatedAt": "2023-12-15T14:30:00Z"
  }
}
```

**Valid Status Values:**
- `pending` - Order created, awaiting confirmation
- `confirmed` - Order confirmed, ready for delivery assignment
- `assigned` - Order assigned to delivery person
- `out_for_delivery` - Order is out for delivery
- `delivered` - Order has been delivered
- `completed` - Order completed and closed
- `cancelled` - Order cancelled

#### **PUT** `/{orderId}/shipping` - Update shipping details
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`

**Description:** Update shipping information for an order. When shipping details are added, the order status will automatically change to `shipped` if the current status is `pending` or `confirmed`.

**Request Body:**
```json
{
  "trackingNumber": "1Z999AA1234567890",
  "deliveryPartner": "UPS",
  "estimatedDeliveryDate": "2023-12-20T18:00:00Z"
}
```

**Automatic Status Change:**
- ✅ If order status is `pending` or `confirmed`, it will automatically change to `shipped`
- ✅ Status history will be updated with tracking and partner information
- ✅ If order is already in a later status (e.g., `assigned`, `delivered`), status remains unchanged

**Response (200):**
```json
{
  "success": true,
  "message": "Order shipping details updated successfully",
  "data": {
    "_id": "order123",
    "orderNumber": "TB000001",
    "status": "shipped",
    "shipping": {
      "method": "standard",
      "trackingNumber": "1Z999AA1234567890",
      "estimatedDeliveryDate": "2023-12-20T18:00:00Z",
      "actualDeliveryDate": null,
      "deliveryPartner": "UPS",
      "deliveryPersonEstimatedTime": null,
      "deliveryNotes": null
    },
    "statusHistory": [
      {
        "status": "pending",
        "changedAt": "2023-12-15T10:00:00Z",
        "notes": "Order created"
      },
      {
        "status": "shipped",
        "changedAt": "2023-12-15T16:00:00Z",
        "changedBy": "admin_id",
        "notes": "Order marked as shipped - Tracking: 1Z999AA1234567890, Partner: UPS"
      }
    ],
    "updatedAt": "2023-12-15T16:00:00Z"
  }
}
```

#### **PUT** `/{orderId}/payment` - Update payment details
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "transactionId": "txn_1234567890",
  "paidAt": "2023-09-15T10:15:00Z"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Payment details updated successfully",
  "data": {
    "order": {
      "_id": "order123",
      "paymentStatus": "paid",
      "paymentDetails": {
        "method": "credit_card",
        "transactionId": "txn_1234567890",
        "paidAt": "2023-09-15T10:15:00Z"
      },
      "updatedAt": "2023-09-15T14:30:00Z"
    }
  }
}
```

### 📦 Order Status Workflow

The order management system follows this status progression:

```
pending → confirmed → assigned → out_for_delivery → delivered → completed
```

**Status Descriptions:**
- **pending**: Order created, awaiting admin confirmation
- **confirmed**: Order confirmed by admin, ready for processing
- **shipped**: Order has been shipped and is in transit
- **assigned**: Order assigned to a delivery person
- **out_for_delivery**: Delivery person is en route to deliver the order
- **delivered**: Order has been successfully delivered to customer
- **completed**: Order process completed and closed
- **cancelled**: Order cancelled (can occur at any stage before delivery)

**Status Transitions:**
- **Admin**: Can update any status (including marking as `shipped`) and assign delivery persons
- **Delivery Person**: Can update from `assigned` → `out_for_delivery` → `delivered`
- **Customer**: Can cancel orders in `pending` or `confirmed` status
- **System**: Automatically tracks all status changes with timestamps and user information

**Typical Order Flow:**
`pending` → `confirmed` → `shipped` → `assigned` → `out_for_delivery` → `delivered` → `completed`

### 🌟 Delivery Rating Endpoints

#### **POST** `/{orderId}/rate-delivery` 👤 - Rate delivery person
**Description**: Allows customers to rate and provide feedback on delivery service after order delivery.

**Headers:** `Authorization: Bearer <customer_token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Excellent service! Very professional and on time."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery rating submitted successfully",
  "data": {
    "orderId": "654321abcdef123456789012",
    "orderNumber": "TB000123",
    "deliveryRating": {
      "rating": 5,
      "feedback": "Excellent service! Very professional and on time.",
      "ratedAt": "2025-10-10T10:30:00.000Z"
    },
    "deliveryPerson": {
      "id": "123456abcdef123456789012",
      "name": "John Doe",
      "averageRating": 4.8,
      "totalRatings": 157
    }
  }
}
```

**Validation Rules:**
- Rating must be integer between 1-5
- Order must be delivered/completed
- Only order owner can rate
- Each order can only be rated once
- Delivery person must be assigned

#### **GET** `/delivery-ratings/{deliveryPersonId}` 👨‍💼 - Get delivery person ratings
**Description**: Admin endpoint to view all ratings for a specific delivery person.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:** `page=1&limit=10&sortBy=ratedAt&sortOrder=desc`

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery person ratings retrieved successfully",
  "data": {
    "deliveryPerson": {
      "id": "123456abcdef123456789012",
      "name": "John Doe",
      "averageRating": 4.8,
      "totalRatings": 157,
      "totalDeliveries": 200
    },
    "ratingDistribution": {
      "5": 121,
      "4": 25,
      "3": 8,
      "2": 2,
      "1": 1
    },
    "ratings": [
      {
        "orderId": "654321abcdef123456789012",
        "orderNumber": "TB000123",
        "customer": {
          "name": "Jane Smith",
          "avatar": { "url": "https://cloudinary.com/avatar.jpg" }
        },
        "rating": 5,
        "feedback": "Excellent service!",
        "ratedAt": "2025-10-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 16,
      "totalRatings": 157,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### **GET** `/delivery-persons/ratings` 👨‍💼 - Get all delivery persons with ratings
**Description**: Admin endpoint to view all delivery persons with their rating statistics.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:** `sortBy=averageRating&sortOrder=desc`

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery persons with ratings retrieved successfully",
  "data": {
    "deliveryPersons": [
      {
        "id": "123456abcdef123456789012",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+94771234567",
        "stats": {
          "averageRating": 4.8,
          "totalRatings": 157,
          "totalDeliveries": 200,
          "totalOrders": 215,
          "deliveredOrders": 200,
          "pendingOrders": 5,
          "deliveryRate": 93.0
        }
      }
    ],
    "total": 1
  }
}
```

**Note:** See [DELIVERY_RATING_DOCUMENTATION.md](./DELIVERY_RATING_DOCUMENTATION.md) for comprehensive delivery rating system documentation.

---

## 📂 **CATEGORY MANAGEMENT** (`/api/categories`)

### 🌐 Public Endpoints

#### **GET** `/` - Get all categories
**Query Parameters:** `includeInactive=false`
**Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "T-Shirts",
        "description": "Comfortable and stylish t-shirts",
        "image": {
          "url": "https://cloudinary.com/category-tshirts.jpg",
          "public_id": "category_tshirts"
        },
        "isActive": true,
        "sortOrder": 1,
        "productCount": 45,
        "parent": null,
        "children": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
            "name": "Men's T-Shirts",
            "productCount": 25
          }
        ]
      }
    ]
  }
}
```

#### **GET** `/tree` - Get category tree
**Response (200):**
```json
{
  "success": true,
  "message": "Category tree retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Clothing",
        "isActive": true,
        "children": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
            "name": "T-Shirts",
            "isActive": true,
            "children": [
              {
                "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
                "name": "Men's T-Shirts",
                "isActive": true,
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### **GET** `/{id}` - Get single category
**Response (200):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "category": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "T-Shirts",
      "description": "Comfortable and stylish t-shirts for everyday wear",
      "image": {
        "url": "https://cloudinary.com/category-tshirts.jpg",
        "public_id": "category_tshirts"
      },
      "isActive": true,
      "sortOrder": 1,
      "parent": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j0",
        "name": "Clothing"
      },
      "children": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
          "name": "Men's T-Shirts",
          "productCount": 25
        }
      ],
      "productCount": 45,
      "seoTitle": "Premium T-Shirts - Comfortable & Stylish",
      "seoDescription": "Shop our collection of comfortable and stylish t-shirts",
      "seoKeywords": ["t-shirts", "cotton", "comfortable", "stylish"],
      "createdAt": "2023-09-01T10:00:00Z"
    }
  }
}
```

#### **GET** `/{id}/products` - Get products by category
**Query Parameters:** `page=1&limit=12&sortBy=price&sortOrder=asc&minPrice=20&maxPrice=100&brand=Nike`
**Response (200):**
```json
{
  "success": true,
  "message": "Category products retrieved successfully",
  "data": {
    "category": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "T-Shirts"
    },
    "products": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Premium Cotton T-Shirt",
        "description": "High-quality cotton t-shirt",
        "brand": "TrendBite",
        "variants": [
          {
            "size": "M",
            "color": { "name": "Red", "hex": "#FF0000" },
            "price": { "regular": 29.99, "sale": 24.99 }
          }
        ],
        "images": [
          {
            "url": "https://cloudinary.com/shirt.jpg",
            "isMain": true
          }
        ],
        "averageRating": 4.5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalProducts": 45,
      "hasNext": true
    }
  }
}
```

### 👨‍💼 Admin Endpoints

#### **POST** `/` - Create new category
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "name": "Men's Jeans",
  "description": "Comfortable and durable jeans for men",
  "parent": "64f1a2b3c4d5e6f7g8h9i0j1",
  "isActive": true,
  "sortOrder": 2,
  "seoTitle": "Men's Jeans - Premium Denim Collection",
  "seoDescription": "Shop our premium collection of men's jeans",
  "seoKeywords": ["jeans", "men", "denim", "comfortable"]
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Men's Jeans",
      "description": "Comfortable and durable jeans for men",
      "parent": "64f1a2b3c4d5e6f7g8h9i0j1",
      "isActive": true,
      "sortOrder": 2,
      "createdAt": "2023-09-15T10:00:00Z"
    }
  }
}
```

#### **PUT** `/{id}` - Update category
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "name": "Updated Men's Jeans",
  "description": "Updated description for men's jeans",
  "isActive": false,
  "sortOrder": 3
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Updated Men's Jeans",
      "description": "Updated description for men's jeans",
      "isActive": false,
      "sortOrder": 3,
      "updatedAt": "2023-09-15T11:00:00Z"
    }
  }
}
```

#### **DELETE** `/{id}` - Delete category
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

#### **POST** `/{id}/upload-image` - Upload category image
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: multipart/form-data`
**Request Body:** Form data with `image` file (max 5MB)
**Response (200):**
```json
{
  "success": true,
  "message": "Category image uploaded successfully",
  "data": {
    "category": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "image": {
        "url": "https://cloudinary.com/category-jeans.jpg",
        "public_id": "category_jeans_123"
      }
    }
  }
}
```

---

## ⭐ **REVIEW MANAGEMENT** (`/api/reviews`)

### 🌐 Public Endpoints

#### **GET** `/` - Get all reviews with filters
**Query Parameters:** `page=1&limit=10&rating=5&sortBy=createdAt&sortOrder=desc`
**Response (200):**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "review123",
        "user": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": {
            "url": "https://cloudinary.com/avatar.jpg"
          }
        },
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt"
        },
        "rating": 5,
        "title": "Excellent quality!",
        "comment": "Great t-shirt, very comfortable and fits perfectly.",
        "isVerified": true,
        "status": "approved",
        "adminReply": null,
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalReviews": 95,
      "hasNext": true
    }
  }
}
```

#### **GET** `/product/{productId}` - Get product reviews
**Query Parameters:** `page=1&limit=10&rating=5&sortBy=helpful&sortOrder=desc`
**Response (200):**
```json
{
  "success": true,
  "message": "Product reviews retrieved successfully",
  "data": {
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Premium Cotton T-Shirt"
    },
    "reviews": [
      {
        "_id": "review123",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "avatar": {
            "url": "https://cloudinary.com/avatar.jpg"
          }
        },
        "rating": 5,
        "title": "Excellent quality!",
        "comment": "Great t-shirt, very comfortable and fits perfectly.",
        "isVerified": true,
        "helpfulCount": 12,
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 25,
      "ratingDistribution": {
        "5": 15,
        "4": 7,
        "3": 2,
        "2": 1,
        "1": 0
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReviews": 25
    }
  }
}
```

#### **GET** `/{id}` - Get single review
**Response (200):**
```json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "review": {
      "_id": "review123",
      "user": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": {
          "url": "https://cloudinary.com/avatar.jpg"
        }
      },
      "product": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Premium Cotton T-Shirt",
        "images": [
          {
            "url": "https://cloudinary.com/shirt.jpg",
            "isMain": true
          }
        ]
      },
      "rating": 5,
      "title": "Excellent quality!",
      "comment": "Great t-shirt, very comfortable and fits perfectly. The material is soft and the color is exactly as shown.",
      "images": [
        {
          "url": "https://cloudinary.com/review-image1.jpg"
        }
      ],
      "isVerified": true,
      "status": "approved",
      "helpfulCount": 12,
      "adminReply": {
        "reply": "Thank you for your feedback!",
        "repliedBy": "Admin User",
        "repliedAt": "2023-09-15T14:00:00Z"
      },
      "createdAt": "2023-09-15T10:00:00Z",
      "updatedAt": "2023-09-15T10:00:00Z"
    }
  }
}
```

### 👤 Customer Endpoints

#### **POST** `/` - Create new review
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "productId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "rating": 5,
  "title": "Excellent quality!",
  "description": "Great t-shirt, very comfortable and fits perfectly."
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending approval",
  "data": {
    "_id": "review123",
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": {
        "url": "https://cloudinary.com/avatar.jpg"
      }
    },
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Premium Cotton T-Shirt",
      "brand": "TrendBite",
      "images": [
        {
          "url": "https://cloudinary.com/shirt.jpg",
          "isMain": true
        }
      ]
    },
    "rating": 5,
    "title": "Excellent quality!",
    "description": "Great t-shirt, very comfortable and fits perfectly.",
    "status": "pending",
    "isActive": true,
    "createdAt": "2023-12-15T10:00:00Z"
  }
}
```

#### **GET** `/user/my-reviews` - Get current user's reviews
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:** `page=1&limit=10&status=approved`
**Response (200):**
```json
{
  "success": true,
  "message": "User reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "review123",
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt",
          "images": [
            {
              "url": "https://cloudinary.com/shirt.jpg",
              "isMain": true
            }
          ]
        },
        "rating": 5,
        "title": "Excellent quality!",
        "comment": "Great t-shirt, very comfortable and fits perfectly.",
        "status": "approved",
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReviews": 25
    }
  }
}
```

#### **PUT** `/{id}` - Update review
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "rating": 4,
  "title": "Updated review title",
  "description": "Updated review description"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "review123",
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": {
        "url": "https://cloudinary.com/avatar.jpg"
      }
    },
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Premium Cotton T-Shirt",
      "brand": "TrendBite",
      "images": [
        {
          "url": "https://cloudinary.com/shirt.jpg",
          "isMain": true
        }
      ]
    },
    "rating": 4,
    "title": "Updated review title",
    "description": "Updated review description",
    "status": "pending",
    "isActive": true,
    "updatedAt": "2023-12-15T11:00:00Z"
  }
}
```

#### **DELETE** `/{id}` - Delete review
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 👨‍💼 Admin Endpoints

#### **GET** `/admin/pending` - Get pending reviews
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:** `page=1&limit=20&sortBy=createdAt&sortOrder=desc`
**Response (200):**
```json
{
  "success": true,
  "message": "Pending reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "review123",
        "user": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "product": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt"
        },
        "rating": 5,
        "title": "Excellent quality!",
        "comment": "Great t-shirt, very comfortable and fits perfectly.",
        "status": "pending",
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPendingReviews": 87
    }
  }
}
```

#### **PATCH** `/{id}/approve` - Approve review
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "review": {
      "_id": "review123",
      "status": "approved",
      "approvedAt": "2023-09-15T14:00:00Z",
      "approvedBy": "64f1a2b3c4d5e6f7g8h9i0j9"
    }
  }
}
```

#### **PATCH** `/{id}/reject` - Reject review
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "reason": "Inappropriate content"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Review rejected successfully",
  "data": {
    "review": {
      "_id": "review123",
      "status": "rejected",
      "rejectionReason": "Inappropriate content",
      "rejectedAt": "2023-09-15T14:00:00Z",
      "rejectedBy": "64f1a2b3c4d5e6f7g8h9i0j9"
    }
  }
}
```

#### **POST** `/{id}/reply` - Add admin reply to review
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "message": "Thank you for your feedback! We're glad you love the product."
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Admin reply added successfully",
  "data": {
    "_id": "review123",
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": {
        "url": "https://cloudinary.com/avatar.jpg"
      }
    },
    "product": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Premium Cotton T-Shirt",
      "brand": "TrendBite",
      "images": [
        {
          "url": "https://cloudinary.com/shirt.jpg",
          "isMain": true
        }
      ]
    },
    "rating": 5,
    "title": "Excellent quality!",
    "description": "Great t-shirt, very comfortable and fits perfectly.",
    "status": "approved",
    "isActive": true,
    "adminReply": {
      "message": "Thank you for your feedback! We're glad you love the product.",
      "repliedBy": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
        "firstName": "Admin",
        "lastName": "User"
      },
      "repliedAt": "2023-12-15T14:30:00Z"
    },
    "createdAt": "2023-12-15T10:00:00Z",
    "updatedAt": "2023-12-15T14:30:00Z"
  }
}
```

---

## 💰 **DISCOUNT MANAGEMENT** (`/api/discounts`)

**Important Note**: As of the latest update, discounts now support **per-user tracking**. Each user can only use a discount code **once**, regardless of the `usageLimit`. The `usedBy` field tracks which users have used the discount and when they used it.

### 🌐 Public Endpoints

#### **GET** `/active` - Get active discounts
**Headers:** `Authorization: Bearer <token>` (optional)
**Query Parameters:** `type=percentage&isPublic=true`
**Description:** Retrieve all active discount codes. If a user is authenticated, discounts they have already used will be filtered out due to per-user tracking.
**Response (200):**
```json
{
  "success": true,
  "message": "Active discounts retrieved successfully",
  "data": {
    "discounts": [
      {
        "_id": "discount123",
        "code": "SAVE10",
        "name": "10% Off Everything",
        "description": "Get 10% off on all products",
        "type": "percentage",
        "value": 10,
        "minimumOrderAmount": 50,
        "maximumDiscountAmount": 100,
        "validFrom": "2023-09-01T00:00:00Z",
        "validUntil": "2023-12-31T23:59:59Z",
        "isPublic": true,
        "applicableProducts": [],
        "applicableCategories": ["64f1a2b3c4d5e6f7g8h9i0j1"],
        "usageLimit": 1000,
        "usedCount": 245,
        "isActive": true
      }
    ],
    "totalActive": 5
  }
}
```

### 👨‍💼 Admin Endpoints

#### **POST** `/` - Create new discount
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "code": "SAVE20",
  "name": "20% Off Summer Sale",
  "description": "Special summer discount",
  "type": "percentage",
  "value": 20,
  "minimumOrderAmount": 100,
  "maximumDiscountAmount": 200,
  "usageLimit": 500,
  "validFrom": "2023-09-15T00:00:00Z",
  "validUntil": "2023-10-15T23:59:59Z",
  "applicableProducts": ["64f1a2b3c4d5e6f7g8h9i0j2"],
  "applicableCategories": ["64f1a2b3c4d5e6f7g8h9i0j1"],
  "applicableUsers": [],
  "isPublic": true
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Discount created successfully",
  "data": {
    "discount": {
      "_id": "discount123",
      "code": "SAVE20",
      "name": "20% Off Summer Sale",
      "description": "Special summer discount",
      "type": "percentage",
      "value": 20,
      "minimumOrderAmount": 100,
      "maximumDiscountAmount": 200,
      "usageLimit": 500,
      "validFrom": "2023-09-15T00:00:00Z",
      "validUntil": "2023-10-15T23:59:59Z",
      "isPublic": true,
      "isActive": true,
      "createdAt": "2023-09-15T10:00:00Z"
    }
  }
}
```

#### **GET** `/` - Get all discounts with filtering
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:** `page=1&limit=20&isActive=true&type=percentage&sortBy=createdAt&sortOrder=desc`
**Response (200):**
```json
{
  "success": true,
  "message": "Discounts retrieved successfully",
  "data": {
    "discounts": [
      {
        "_id": "discount123",
        "code": "SAVE20",
        "name": "20% Off Summer Sale",
        "description": "Special summer discount",
        "type": "percentage",
        "value": 20,
        "minimumOrderAmount": 100,
        "maximumDiscountAmount": 200,
        "usageLimit": 500,
        "usedCount": 45,
        "usedBy": [
          {
            "user": {
              "_id": "user123",
              "firstName": "John",
              "lastName": "Doe",
              "email": "john@example.com"
            },
            "usedAt": "2023-09-15T10:30:00Z"
          },
          {
            "user": {
              "_id": "user456",
              "firstName": "Jane",
              "lastName": "Smith",
              "email": "jane@example.com"
            },
            "usedAt": "2023-09-16T14:20:00Z"
          }
        ],
        "validFrom": "2023-09-15T00:00:00Z",
        "validUntil": "2023-10-15T23:59:59Z",
        "isPublic": true,
        "isActive": true,
        "createdAt": "2023-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDiscounts": 87,
      "hasNext": true
    }
  }
}
```

#### **GET** `/stats` - Get discount statistics
**Headers:** `Authorization: Bearer <admin_token>`
**Description:** Retrieve discount code usage statistics. With per-user tracking enabled, `totalUsage` represents unique users who have used discounts.
**Response (200):**
```json
{
  "success": true,
  "message": "Discount statistics retrieved successfully",
  "data": {
    "stats": {
      "totalDiscounts": 25,
      "activeDiscounts": 15,
      "expiredDiscounts": 8,
      "totalUsage": 1247,
      "totalSavings": 12450.75,
      "topDiscounts": [
        {
          "code": "SAVE10",
          "name": "10% Off Everything",
          "usedCount": 456,
          "totalSavings": 4560.50
        }
      ],
      "recentActivity": [
        {
          "discountCode": "SAVE20",
          "action": "created",
          "timestamp": "2023-09-15T10:00:00Z"
        }
      ]
    }
  }
}
```

#### **GET** `/{discountId}` - Get discount by ID
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Discount retrieved successfully",
  "data": {
    "discount": {
      "_id": "discount123",
      "code": "SAVE20",
      "name": "20% Off Summer Sale",
      "description": "Special summer discount",
      "type": "percentage",
      "value": 20,
      "minimumOrderAmount": 100,
      "maximumDiscountAmount": 200,
      "usageLimit": 500,
      "usedCount": 45,
      "usedBy": [
        {
          "user": {
            "_id": "user123",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com"
          },
          "usedAt": "2023-09-15T10:30:00Z"
        },
        {
          "user": {
            "_id": "user456",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane@example.com"
          },
          "usedAt": "2023-09-16T14:20:00Z"
        }
      ],
      "validFrom": "2023-09-15T00:00:00Z",
      "validUntil": "2023-10-15T23:59:59Z",
      "isPublic": true,
      "isActive": true,
      "applicableProducts": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Premium Cotton T-Shirt"
        }
      ],
      "applicableCategories": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "name": "T-Shirts"
        }
      ],
      "createdAt": "2023-09-15T10:00:00Z",
      "updatedAt": "2023-09-15T10:00:00Z"
    }
  }
}
```

#### **PUT** `/{discountId}` - Update discount
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "name": "Updated Summer Sale",
  "description": "Updated description for summer discount",
  "value": 25,
  "maximumDiscountAmount": 250,
  "validUntil": "2023-11-15T23:59:59Z"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Discount updated successfully",
  "data": {
    "discount": {
      "_id": "discount123",
      "name": "Updated Summer Sale",
      "description": "Updated description for summer discount",
      "value": 25,
      "maximumDiscountAmount": 250,
      "validUntil": "2023-11-15T23:59:59Z",
      "updatedAt": "2023-09-15T11:00:00Z"
    }
  }
}
```

#### **DELETE** `/{discountId}` - Delete discount
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Discount deleted successfully"
}
```

#### **PATCH** `/{discountId}/toggle-status` - Toggle discount status
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Discount status updated successfully",
  "data": {
    "discount": {
      "_id": "discount123",
      "isActive": false,
      "updatedAt": "2023-09-15T12:00:00Z"
    }
  }
}
```

---

## 🔧 **Debug Endpoints** (Development Only)

### 👨‍💼 Admin Debug Endpoints

#### **GET** `/discounts/debug/all` - Get all discounts for debugging
**Headers:** `Authorization: Bearer <admin_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "All discounts retrieved for debugging",
  "data": [
    {
      "_id": "discount123",
      "code": "SAVE10",
      "name": "10% Off Everything",
      "isActive": true,
      "validFrom": "2023-09-01T00:00:00Z",
      "validUntil": "2023-12-31T23:59:59Z"
    }
  ],
  "count": 25
}
```

#### **GET** `/cart/debug/discounts` - Debug cart discount functionality
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Cart discount debug information",
  "data": {
    "cartId": "cart123",
    "applicableDiscounts": [
      {
        "code": "SAVE10",
        "name": "10% Off Everything",
        "amount": 4.99,
        "isApplicable": true
      }
    ],
    "appliedDiscount": {
      "code": "SAVE10",
      "amount": 4.99
    }
  }
}
```

---

## 📋 **Endpoint Summary by Access Level**

### 🌐 **Public Endpoints (16)**
- **User Management**: Registration, Login
- **Product Management**: Browse products, Search, Featured products, Product details
- **Category Management**: View categories, Category tree, Category products
- **Review Management**: Read reviews, Product reviews
- **Discount Management**: View active discounts

### 👤 **Customer Endpoints (21)**
- **User Management**: Profile management, Avatar upload, Password change
- **Cart Management**: Full cart operations (add, update, remove, apply discounts)
- **Order Management**: Create orders, View orders, Update delivery address, Cancel orders, Validate discounts, Rate delivery persons
- **Review Management**: Create reviews, Update reviews, Delete reviews, View user reviews

### 👨‍💼 **Admin Endpoints (44)**
- **User Management**: User CRUD, Role management, User activation/deactivation
- **Product Management**: Product CRUD, Image management, Low stock alerts
- **Order Management**: Order management, Status updates, Shipping details, Payment updates, Analytics
- **Category Management**: Category CRUD, Image upload
- **Review Management**: Review moderation, Approve/reject reviews, Admin replies
- **Discount Management**: Discount CRUD, Statistics, Status management
- **Delivery Management**: Assign delivery persons, View delivery persons, Reassign orders, Delivery statistics
- **Delivery Rating**: View delivery person ratings, View all delivery persons with ratings
- **Inventory Management**: Stock overview, Low stock alerts, Stock movements, Manual adjustments, Stock transfers, Bulk updates, Inventory reports
- **Payment Management**: Payment overview, Statistics, Reports, Payment tracking, Manual payment updates

### 🚚 **Delivery Person Endpoints (6)**
- **Delivery Management**: View assigned orders, Update delivery status, View order details
- **Payment Management**: View assigned payments, Collect payments, Report collection issues

---

## 🔐 **Security Features**

### Authentication
- **JWT-based authentication** with Bearer tokens
- **Token expiration handling** with automatic refresh capability
- **User account status validation** (active/inactive accounts)
- **Optional authentication** for some public endpoints

### Authorization
- **Role-based access control** (customer/admin/deliveryperson)
- **Resource ownership validation** (users can only access their own data)
- **Admin privilege verification** for administrative operations
- **Delivery person access control** for delivery-specific operations
- **Order ownership checks** for order-related operations

### Validation
- **Comprehensive input validation** on all endpoints
- **Business rule enforcement** (stock checks, discount validation)
- **Data sanitization** to prevent injection attacks
- **File upload validation** with size and type restrictions

---

## 📊 **API Response Format**

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 95,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🚚 **DELIVERY MANAGEMENT** (`/api/delivery`)

### 👨‍💼 Admin Only Endpoints

#### **POST** `/orders/:orderId/assign` - Assign delivery person to order
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "deliveryPersonId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Delivery person assigned successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "orderNumber": "TB000001",
    "customer": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US"
      }
    },
    "deliveryPerson": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike.johnson@example.com",
      "phone": "+1234567891"
    },
    "status": "assigned",
    "assignedAt": "2023-12-15T10:30:00Z",
    "items": [...],
    "totalAmount": 1500,
    "statusHistory": [...]
  }
}
```

#### **GET** `/delivery-persons` - Get all delivery persons
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:**
- `isActive` (boolean, optional) - Filter by active status
- `search` (string, optional) - Search by name, email, or phone
- `sortBy` (string, optional) - Sort field (firstName, lastName, email, createdAt, lastLogin)
- `sortOrder` (string, optional) - Sort order (asc, desc)
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery persons retrieved successfully",
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike.johnson@example.com",
      "phone": "+1234567891",
      "role": "deliveryperson",
      "isActive": true,
      "stats": {
        "totalAssigned": 25,
        "totalDelivered": 20,
        "totalCompleted": 18,
        "averageDeliveryTime": 3600000
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalDeliveryPersons": 45,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### **PUT** `/orders/:orderId/reassign` - Reassign order to different delivery person
**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "deliveryPersonId": "64f1a2b3c4d5e6f7g8h9i0j4"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Order reassigned successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "deliveryPerson": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "firstName": "Sarah",
      "lastName": "Wilson",
      "email": "sarah.wilson@example.com",
      "phone": "+1234567892"
    },
    "assignedAt": "2023-12-15T14:30:00Z",
    "statusHistory": [...]
  }
}
```

#### **GET** `/stats` - Get delivery statistics
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:**
- `dateFrom` (string, optional) - Start date (ISO 8601 format)
- `dateTo` (string, optional) - End date (ISO 8601 format)

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery statistics retrieved successfully",
  "data": {
    "overall": {
      "totalAssigned": 150,
      "totalDelivered": 120,
      "totalCompleted": 110,
      "averageDeliveryTime": 3240000
    },
    "deliveryPersons": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "deliveryPersonName": "Mike Johnson",
        "totalAssigned": 25,
        "totalDelivered": 20,
        "totalCompleted": 18,
        "averageDeliveryTime": 3600000,
        "deliveryRate": 80
      }
    ]
  }
}
```

### 🚚 Delivery Person Only Endpoints

#### **GET** `/my-orders` - Get orders assigned to delivery person
**Headers:** `Authorization: Bearer <deliveryperson_token>`
**Query Parameters:**
- `status` (string|array, optional) - Filter by status (assigned, out_for_delivery, delivered, completed)
- `dateFrom` (string, optional) - Filter from assignment date
- `dateTo` (string, optional) - Filter to assignment date
- `sortBy` (string, optional) - Sort field (assignedAt, status, createdAt, totalAmount)
- `sortOrder` (string, optional) - Sort order (asc, desc)
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery orders retrieved successfully",
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "orderNumber": "TB000001",
      "customer": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "US"
        }
      },
      "status": "assigned",
      "assignedAt": "2023-12-15T10:30:00Z",
      "items": [
        {
          "product": {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
            "name": "Nike Air Max 270",
            "brand": "Nike",
            "images": ["https://example.com/image1.jpg"]
          },
          "quantity": 1,
          "unitPrice": 120,
          "totalPrice": 120
        }
      ],
      "totalAmount": 1500,
      "deliveryAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US",
        "phone": "+1234567890"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalOrders": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### **PUT** `/orders/:orderId/status` - Update delivery status
**Headers:** `Authorization: Bearer <deliveryperson_token>`, `Content-Type: application/json`
**Request Body:**
```json
{
  "status": "out_for_delivery",
  "estimatedDeliveryTime": "2023-12-15T16:00:00Z",
  "deliveryNotes": "Customer requested delivery after 4 PM"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Delivery status updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "status": "out_for_delivery",
    "shipping": {
      "deliveryPersonEstimatedTime": "2023-12-15T16:00:00Z",
      "deliveryNotes": "Customer requested delivery after 4 PM"
    },
    "statusHistory": [
      {
        "status": "out_for_delivery",
        "changedAt": "2023-12-15T15:30:00Z",
        "changedBy": "64f1a2b3c4d5e6f7g8h9i0j1",
        "notes": "Customer requested delivery after 4 PM"
      }
    ]
  }
}
```

#### **GET** `/orders/:orderId` - Get order details for delivery person
**Headers:** `Authorization: Bearer <deliveryperson_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "orderNumber": "TB000001",
    "customer": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US"
      }
    },
    "deliveryPerson": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike.johnson@example.com",
      "phone": "+1234567891"
    },
    "status": "out_for_delivery",
    "assignedAt": "2023-12-15T10:30:00Z",
    "items": [...],
    "totalAmount": 1500,
    "deliveryAddress": {...},
    "payment": {
      "method": "cash_on_delivery",
      "status": "pending"
    },
    "shipping": {
      "deliveryPersonEstimatedTime": "2023-12-15T16:00:00Z",
      "deliveryNotes": "Customer requested delivery after 4 PM"
    },
    "statusHistory": [...],
    "createdAt": "2023-12-15T09:00:00Z",
    "updatedAt": "2023-12-15T15:30:00Z"
  }
}
```

### 🚚 Delivery Management Features

#### **Order Status Workflow**
```
pending → confirmed → assigned → out_for_delivery → delivered → completed
```

#### **Status Transitions**
- **Admin**: Can assign delivery person to confirmed orders
- **Delivery Person**: Can update status from assigned → out_for_delivery → delivered
- **System**: Automatically tracks status changes and timestamps

#### **Key Features**
- **Real-time Assignment**: Admins can assign orders to delivery persons
- **Delivery Tracking**: Delivery persons can update order status and estimated delivery time
- **Customer Information**: Delivery persons have access to customer contact details and delivery address
- **Performance Analytics**: Admin dashboard with delivery statistics and performance metrics
- **Reassignment**: Admins can reassign orders to different delivery persons
- **Notes & Communication**: Delivery persons can add delivery notes and estimated times

#### **Validation Rules**
- Only confirmed orders can be assigned to delivery persons
- Delivery persons can only update orders assigned to them
- Status transitions follow the defined workflow
- Estimated delivery time must be a valid ISO 8601 date
- Delivery notes are limited to 500 characters

#### **DELETE** `/orders/delivered` - Delete delivered orders
**Headers:** `Authorization: Bearer <admin_token>`
**Query Parameters:**
- `confirmDelete` (required): Must be set to "true" to proceed with deletion
- `dateFrom` (optional): Start date for filtering (ISO 8601 format)
- `dateTo` (optional): End date for filtering (ISO 8601 format)  
- `olderThanDays` (optional): Delete orders older than specified days

**Example Requests:**
```bash
# Delete all delivered orders
DELETE /api/delivery/orders/delivered?confirmDelete=true

# Delete delivered orders from date range
DELETE /api/delivery/orders/delivered?confirmDelete=true&dateFrom=2024-01-01&dateTo=2024-01-31

# Delete delivered orders older than 30 days
DELETE /api/delivery/orders/delivered?confirmDelete=true&olderThanDays=30
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully deleted 5 delivered orders",
  "data": {
    "deletedCount": 5,
    "deletedOrders": [
      {
        "orderNumber": "TB000001",
        "customerName": "John Doe",
        "totalAmount": 2500.00,
        "deliveredAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "orderNumber": "TB000002", 
        "customerName": "Jane Smith",
        "totalAmount": 1800.00,
        "deliveredAt": "2024-01-16T14:20:00.000Z"
      }
    ]
  }
}
```

**Response (400) - Missing confirmation:**
```json
{
  "success": false,
  "message": "This action requires confirmation. Add confirmDelete=true to the query parameters to proceed."
}
```

**Response (404) - No orders found:**
```json
{
  "success": false,
  "message": "No delivered orders found matching the criteria"
}
```

**Features:**
- **Safety First**: Requires explicit confirmation to prevent accidental deletions
- **Flexible Filtering**: Multiple ways to filter which orders to delete
- **Audit Trail**: Comprehensive logging of deleted orders for compliance
- **Admin Only**: Restricted to admin users for security
- **Detailed Response**: Returns information about deleted orders

**Use Cases:**
- **Database Cleanup**: Remove old delivered orders to maintain performance
- **Compliance**: Archive orders after retention period
- **Storage Management**: Free up database space by removing completed orders
- **Data Privacy**: Remove customer data after specified period

---

## 🚀 **Usage Guidelines**

### Rate Limiting
- **Standard rate limits** apply to all endpoints (typically 100 requests per 15 minutes)
- **Admin endpoints** may have higher limits (500 requests per 15 minutes)
- **File upload endpoints** have separate rate limits

### Pagination
- **List endpoints** support pagination with `page` and `limit` parameters
- **Default page size**: 10-20 items depending on endpoint
- **Maximum limit**: Usually 100 items per page
- **Pagination metadata** included in response

### Filtering & Sorting
- **Common filters**: `search`, `category`, `brand`, `gender`, `price`, `status`, `rating`
- **Date filters**: `createdAt`, `updatedAt` with range support
- **Sorting options**: `sortBy` and `sortOrder` parameters
- **Available sort fields** vary by endpoint (e.g., `name`, `price`, `createdAt`, `rating`)

### File Uploads
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Maximum file size**: 5MB per file
- **Multiple files**: Up to 5 files for product images
- **Cloudinary integration** for image storage and optimization

---

## 📝 **Implementation Notes**

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Query Parameters
- Use URL encoding for special characters
- Boolean parameters: `true`/`false` or `1`/`0`
- Date parameters: ISO 8601 format (`2023-09-15T10:00:00Z`)

### Error Handling
- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Business rule violations (e.g., duplicate email)
- **500 Internal Server Error**: Server-side errors

### Data Validation
- **Email format**: RFC 5322 compliant
- **Password requirements**: Minimum 6 characters
- **Phone numbers**: International format supported
- **MongoDB ObjectIds**: 24-character hex strings
- **File uploads**: MIME type validation

---

## 🔄 **Workflow Examples**

### Customer Purchase Flow
1. **Browse products** (`GET /products`)
2. **Add to cart** (`POST /cart/items`)
3. **Apply discount** (`POST /cart/apply-discount`)
4. **Create order** (`POST /orders`)
5. **Track order** (`GET /orders/{orderId}`)

### Admin Product Management
1. **Create product** (`POST /products`)
2. **Upload images** (`POST /products/{id}/upload-images`)
3. **Update product** (`PUT /products/{id}`)
4. **Monitor stock** (`GET /products/low-stock`)

### Review Moderation
1. **View pending reviews** (`GET /reviews/admin/pending`)
2. **Approve/Reject** (`PATCH /reviews/{id}/approve` or `/reject`)
3. **Add admin reply** (`POST /reviews/{id}/reply`)

### Delivery Management Flow
1. **Admin assigns delivery person** (`POST /delivery/orders/{id}/assign`)
2. **Delivery person views assigned orders** (`GET /delivery/my-orders`)
3. **Update delivery status** (`PUT /delivery/orders/{id}/status`)
4. **Track delivery performance** (`GET /delivery/stats`)
5. **Clean up delivered orders** (`DELETE /delivery/orders/delivered`)

---

## 📈 **Performance Considerations**

- **Database indexing** on frequently queried fields
- **Pagination** to limit response sizes
- **Image optimization** through Cloudinary
- **Caching** for frequently accessed data
- **Rate limiting** to prevent abuse

---

*Last Updated: December 2024*
*API Version: 1.0*
*Total Endpoints: 88*
