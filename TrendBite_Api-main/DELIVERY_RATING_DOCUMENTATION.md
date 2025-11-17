# 🌟 Delivery Person Rating System Documentation

## Overview

The Delivery Person Rating System allows customers to rate and provide feedback on delivery personnel after receiving their orders. This system helps maintain service quality and provides valuable performance metrics for delivery management.

---

## 📋 Table of Contents

1. [Features](#features)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Usage Flow](#usage-flow)
5. [Examples](#examples)

---

## ✨ Features

- **Customer Ratings**: Customers can rate delivery persons (1-5 stars) after order delivery
- **Feedback System**: Optional text feedback for detailed delivery experience
- **Performance Tracking**: Automatic calculation of delivery person statistics
- **Rating History**: View all ratings and feedback for any delivery person
- **Admin Dashboard**: Access aggregated ratings and performance metrics
- **Validation**: Prevents duplicate ratings and ensures only delivered orders can be rated

---

## 🔗 API Endpoints

### 1. Rate Delivery Person (Customer)

**Endpoint**: `POST /api/orders/:orderId/rate-delivery`

**Authentication**: Required (Customer role)

**Description**: Allows customers to rate the delivery person after order delivery.

**Request Parameters**:
- `orderId` (path parameter): The ID of the delivered order

**Request Body**:
```json
{
  "rating": 5,
  "feedback": "Excellent service! Very professional and on time."
}
```

**Response** (200 OK):
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
      "totalRatings": 156
    }
  }
}
```

**Validation Rules**:
- Rating must be an integer between 1 and 5
- Feedback is optional, maximum 500 characters
- Order must be in 'delivered' or 'completed' status
- Only the customer who placed the order can rate
- Each order can only be rated once
- Delivery person must have been assigned to the order

**Error Responses**:

```json
// 400 - Rating validation failed
{
  "success": false,
  "message": "Rating must be an integer between 1 and 5"
}

// 400 - Order not delivered
{
  "success": false,
  "message": "You can only rate delivery after the order has been delivered"
}

// 400 - Already rated
{
  "success": false,
  "message": "You have already rated the delivery for this order"
}

// 403 - Access denied
{
  "success": false,
  "message": "Access denied. You can only rate delivery for your own orders."
}

// 404 - Order not found
{
  "success": false,
  "message": "Order not found"
}
```

---

### 2. Get Delivery Person Ratings (Admin)

**Endpoint**: `GET /api/orders/delivery-ratings/:deliveryPersonId`

**Authentication**: Required (Admin role)

**Description**: Retrieves all ratings and feedback for a specific delivery person.

**Request Parameters**:
- `deliveryPersonId` (path parameter): The ID of the delivery person

**Query Parameters**:
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10, max: 100): Number of ratings per page
- `sortBy` (optional, default: 'ratedAt'): Sort field ('ratedAt' or 'rating')
- `sortOrder` (optional, default: 'desc'): Sort order ('asc' or 'desc')

**Example Request**:
```
GET /api/orders/delivery-ratings/123456abcdef123456789012?page=1&limit=10&sortBy=ratedAt&sortOrder=desc
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Delivery person ratings retrieved successfully",
  "data": {
    "deliveryPerson": {
      "id": "123456abcdef123456789012",
      "name": "John Doe",
      "averageRating": 4.8,
      "totalRatings": 156,
      "totalDeliveries": 200
    },
    "ratingDistribution": {
      "5": 120,
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
          "avatar": {
            "url": "https://cloudinary.com/avatar.jpg"
          }
        },
        "rating": 5,
        "feedback": "Excellent service! Very professional and on time.",
        "ratedAt": "2025-10-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 16,
      "totalRatings": 156,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Responses**:

```json
// 404 - Delivery person not found
{
  "success": false,
  "message": "Delivery person not found"
}

// 400 - Invalid user role
{
  "success": false,
  "message": "User is not a delivery person"
}
```

---

### 3. Get All Delivery Persons with Ratings (Admin)

**Endpoint**: `GET /api/orders/delivery-persons/ratings`

**Authentication**: Required (Admin role)

**Description**: Retrieves all delivery persons with their rating statistics and performance metrics.

**Query Parameters**:
- `sortBy` (optional, default: 'averageRating'): Sort field
  - Options: 'averageRating', 'totalRatings', 'totalDeliveries'
- `sortOrder` (optional, default: 'desc'): Sort order ('asc' or 'desc')

**Example Request**:
```
GET /api/orders/delivery-persons/ratings?sortBy=averageRating&sortOrder=desc
```

**Response** (200 OK):
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
        "avatar": {
          "url": "https://cloudinary.com/avatar.jpg"
        },
        "stats": {
          "averageRating": 4.8,
          "totalRatings": 156,
          "totalDeliveries": 200,
          "totalOrders": 215,
          "deliveredOrders": 200,
          "pendingOrders": 5,
          "deliveryRate": 93.0
        }
      },
      {
        "id": "789012abcdef123456789012",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+94777654321",
        "avatar": {
          "url": "https://cloudinary.com/avatar2.jpg"
        },
        "stats": {
          "averageRating": 4.6,
          "totalRatings": 98,
          "totalDeliveries": 120,
          "totalOrders": 125,
          "deliveredOrders": 120,
          "pendingOrders": 2,
          "deliveryRate": 96.0
        }
      }
    ],
    "total": 2
  }
}
```

---

### 4. Updated Delivery Stats (Admin)

**Endpoint**: `GET /api/delivery/stats`

**Authentication**: Required (Admin role)

**Description**: Get delivery statistics including new rating metrics.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Delivery statistics retrieved successfully",
  "data": {
    "overall": {
      "totalAssigned": 500,
      "totalDelivered": 450,
      "totalCompleted": 430,
      "averageDeliveryTime": 3600000
    },
    "deliveryPersons": [
      {
        "_id": "123456abcdef123456789012",
        "deliveryPersonName": "John Doe",
        "totalAssigned": 215,
        "totalDelivered": 200,
        "totalCompleted": 195,
        "averageDeliveryTime": 3200000,
        "deliveryRate": 93.02,
        "averageRating": 4.8,
        "totalRatings": 156,
        "totalDeliveriesCount": 200
      }
    ]
  }
}
```

---

## 📊 Data Models

### Order Model Updates

Added `deliveryRating` field to track delivery person ratings:

```javascript
deliveryRating: {
  rating: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ratedAt: {
    type: Date
  }
}
```

### User Model Updates

Added `deliveryStats` field for delivery person performance metrics:

```javascript
deliveryStats: {
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0,
    min: 0
  }
}
```

---

## 🔄 Usage Flow

### Customer Rating Flow

1. **Order Delivery**: Delivery person marks order as 'delivered'
2. **Customer Access**: Customer receives notification about delivered order
3. **Rating Submission**: Customer rates delivery via mobile/web app
   - Selects rating (1-5 stars)
   - Optionally adds text feedback
   - Submits rating
4. **Validation**: System validates:
   - Order belongs to customer
   - Order is delivered
   - Not already rated
   - Delivery person was assigned
5. **Update Stats**: System automatically:
   - Saves rating to order
   - Updates delivery person's average rating
   - Increments total ratings count

### Admin Monitoring Flow

1. **View Performance**: Admin accesses delivery person dashboard
2. **Check Ratings**: Views individual delivery person ratings
3. **Analyze Feedback**: Reviews customer feedback for service improvement
4. **Performance Review**: Uses metrics for delivery person evaluation
5. **Action**: Takes appropriate actions based on performance data

---

## 📝 Examples

### Example 1: Customer Rates Delivery

**Request**:
```bash
curl -X POST "https://api.trendbite.com/api/orders/654321abcdef123456789012/rate-delivery" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Very friendly and professional. Delivered on time!"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Delivery rating submitted successfully",
  "data": {
    "orderId": "654321abcdef123456789012",
    "orderNumber": "TB000123",
    "deliveryRating": {
      "rating": 5,
      "feedback": "Very friendly and professional. Delivered on time!",
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

### Example 2: Admin Views Delivery Person Ratings

**Request**:
```bash
curl -X GET "https://api.trendbite.com/api/orders/delivery-ratings/123456abcdef123456789012?page=1&limit=5" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response**:
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
          "name": "Jane Smith"
        },
        "rating": 5,
        "feedback": "Very friendly and professional. Delivered on time!",
        "ratedAt": "2025-10-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 32,
      "totalRatings": 157,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Example 3: Admin Views All Delivery Persons with Ratings

**Request**:
```bash
curl -X GET "https://api.trendbite.com/api/orders/delivery-persons/ratings?sortBy=averageRating&sortOrder=desc" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response**:
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

---

## 🔒 Security & Validation

### Authorization

- **Customer Endpoints**: Only authenticated customers can rate their own orders
- **Admin Endpoints**: Only admins can view ratings and statistics
- **Delivery Person**: Cannot rate themselves or view their own ratings through customer endpoints

### Validation Rules

1. **Rating Value**:
   - Must be an integer
   - Range: 1 to 5 (inclusive)
   - Required field

2. **Feedback**:
   - Optional field
   - Maximum length: 500 characters
   - Trimmed automatically

3. **Order Status**:
   - Must be 'delivered' or 'completed'
   - Cannot rate pending or in-progress orders

4. **Ownership**:
   - Customer must be the order owner
   - Delivery person must have been assigned

5. **Duplicate Prevention**:
   - Each order can only be rated once
   - System checks for existing rating before submission

---

## 📈 Performance Metrics

### Delivery Person Statistics

The system automatically tracks and calculates:

1. **Average Rating**: Weighted average of all ratings received
   - Calculated: (Sum of all ratings) / (Total number of ratings)
   - Rounded to 1 decimal place
   - Updated in real-time when new rating is submitted

2. **Total Ratings**: Count of all ratings received
   - Incremented with each new rating
   - Used for statistical significance

3. **Total Deliveries**: Count of successfully delivered orders
   - Incremented when order status changes to 'delivered'
   - Independent of ratings (not all deliveries may be rated)

4. **Delivery Rate**: Percentage of successful deliveries
   - Calculated: (Delivered Orders / Total Assigned Orders) × 100
   - Indicates completion rate

5. **Rating Distribution**: Breakdown of ratings by star value
   - Shows count for each rating (1-5 stars)
   - Helps identify consistency and trends

---

## 🚀 Best Practices

### For Customers

1. **Rate Promptly**: Rate delivery soon after receiving order for accurate feedback
2. **Be Honest**: Provide genuine feedback to help improve service
3. **Be Specific**: Include details in feedback for actionable insights
4. **Be Fair**: Consider factors like weather, traffic when rating

### For Admins

1. **Monitor Regularly**: Check ratings and feedback periodically
2. **Address Issues**: Follow up on low ratings and negative feedback
3. **Recognize Excellence**: Reward high-performing delivery personnel
4. **Track Trends**: Use rating distribution to identify patterns
5. **Use Metrics**: Combine ratings with other performance indicators

### For Developers

1. **Validate Input**: Always validate rating values and feedback length
2. **Handle Errors**: Provide clear error messages for validation failures
3. **Prevent Duplicates**: Check for existing ratings before submission
4. **Update Stats**: Ensure delivery person stats are updated atomically
5. **Index Fields**: Create database indexes on rating fields for better performance

---

## 🛠️ Technical Notes

### Database Indexes

Recommended indexes for optimal performance:

```javascript
// Order collection
db.orders.createIndex({ "deliveryRating.rating": 1 });
db.orders.createIndex({ "deliveryRating.ratedAt": -1 });
db.orders.createIndex({ "deliveryPerson": 1, "deliveryRating.rating": 1 });

// User collection
db.users.createIndex({ "deliveryStats.averageRating": -1 });
db.users.createIndex({ "deliveryStats.totalRatings": -1 });
db.users.createIndex({ "role": 1, "deliveryStats.averageRating": -1 });
```

### Calculation Logic

**Average Rating Update**:
```javascript
const currentTotal = deliveryPerson.deliveryStats.totalRatings || 0;
const currentAverage = deliveryPerson.deliveryStats.averageRating || 0;
const newTotal = currentTotal + 1;
const newAverage = ((currentAverage * currentTotal) + newRating) / newTotal;
deliveryPerson.deliveryStats.averageRating = Math.round(newAverage * 10) / 10;
```

---

## 📞 Support

For issues or questions regarding the Delivery Rating System:
- Technical Support: tech@trendbite.com
- API Documentation: https://api.trendbite.com/docs
- Status Page: https://status.trendbite.com

---

## 📄 Changelog

### Version 1.0.0 (2025-10-10)
- ✨ Initial implementation of delivery person rating system
- ✨ Customer rating submission endpoint
- ✨ Admin rating retrieval endpoints
- ✨ Automatic statistics calculation
- ✨ Rating distribution analytics
- ✨ Integration with existing delivery system

---

*Last Updated: October 10, 2025*

