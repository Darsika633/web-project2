# 📦 Shipping Options Documentation

## Overview

TrendBite offers flexible shipping options to meet different customer needs. Customers can choose between Standard and Express delivery when placing orders, with costs and delivery times varying accordingly.

---

## 🚚 Available Shipping Methods

### 1. Standard Delivery (Default)

**Delivery Time:** 3 working days  
**Cost:** 400 LKR  
**Best For:** Regular orders with flexible delivery timelines

**Features:**
- Most economical option
- Reliable delivery within 3 working days
- Tracked shipment
- Suitable for most customers

**Example:**
Order placed on Monday → Expected delivery by Thursday

---

### 2. Express Delivery

**Delivery Time:** Within 1 day  
**Cost:** 1000 LKR  
**Best For:** Urgent orders requiring fast delivery

**Features:**
- Priority handling
- Same-day or next-day delivery
- Tracked shipment
- Ideal for urgent purchases

**Example:**
Order placed today → Expected delivery tomorrow

---

## 💡 How It Works

### Order Creation

When creating an order, customers can specify the `shippingMethod` in the request:

**Request Example:**
```json
{
  "items": [...],
  "deliveryAddress": {...},
  "billingAddress": {...},
  "paymentMethod": "cash_on_delivery",
  "shippingMethod": "express",
  "discountCode": "SAVE10"
}
```

**If Not Specified:**
- Default shipping method is **`standard`**
- Delivery cost will be **400 LKR**
- Estimated delivery: **3 working days**

---

## 📊 Cost Calculation

### Automatic Delivery Cost

The system automatically calculates the delivery cost based on the selected shipping method:

```javascript
// Standard Delivery
shippingMethod: "standard"
deliveryCost: 400 LKR
estimatedDeliveryDate: current_date + 3 working days

// Express Delivery
shippingMethod: "express"
deliveryCost: 1000 LKR
estimatedDeliveryDate: current_date + 1 day
```

### Total Order Amount Calculation

```
Total Amount = Subtotal + Delivery Cost - Discount Amount

Example (Standard):
Subtotal: 2000 LKR
Delivery: 400 LKR
Discount: 200 LKR
Total: 2200 LKR

Example (Express):
Subtotal: 2000 LKR
Delivery: 1000 LKR
Discount: 200 LKR
Total: 2800 LKR
```

---

## 🔧 Technical Implementation

### Order Model

The Order model stores shipping information:

```javascript
shipping: {
  method: {
    type: String,
    enum: ['standard', 'express'],
    default: 'standard'
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryPersonEstimatedTime: Date,
  deliveryNotes: String
}
```

### Static Methods

**Get Delivery Cost:**
```javascript
Order.getDeliveryCost('standard')  // Returns: 400
Order.getDeliveryCost('express')   // Returns: 1000
```

**Get Delivery Days:**
```javascript
Order.getDeliveryDays('standard')  // Returns: 3
Order.getDeliveryDays('express')   // Returns: 1
```

### Automatic Calculations

When an order is created:
1. System validates the shipping method
2. Calculates delivery cost based on method
3. Calculates estimated delivery date
4. Adds to order total

---

## 📱 API Usage

### Create Order with Standard Delivery

**Endpoint:** `POST /api/orders`

**Request:**
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
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Colombo",
    "state": "Western Province",
    "zipCode": "00100",
    "country": "Sri Lanka",
    "phone": "+94771234567"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "Colombo",
    "state": "Western Province",
    "zipCode": "00100",
    "country": "Sri Lanka"
  },
  "paymentMethod": "cash_on_delivery",
  "shippingMethod": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order123",
    "orderNumber": "TB000001",
    "subtotal": 2000,
    "deliveryCost": 400,
    "totalAmount": 2400,
    "shipping": {
      "method": "standard",
      "estimatedDeliveryDate": "2025-10-13T10:00:00.000Z"
    },
    "status": "pending"
  }
}
```

---

### Create Order with Express Delivery

**Request:**
```json
{
  "items": [...],
  "deliveryAddress": {...},
  "billingAddress": {...},
  "paymentMethod": "cash_on_delivery",
  "shippingMethod": "express"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order124",
    "orderNumber": "TB000002",
    "subtotal": 2000,
    "deliveryCost": 1000,
    "totalAmount": 3000,
    "shipping": {
      "method": "express",
      "estimatedDeliveryDate": "2025-10-11T10:00:00.000Z"
    },
    "status": "pending"
  }
}
```

---

## ✅ Validation Rules

### Shipping Method Validation

**Valid Values:**
- `"standard"` ✓
- `"express"` ✓
- `null` or `undefined` (defaults to `"standard"`) ✓

**Invalid Values:**
- `"overnight"` ✗
- `"same-day"` ✗
- Any other string ✗

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Invalid shipping method. Choose \"standard\" (3 working days, 400 LKR) or \"express\" (within 1 day, 1000 LKR)",
      "param": "shippingMethod"
    }
  ]
}
```

---

## 📋 Comparison Table

| Feature | Standard | Express |
|---------|----------|---------|
| **Delivery Time** | 3 working days | Within 1 day |
| **Cost** | 400 LKR | 1000 LKR |
| **Tracking** | ✅ Yes | ✅ Yes |
| **Estimated Date** | Auto-calculated | Auto-calculated |
| **Best For** | Regular orders | Urgent orders |
| **Cost Difference** | Base price | +600 LKR |

---

## 🎯 Customer Journey

### Standard Delivery Flow

1. **Customer selects products** → Adds to cart
2. **Proceeds to checkout** → Reviews order
3. **Selects "Standard Delivery"** → Sees 400 LKR cost
4. **Confirms order** → Order created
5. **System calculates** → Estimated delivery in 3 days
6. **Order assigned** → Delivery person assigned by admin
7. **Delivery** → Received within 3 working days

### Express Delivery Flow

1. **Customer selects products** → Adds to cart
2. **Proceeds to checkout** → Reviews order
3. **Selects "Express Delivery"** → Sees 1000 LKR cost
4. **Confirms order** → Order created
5. **System calculates** → Estimated delivery next day
6. **Priority handling** → Order processed immediately
7. **Fast delivery** → Received within 1 day

---

## 🔍 Business Logic

### Estimated Delivery Date Calculation

**Standard Delivery:**
```javascript
const deliveryDays = 3;
const estimatedDate = new Date();
estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
// Example: Oct 10 + 3 days = Oct 13
```

**Express Delivery:**
```javascript
const deliveryDays = 1;
const estimatedDate = new Date();
estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
// Example: Oct 10 + 1 day = Oct 11
```

### Delivery Cost Assignment

The system automatically assigns the correct delivery cost:

```javascript
const deliveryCosts = {
  'standard': 400,  // 3 working days
  'express': 1000   // within 1 day
};

const deliveryCost = deliveryCosts[shippingMethod] || 400;
```

---

## 📝 Order Response Fields

### Shipping Object

```json
{
  "shipping": {
    "method": "standard",
    "estimatedDeliveryDate": "2025-10-13T10:00:00.000Z",
    "actualDeliveryDate": null,
    "trackingNumber": null,
    "deliveryPartner": null,
    "deliveryPersonEstimatedTime": null,
    "deliveryNotes": null
  }
}
```

**Field Descriptions:**
- `method`: Selected shipping method (`standard` or `express`)
- `estimatedDeliveryDate`: Auto-calculated based on shipping method
- `actualDeliveryDate`: Set when order is delivered
- `trackingNumber`: Optional tracking number
- `deliveryPartner`: Delivery partner name (if applicable)
- `deliveryPersonEstimatedTime`: Delivery person's estimated time
- `deliveryNotes`: Any delivery-specific notes

---

## 🎨 Frontend Implementation Suggestions

### Checkout Page UI

```javascript
// Shipping options for customer selection
const shippingOptions = [
  {
    value: 'standard',
    label: 'Standard Delivery',
    description: '3 working days',
    cost: 400,
    currency: 'LKR',
    icon: '📦'
  },
  {
    value: 'express',
    label: 'Express Delivery',
    description: 'Within 1 day',
    cost: 1000,
    currency: 'LKR',
    icon: '⚡',
    badge: 'FAST'
  }
];
```

### Order Summary Display

```javascript
// Display delivery cost breakdown
Subtotal: LKR 2,000
Delivery (Express): LKR 1,000
Discount: - LKR 200
─────────────────────
Total: LKR 2,800
```

---

## 🔒 Security & Validation

### Backend Validation

✅ Shipping method is validated on order creation  
✅ Invalid methods are rejected with clear error messages  
✅ Default to `standard` if not specified  
✅ Delivery cost is calculated server-side (cannot be manipulated)  
✅ Estimated delivery date is auto-calculated  

### Data Integrity

✅ Delivery cost is stored in the order  
✅ Shipping method is immutable once order is created  
✅ Estimated date can be updated by admin if needed  
✅ Actual delivery date tracked separately  

---

## 📈 Analytics & Reporting

### Metrics to Track

Admins can analyze shipping preferences:

1. **Shipping Method Distribution**
   - % of orders using standard vs express
   - Revenue from express deliveries
   - Cost analysis

2. **Delivery Performance**
   - Average delivery time by method
   - On-time delivery rate
   - Customer satisfaction by shipping method

3. **Revenue Impact**
   - Additional revenue from express shipping
   - Express delivery adoption rate
   - Seasonal trends

---

## ⚠️ Important Notes

1. **Delivery Cost Cannot Be Changed Post-Order**
   - Once order is created, delivery cost is fixed
   - Shipping method cannot be changed by customer
   - Admin can update if necessary

2. **Working Days Calculation**
   - Standard delivery: 3 **working days** (excludes weekends/holidays)
   - Express delivery: **1 day** (may include weekends for express)

3. **Estimated vs Actual Delivery**
   - `estimatedDeliveryDate`: System-calculated estimate
   - `actualDeliveryDate`: Set when delivery person marks as delivered
   - Actual date may vary based on factors like location, weather, etc.

4. **Delivery Cost in Cart**
   - Cart should display delivery cost based on selected shipping method
   - Total should update dynamically when shipping method changes
   - Final cost locked at order creation

---

## 🧪 Testing Scenarios

### Test Cases

1. **Standard Delivery Order**
   - Create order with `shippingMethod: "standard"`
   - Verify `deliveryCost` is 400
   - Verify `estimatedDeliveryDate` is +3 days

2. **Express Delivery Order**
   - Create order with `shippingMethod: "express"`
   - Verify `deliveryCost` is 1000
   - Verify `estimatedDeliveryDate` is +1 day

3. **Default Shipping Method**
   - Create order without `shippingMethod`
   - Verify defaults to "standard"
   - Verify `deliveryCost` is 400

4. **Invalid Shipping Method**
   - Attempt order with `shippingMethod: "overnight"`
   - Verify error response
   - Ensure order is not created

5. **Total Calculation**
   - Verify total includes correct delivery cost
   - Test with discount codes
   - Ensure calculations are accurate

---

## 🚀 Implementation Checklist

- [x] Update Order model with shipping method enum
- [x] Add delivery cost calculation methods
- [x] Update order creation controller
- [x] Add shipping method validation
- [x] Update API documentation
- [x] Update Swagger/OpenAPI spec
- [x] Auto-calculate estimated delivery date
- [x] Document shipping options
- [ ] Update frontend checkout UI (if applicable)
- [ ] Add shipping method to order confirmation emails
- [ ] Display delivery options in cart/checkout

---

## 📞 Customer Support

**Common Questions:**

**Q: Can I change shipping method after placing order?**  
A: No, shipping method is locked once the order is created. Please contact support if you need urgent delivery.

**Q: Are delivery times guaranteed?**  
A: Delivery times are estimates. Actual delivery may vary based on location, weather, and other factors.

**Q: What if express delivery takes longer than 1 day?**  
A: Contact customer support for assistance. In exceptional cases, we may provide compensation.

**Q: Do you deliver on weekends?**  
A: Express delivery may include weekends. Standard delivery is calculated on working days only.

---

## 📊 Admin Features

### Shipping Analytics Dashboard

Admins can track:
- Total orders by shipping method
- Revenue from each shipping type
- Express delivery adoption rate
- Average delivery time by method
- On-time delivery performance

### Shipping Method Management

Admins can:
- View all orders by shipping method
- Filter orders by delivery type
- Update estimated delivery dates
- Track delivery performance metrics

---

## 🔄 Future Enhancements (Optional)

1. **Dynamic Pricing**
   - Location-based delivery costs
   - Weight-based pricing
   - Volume discounts

2. **Additional Methods**
   - Same-day delivery (premium)
   - Scheduled delivery (choose specific date/time)
   - Store pickup option

3. **Delivery Zones**
   - Different costs for different regions
   - Urban vs rural pricing
   - International shipping

4. **Tracking Integration**
   - Real-time GPS tracking
   - SMS notifications
   - Delivery status updates

5. **Smart Routing**
   - AI-based delivery optimization
   - Route planning for delivery persons
   - ETA predictions

---

*Last Updated: October 10, 2025*
*Version: 1.0.0*

