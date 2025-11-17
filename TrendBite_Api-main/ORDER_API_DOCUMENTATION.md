# TrendBite Order Management API Documentation

## Overview
This document provides comprehensive documentation for the TrendBite Order Management API. The system includes order creation, management, tracking, and discount code functionality.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Order Management Endpoints

### 1. Create Order
**POST** `/orders`

Creates a new order for the authenticated customer.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "64a1b2c3d4e5f6789012345",
      "variant": {
        "size": "M",
        "color": {
          "name": "Blue",
          "hex": "#0000FF"
        },
        "sku": "TB-SHIRT-M-BLUE-001"
      },
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Colombo",
    "state": "Western Province",
    "zipCode": "00100",
    "country": "Sri Lanka",
    "phone": "+94771234567"
  },
  "billingAddress": {
    "street": "123 Main Street",
    "city": "Colombo",
    "state": "Western Province",
    "zipCode": "00100",
    "country": "Sri Lanka"
  },
  "paymentMethod": "cash_on_delivery",
  "discountCode": "WELCOME10",
  "notes": "Please deliver after 6 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "orderNumber": "TB000001",
    "customer": "64a1b2c3d4e5f6789012347",
    "status": "pending",
    "items": [...],
    "subtotal": 2000,
    "deliveryCost": 400,
    "discount": {
      "code": "WELCOME10",
      "amount": 200,
      "type": "fixed"
    },
    "totalAmount": 2200,
    "deliveryAddress": {...},
    "billingAddress": {...},
    "payment": {
      "method": "cash_on_delivery",
      "status": "pending"
    },
    "shipping": {
      "method": "standard",
      "trackingNumber": null,
      "estimatedDeliveryDate": null,
      "actualDeliveryDate": null,
      "deliveryPartner": null
    },
    "statusHistory": [...],
    "notes": "Please deliver after 6 PM",
    "currency": "LKR",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Customer Orders
**GET** `/orders/my-orders`

Retrieves orders for the authenticated customer.

**Query Parameters:**
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Customer orders retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Get Order by ID
**GET** `/orders/:orderId`

Retrieves a specific order by ID. Customers can only view their own orders.

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "orderNumber": "TB000001",
    "customer": {
      "_id": "64a1b2c3d4e5f6789012347",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+94771234567"
    },
    "status": "confirmed",
    "items": [
      {
        "product": {
          "_id": "64a1b2c3d4e5f6789012345",
          "name": "Cotton T-Shirt",
          "brand": "TrendBite",
          "images": [...]
        },
        "variant": {
          "size": "M",
          "color": {
            "name": "Blue",
            "hex": "#0000FF"
          },
          "sku": "TB-SHIRT-M-BLUE-001"
        },
        "quantity": 2,
        "unitPrice": 1000,
        "totalPrice": 2000
      }
    ],
    "subtotal": 2000,
    "deliveryCost": 400,
    "discount": {
      "code": "WELCOME10",
      "amount": 200,
      "type": "fixed"
    },
    "totalAmount": 2200,
    "deliveryAddress": {...},
    "billingAddress": {...},
    "payment": {
      "method": "cash_on_delivery",
      "status": "pending",
      "transactionId": null,
      "paidAt": null
    },
    "shipping": {
      "method": "standard",
      "trackingNumber": null,
      "estimatedDeliveryDate": null,
      "actualDeliveryDate": null,
      "deliveryPartner": null
    },
    "statusHistory": [
      {
        "status": "pending",
        "changedAt": "2024-01-15T10:30:00.000Z",
        "changedBy": null,
        "notes": "Order created"
      },
      {
        "status": "confirmed",
        "changedAt": "2024-01-15T11:00:00.000Z",
        "changedBy": "64a1b2c3d4e5f6789012348",
        "notes": "Order confirmed by admin"
      }
    ],
    "notes": "Please deliver after 6 PM",
    "currency": "LKR",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 4. Update Delivery Address
**PUT** `/orders/:orderId/delivery-address`

Updates the delivery address for an order (customers only, before processing).

**Request Body:**
```json
{
  "deliveryAddress": {
    "street": "456 New Street",
    "city": "Kandy",
    "state": "Central Province",
    "zipCode": "20000",
    "country": "Sri Lanka",
    "phone": "+94771234568"
  }
}
```

### 5. Cancel Order
**PUT** `/orders/:orderId/cancel`

Cancels an order (customers only, before processing).

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

### 6. Validate Discount Code
**GET** `/orders/validate-discount`

Validates a discount code and calculates the discount amount.

**Request Body:**
```json
{
  "code": "WELCOME10",
  "orderAmount": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount code is valid",
  "data": {
    "code": "WELCOME10",
    "name": "Welcome Discount",
    "type": "fixed",
    "value": 200,
    "discountAmount": 200,
    "displayValue": "LKR 200"
  }
}
```

## Admin Order Management Endpoints

### 7. Get All Orders (Admin)
**GET** `/orders`

Retrieves all orders with filtering options (admin only).

**Query Parameters:**
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `customer` (optional): Filter by customer ID
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)
- `search` (optional): Search by order number, customer email, or phone
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

### 8. Update Order Status (Admin)
**PUT** `/orders/:orderId/status`

Updates the status of an order (admin only).

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Order is being prepared for shipping"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `processing`
- `hand_over_to_delivery_partner`
- `delivered`
- `completed`
- `cancelled`

### 9. Update Shipping Details (Admin)
**PUT** `/orders/:orderId/shipping`

Updates shipping information for an order (admin only).

**Request Body:**
```json
{
  "trackingNumber": "TB123456789",
  "deliveryPartner": "Express Delivery",
  "estimatedDeliveryDate": "2024-01-20T18:00:00.000Z"
}
```

### 10. Update Payment Status (Admin)
**PUT** `/orders/:orderId/payment`

Updates payment information for an order (admin only).

**Request Body:**
```json
{
  "paymentStatus": "paid",
  "transactionId": "TXN123456789"
}
```

**Valid Payment Status Values:**
- `pending`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`

### 11. Get Order Statistics (Admin)
**GET** `/orders/stats/overview`

Retrieves order statistics (admin only).

**Query Parameters:**
- `dateFrom` (optional): Start date for statistics
- `dateTo` (optional): End date for statistics

**Response:**
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": {
    "totalOrders": 150,
    "totalRevenue": 450000,
    "averageOrderValue": 3000,
    "pendingOrders": 5,
    "completedOrders": 120
  }
}
```

## Discount Management Endpoints

### 12. Get Active Discounts (Public)
**GET** `/discounts/active`

Retrieves all active discount codes available to the user.

**Response:**
```json
{
  "success": true,
  "message": "Active discount codes retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012349",
      "code": "WELCOME10",
      "name": "Welcome Discount",
      "description": "10% off for new customers",
      "type": "fixed",
      "value": 200,
      "minimumOrderAmount": 1000,
      "maximumDiscountAmount": 500,
      "usageLimit": 100,
      "usedCount": 25,
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validUntil": "2024-12-31T23:59:59.000Z",
      "isActive": true,
      "isPublic": true,
      "displayValue": "LKR 200",
      "remainingUsage": 75,
      "isValid": true
    }
  ]
}
```

## Admin Discount Management Endpoints

### 13. Create Discount Code (Admin)
**POST** `/discounts`

Creates a new discount code (admin only).

**Request Body:**
```json
{
  "code": "SUMMER20",
  "name": "Summer Sale",
  "description": "20% off on summer collection",
  "type": "percentage",
  "value": 20,
  "minimumOrderAmount": 2000,
  "maximumDiscountAmount": 1000,
  "usageLimit": 50,
  "validFrom": "2024-06-01T00:00:00.000Z",
  "validUntil": "2024-08-31T23:59:59.000Z",
  "applicableProducts": ["64a1b2c3d4e5f6789012345"],
  "applicableCategories": ["64a1b2c3d4e5f678901234a"],
  "applicableUsers": [],
  "isPublic": true
}
```

### 14. Get All Discounts (Admin)
**GET** `/discounts`

Retrieves all discount codes with filtering options (admin only).

**Query Parameters:**
- `isActive` (optional): Filter by active status
- `isPublic` (optional): Filter by public status
- `type` (optional): Filter by discount type (percentage/fixed)
- `search` (optional): Search by code, name, or description
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

### 15. Get Discount by ID (Admin)
**GET** `/discounts/:discountId`

Retrieves a specific discount code by ID (admin only).

### 16. Update Discount Code (Admin)
**PUT** `/discounts/:discountId`

Updates a discount code (admin only).

### 17. Delete Discount Code (Admin)
**DELETE** `/discounts/:discountId`

Deletes a discount code (admin only).

### 18. Toggle Discount Status (Admin)
**PATCH** `/discounts/:discountId/toggle-status`

Toggles the active status of a discount code (admin only).

### 19. Get Discount Statistics (Admin)
**GET** `/discounts/stats`

Retrieves discount code statistics (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Discount statistics retrieved successfully",
  "data": {
    "totalDiscounts": 10,
    "activeDiscounts": 8,
    "publicDiscounts": 6,
    "totalUsage": 150,
    "percentageDiscounts": 5,
    "fixedDiscounts": 5
  }
}
```

## Order Status Flow

The order status follows this flow:
1. **pending** → Order created, awaiting confirmation
2. **confirmed** → Order confirmed by admin
3. **processing** → Order being prepared
4. **hand_over_to_delivery_partner** → Order handed to delivery partner
5. **delivered** → Order delivered to customer
6. **completed** → Order completed successfully
7. **cancelled** → Order cancelled (can be cancelled by customer before processing or by admin)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Order Items
- Must contain at least one item
- Each item must have valid product ID, variant details, and quantity
- Quantity must be positive integer
- Product must be in stock

### Addresses
- All address fields are required
- Phone number must be valid format
- Country defaults to "Sri Lanka"

### Discount Codes
- Code must be unique and 3-20 characters
- Value must be positive
- Percentage discounts cannot exceed 100%
- Valid dates must be provided
- Usage limit must be positive integer

## Rate Limiting
- No specific rate limiting implemented
- Consider implementing rate limiting for production use

## Security Considerations
- All endpoints require authentication
- Admin endpoints require admin role
- Customers can only access their own orders
- Input validation on all endpoints
- SQL injection protection through Mongoose
- XSS protection through input sanitization
