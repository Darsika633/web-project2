# Inventory Management System Documentation

## Overview

The TrendBite API now includes a comprehensive inventory management system that tracks stock movements, maintains inventory records, and integrates seamlessly with the order system. This system provides real-time stock tracking, low stock alerts, and detailed audit trails.

## Features

### ✅ Core Features Implemented

1. **Stock Tracking**
   - Track stock movements (in/out transactions)
   - Maintain stock history/audit trail
   - Real-time stock level monitoring

2. **Stock Management Operations**
   - Manual stock adjustments (add/remove stock)
   - Bulk import/export functionality
   - Stock transfers between variants
   - Automatic stock updates from orders

3. **Low Stock & Alerts**
   - Dashboard alerts/warnings for low stock
   - Variant-specific low stock thresholds
   - Out of stock notifications

4. **Inventory Reports**
   - Current stock levels
   - Stock movement history
   - Low stock reports
   - Stock valuation reports

5. **Order Integration**
   - Automatic stock deduction on order placement
   - Stock restoration on order cancellation
   - Real-time stock availability checking

## Database Models

### 1. StockMovement Model

Tracks all inventory transactions with detailed audit information.

**Key Fields:**
- `product`: Reference to Product
- `variant`: Variant ID
- `movementType`: Type of movement (in, out, adjustment, transfer, reservation, restoration)
- `quantity`: Movement quantity (positive for in, negative for out)
- `previousStock`: Stock level before movement
- `newStock`: Stock level after movement
- `reason`: Reason for movement
- `reference`: Reference to related order/adjustment
- `performedBy`: User who performed the action

### 2. Inventory Model

Maintains current inventory state for each product variant.

**Key Fields:**
- `product`: Reference to Product
- `variant`: Variant ID
- `currentStock`: Current stock quantity
- `reservedStock`: Stock reserved for orders
- `availableStock`: Available stock (current - reserved)
- `lowStockThreshold`: Threshold for low stock alerts
- `isLowStock`: Low stock flag
- `isOutOfStock`: Out of stock flag
- `totalValue`: Total inventory value

### 3. Updated Product Model

Enhanced with variant-specific low stock thresholds.

**New Features:**
- Variant-level `lowStockThreshold` support
- Updated virtual methods for stock status

## API Endpoints

### Inventory Management Endpoints

#### 1. Inventory Overview
```
GET /api/inventory/overview
```
Get comprehensive inventory overview with filtering options.

**Query Parameters:**
- `product`: Filter by product ID
- `category`: Filter by category
- `brand`: Filter by brand
- `lowStockOnly`: Show only low stock items
- `outOfStockOnly`: Show only out of stock items
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### 2. Low Stock Products
```
GET /api/inventory/low-stock
```
Get products with low stock levels.

**Query Parameters:**
- `threshold`: Custom low stock threshold
- `page`: Page number
- `limit`: Items per page

#### 3. Inventory Statistics
```
GET /api/inventory/statistics
```
Get overall inventory statistics and metrics.

#### 4. Stock Movements
```
GET /api/inventory/products/:productId/movements
GET /api/inventory/variants/:variantId/movements
```
Get stock movement history for products or variants.

**Query Parameters:**
- `movementType`: Filter by movement type
- `startDate`: Start date filter
- `endDate`: End date filter
- `page`: Page number
- `limit`: Items per page

#### 5. Stock Management
```
PUT /api/inventory/products/:productId/variants/:variantId/stock
```
Update stock levels manually.

**Request Body:**
```json
{
  "quantity": 10,
  "reason": "Stock adjustment",
  "notes": "Optional notes",
  "cost": 25.50
}
```

#### 6. Stock Transfer
```
POST /api/inventory/transfer/:fromVariantId/:toVariantId
```
Transfer stock between variants.

**Request Body:**
```json
{
  "quantity": 5,
  "reason": "Transfer between sizes",
  "notes": "Optional notes"
}
```

#### 7. Bulk Stock Update
```
POST /api/inventory/bulk-update
```
Update multiple stock levels at once.

**Request Body:**
```json
{
  "updates": [
    {
      "productId": "product_id",
      "variantId": "variant_id",
      "quantity": 10
    }
  ],
  "reason": "Bulk import",
  "notes": "Optional notes"
}
```

#### 8. Stock Reservation/Restoration
```
POST /api/inventory/products/:productId/variants/:variantId/reserve
POST /api/inventory/products/:productId/variants/:variantId/restore
```
Reserve or restore stock for orders.

### Admin Dashboard Endpoints

#### 1. Inventory Dashboard
```
GET /api/admin/dashboard/inventory
```
Get inventory dashboard overview with key metrics.

#### 2. Inventory Alerts
```
GET /api/admin/inventory/alerts
```
Get inventory alerts (low stock, out of stock, stale inventory).

#### 3. Inventory Reports
```
GET /api/admin/inventory/reports
```
Generate various inventory reports.

**Query Parameters:**
- `reportType`: Type of report (overview, movements, low-stock, valuation)
- `startDate`: Start date for report
- `endDate`: End date for report
- `category`: Filter by category
- `brand`: Filter by brand

## Order System Integration

### Automatic Stock Management

1. **Order Placement**
   - Stock is automatically deducted when order is created
   - Stock movement record is created
   - Inventory record is updated

2. **Order Cancellation**
   - Stock is automatically restored when order is cancelled
   - Restoration movement record is created
   - Inventory record is updated

3. **Admin Order Management**
   - Admin can cancel orders with automatic stock restoration
   - All stock changes are tracked and audited

## Stock Movement Types

1. **in**: Stock added (manual adjustment, import)
2. **out**: Stock removed (order placement, manual adjustment)
3. **adjustment**: Manual stock adjustment
4. **transfer**: Stock transfer between variants
5. **reservation**: Stock reserved for orders
6. **restoration**: Stock restored from cancelled orders

## Low Stock Management

### Thresholds
- Product-level default threshold: 10 units
- Variant-specific thresholds can be set
- Automatic low stock flagging
- Dashboard alerts for low stock items

### Alerts
- Low stock products highlighted in dashboard
- Out of stock products flagged
- Stale inventory detection (no movements in 30 days)

## Reports Available

1. **Overview Report**: Current stock levels across all products
2. **Movement Report**: Stock movement history with filters
3. **Low Stock Report**: Products below threshold
4. **Valuation Report**: Inventory value by category/brand

## Security & Access Control

- All inventory endpoints require admin authentication
- Stock movements are tracked with user information
- Audit trail maintained for all operations
- Input validation for all operations

## Usage Examples

### 1. Check Inventory Overview
```javascript
const response = await fetch('/api/inventory/overview?lowStockOnly=true', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

### 2. Update Stock Levels
```javascript
const response = await fetch('/api/inventory/products/PRODUCT_ID/variants/VARIANT_ID/stock', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    quantity: 50,
    reason: 'New stock received',
    notes: 'From supplier ABC'
  })
});
```

### 3. Transfer Stock Between Variants
```javascript
const response = await fetch('/api/inventory/transfer/FROM_VARIANT_ID/TO_VARIANT_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    quantity: 10,
    reason: 'Size adjustment',
    notes: 'Moving from M to L'
  })
});
```

### 4. Get Low Stock Alerts
```javascript
const response = await fetch('/api/admin/inventory/alerts', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

## Error Handling

The system includes comprehensive error handling:
- Validation errors for invalid inputs
- Stock availability checks
- Duplicate operation prevention
- Database transaction safety

## Performance Considerations

- Indexed database queries for fast lookups
- Pagination for large datasets
- Efficient aggregation pipelines
- Optimized stock movement tracking

## Future Enhancements

Potential future improvements:
- Email notifications for low stock
- Automated reorder points
- Supplier integration
- Barcode scanning support
- Multi-warehouse support
- Advanced analytics and forecasting

## Testing

All endpoints should be tested with:
- Valid admin authentication
- Various stock scenarios
- Edge cases (zero stock, negative adjustments)
- Bulk operations
- Order integration scenarios

## Maintenance

Regular maintenance tasks:
- Monitor inventory accuracy
- Review low stock thresholds
- Analyze stock movement patterns
- Clean up old movement records if needed
- Update inventory valuations

---

This inventory management system provides a robust foundation for tracking and managing product stock levels with full integration into the existing order system.
