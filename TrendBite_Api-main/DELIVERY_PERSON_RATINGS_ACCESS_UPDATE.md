# Delivery Person Ratings Access Update 📊

## Overview

This document describes the update to the delivery person ratings endpoint that now allows delivery persons to view their own ratings, in addition to admins who can view all delivery persons' ratings.

## Changes Made

### Previous Behavior

- **Only admins** could access the endpoint `/orders/delivery-ratings/{deliveryPersonId}`
- Delivery persons had no way to view their own performance ratings

### New Behavior

- **Admins** can view any delivery person's ratings (unchanged)
- **Delivery persons** can now view their own ratings
- Delivery persons are restricted to viewing only their own ratings (cannot view other delivery persons' ratings)

## Technical Implementation

### 1. New Authorization Middleware

**File**: `src/middleware/auth.js`

Added a new authorization middleware:

```javascript
// Authorization middleware - Admin or Delivery Person
export const authorizeAdminOrDeliveryPerson = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "deliveryperson") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or delivery person privileges required.",
    });
  }
  next();
};
```

### 2. Updated Route

**File**: `src/routes/orderRoutes.js`

Changed from:

```javascript
router.get(
  "/delivery-ratings/:deliveryPersonId",
  authorizeAdmin,
  validateGetDeliveryPersonRatings,
  getDeliveryPersonRatings
);
```

To:

```javascript
router.get(
  "/delivery-ratings/:deliveryPersonId",
  authorizeAdminOrDeliveryPerson,
  validateGetDeliveryPersonRatings,
  getDeliveryPersonRatings
);
```

### 3. Controller Authorization Check

**File**: `src/controllers/orderController.js`

Added authorization logic in the controller:

```javascript
// Check authorization: delivery person can only view their own ratings
if (req.user.role === "deliveryperson" && req.user.id !== deliveryPersonId) {
  return res.status(403).json({
    success: false,
    message: "Access denied. You can only view your own ratings.",
  });
}
```

This ensures:

- Admins can view any delivery person's ratings
- Delivery persons can only view their own ratings

## API Usage

### Endpoint

**GET** `/api/orders/delivery-ratings/{deliveryPersonId}`

### Authentication

**Required**: Bearer token (Admin or Delivery Person role)

### Authorization Rules

| User Role       | Can View                         | Restrictions                                |
| --------------- | -------------------------------- | ------------------------------------------- |
| Admin           | ✅ Any delivery person's ratings | None                                        |
| Delivery Person | ✅ Own ratings only              | Cannot view other delivery persons' ratings |
| Customer        | ❌ No access                     | -                                           |

### Example Requests

#### 1. Admin Viewing Any Delivery Person's Ratings

```bash
GET /api/orders/delivery-ratings/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Delivery person ratings retrieved successfully",
  "data": {
    "deliveryPerson": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
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
      "totalRatings": 156,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 2. Delivery Person Viewing Their Own Ratings

```bash
# Delivery person with ID: 64f1a2b3c4d5e6f7g8h9i0j1
GET /api/orders/delivery-ratings/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <delivery_person_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Delivery person ratings retrieved successfully",
  "data": {
    "deliveryPerson": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
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
      // ... ratings list
    ]
  }
}
```

#### 3. Delivery Person Trying to View Another Delivery Person's Ratings

```bash
# Delivery person with ID: 64f1a2b3c4d5e6f7g8h9i0j1
# Trying to view ratings for ID: 64f1a2b3c4d5e6f7g8h9i0j2
GET /api/orders/delivery-ratings/64f1a2b3c4d5e6f7g8h9i0j2
Authorization: Bearer <delivery_person_token>
```

**Response** (403 Forbidden):

```json
{
  "success": false,
  "message": "Access denied. You can only view your own ratings."
}
```

#### 4. Customer Trying to Access Ratings

```bash
GET /api/orders/delivery-ratings/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <customer_token>
```

**Response** (403 Forbidden):

```json
{
  "success": false,
  "message": "Access denied. Admin or delivery person privileges required."
}
```

## Query Parameters

Same as before:

| Parameter | Type    | Default   | Description                          |
| --------- | ------- | --------- | ------------------------------------ |
| page      | integer | 1         | Page number for pagination           |
| limit     | integer | 10        | Number of ratings per page (max 100) |
| sortBy    | string  | 'ratedAt' | Sort field ('ratedAt' or 'rating')   |
| sortOrder | string  | 'desc'    | Sort order ('asc' or 'desc')         |

**Example**:

```bash
GET /api/orders/delivery-ratings/64f1a2b3c4d5e6f7g8h9i0j1?page=1&limit=20&sortBy=rating&sortOrder=desc
```

## Response Data

### Delivery Person Info

```json
{
  "id": "string",
  "name": "string",
  "averageRating": "number (0-5)",
  "totalRatings": "number",
  "totalDeliveries": "number"
}
```

### Rating Distribution

```json
{
  "5": "number (count of 5-star ratings)",
  "4": "number (count of 4-star ratings)",
  "3": "number (count of 3-star ratings)",
  "2": "number (count of 2-star ratings)",
  "1": "number (count of 1-star ratings)"
}
```

### Individual Rating

```json
{
  "orderId": "string",
  "orderNumber": "string",
  "customer": {
    "name": "string",
    "avatar": {
      "url": "string"
    }
  },
  "rating": "number (1-5)",
  "feedback": "string (optional)",
  "ratedAt": "ISO date string"
}
```

## Use Cases

### For Delivery Persons

1. **Performance Tracking**

   - View their average rating
   - See rating distribution
   - Track improvement over time

2. **Customer Feedback**

   - Read customer feedback comments
   - Understand what customers appreciate
   - Identify areas for improvement

3. **Motivation**
   - See positive ratings
   - Celebrate 5-star reviews
   - Set goals for improvement

### For Admins

1. **Performance Management**

   - Monitor all delivery persons' ratings
   - Identify top performers
   - Identify delivery persons needing training

2. **Quality Control**
   - Review complaints and low ratings
   - Take action on consistent issues
   - Recognize and reward excellence

## Frontend Implementation

### Delivery Person Dashboard

```jsx
import { useAuth } from "./hooks/useAuth";
import { useDeliveryRatings } from "./hooks/useDeliveryRatings";

const DeliveryPersonDashboard = () => {
  const { user } = useAuth();
  const { ratings, loading, error } = useDeliveryRatings(user.id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="dashboard">
      <h1>My Performance</h1>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="stat">
          <h2>{ratings.deliveryPerson.averageRating.toFixed(1)}</h2>
          <p>Average Rating</p>
        </div>
        <div className="stat">
          <h2>{ratings.deliveryPerson.totalRatings}</h2>
          <p>Total Ratings</p>
        </div>
        <div className="stat">
          <h2>{ratings.deliveryPerson.totalDeliveries}</h2>
          <p>Total Deliveries</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        {Object.entries(ratings.ratingDistribution)
          .reverse()
          .map(([stars, count]) => (
            <div key={stars} className="rating-bar">
              <span>{stars} ⭐</span>
              <div
                className="bar"
                style={{
                  width: `${
                    (count / ratings.deliveryPerson.totalRatings) * 100
                  }%`,
                }}
              >
                {count}
              </div>
            </div>
          ))}
      </div>

      {/* Recent Ratings */}
      <div className="recent-ratings">
        <h3>Recent Ratings</h3>
        {ratings.ratings.map((rating) => (
          <div key={rating.orderId} className="rating-card">
            <div className="rating-header">
              <span className="order-number">{rating.orderNumber}</span>
              <span className="stars">{"⭐".repeat(rating.rating)}</span>
            </div>
            {rating.feedback && <p className="feedback">"{rating.feedback}"</p>}
            <p className="date">
              {new Date(rating.ratedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### API Hook

```javascript
import { useState, useEffect } from "react";
import axios from "axios";

export const useDeliveryRatings = (deliveryPersonId, options = {}) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    page = 1,
    limit = 10,
    sortBy = "ratedAt",
    sortOrder = "desc",
  } = options;

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/orders/delivery-ratings/${deliveryPersonId}`,
          {
            params: { page, limit, sortBy, sortOrder },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRatings(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data || err);
        setRatings(null);
      } finally {
        setLoading(false);
      }
    };

    if (deliveryPersonId) {
      fetchRatings();
    }
  }, [deliveryPersonId, page, limit, sortBy, sortOrder]);

  return { ratings, loading, error };
};
```

## Testing

### Test Scenarios

1. **Admin Access - Success**

   ```bash
   # Login as admin
   POST /api/users/login
   # Get any delivery person's ratings
   GET /api/orders/delivery-ratings/{anyDeliveryPersonId}
   # Expected: 200 OK with ratings data
   ```

2. **Delivery Person Own Ratings - Success**

   ```bash
   # Login as delivery person
   POST /api/users/login
   # Get own ratings
   GET /api/orders/delivery-ratings/{ownId}
   # Expected: 200 OK with ratings data
   ```

3. **Delivery Person Other Ratings - Forbidden**

   ```bash
   # Login as delivery person
   POST /api/users/login
   # Try to get another delivery person's ratings
   GET /api/orders/delivery-ratings/{otherId}
   # Expected: 403 Forbidden
   ```

4. **Customer Access - Forbidden**

   ```bash
   # Login as customer
   POST /api/users/login
   # Try to get any delivery person's ratings
   GET /api/orders/delivery-ratings/{anyId}
   # Expected: 403 Forbidden
   ```

5. **Unauthenticated Access - Unauthorized**
   ```bash
   # No token
   GET /api/orders/delivery-ratings/{anyId}
   # Expected: 401 Unauthorized
   ```

## Security Considerations

### Authorization Checks

1. **Middleware Level**: `authorizeAdminOrDeliveryPerson` ensures only admins or delivery persons can access
2. **Controller Level**: Additional check ensures delivery persons can only access their own data
3. **Double Protection**: Two-layer authorization prevents unauthorized access

### Data Privacy

- Delivery persons cannot see other delivery persons' ratings
- Customer information is limited (only name and avatar, no contact details)
- Order details are limited to order number

### Token Validation

- All requests require valid JWT token
- Token must belong to active user account
- Token expiration is enforced

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden (Wrong Role)

```json
{
  "success": false,
  "message": "Access denied. Admin or delivery person privileges required."
}
```

### 403 Forbidden (Wrong Delivery Person)

```json
{
  "success": false,
  "message": "Access denied. You can only view your own ratings."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Delivery person not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "message": "User is not a delivery person"
}
```

## Backward Compatibility

- ✅ Existing admin functionality unchanged
- ✅ API endpoint URL unchanged
- ✅ Response format unchanged
- ✅ Query parameters unchanged
- ✅ No database migration required

## Benefits

### For Delivery Persons

- 📊 **Transparency**: See their performance metrics
- 📈 **Improvement**: Track progress over time
- 💪 **Motivation**: Positive feedback boosts morale
- 🎯 **Goals**: Set and achieve rating targets

### For Business

- 👥 **Engagement**: Delivery persons feel valued
- 📊 **Self-Management**: Delivery persons can self-monitor
- 🎓 **Learning**: Understand what makes good service
- 💼 **Retention**: Improved job satisfaction

## Future Enhancements

Potential improvements:

- [ ] Mobile app for delivery persons
- [ ] Push notifications for new ratings
- [ ] Rating trends and analytics
- [ ] Comparison with team average
- [ ] Achievement badges for milestones
- [ ] Export ratings report
- [ ] Response to customer feedback

## Support

For questions or issues:

- Check this documentation
- Review DELIVERY_RATING_DOCUMENTATION.md for general rating features
- Contact: dev@trendbite.com

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Feature Type**: Enhancement  
**Author**: TrendBite Development Team
