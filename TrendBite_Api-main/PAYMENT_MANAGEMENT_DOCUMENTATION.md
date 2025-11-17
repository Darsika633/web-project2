# Payment Management System Documentation

## Overview

The Payment Management System provides comprehensive COD (Cash on Delivery) payment tracking and management for the TrendBite e-commerce platform. This system allows admins to monitor payment collections, delivery persons to collect payments during delivery, and provides detailed analytics and reporting.

## Features

### 🏪 Admin Features
- **Payment Dashboard**: Comprehensive overview of payment statistics and metrics
- **Payment Management**: View, filter, and manage all COD payments
- **Payment Collection**: Mark payments as received/collected manually
- **Payment Reports**: Generate detailed reports (daily/weekly/monthly)
- **Outstanding Payments**: Track and manage outstanding COD payments
- **Payment Analytics**: Collection rates, performance metrics, and trends

### 🚚 Delivery Person Features
- **Assigned Payments**: View payments assigned to them
- **Payment Collection**: Collect full or partial payments during delivery
- **Issue Reporting**: Report collection issues (customer not available, refused to pay, etc.)
- **Collection Notes**: Add notes about payment collection process

### 📊 Analytics & Reporting
- **Payment Statistics**: Total payments, collected amounts, outstanding amounts
- **Collection Performance**: Success rates, failure analysis
- **Delivery Person Performance**: Individual collection rates and metrics
- **Time-based Reports**: Daily, weekly, monthly payment summaries

## Database Schema

### Payment Model
```javascript
{
  order: ObjectId,           // Reference to Order
  customer: ObjectId,        // Reference to User (customer)
  deliveryPerson: ObjectId,  // Reference to User (delivery person)
  
  // Payment Details
  method: 'cash_on_delivery',
  status: 'pending' | 'paid_on_delivery' | 'completed' | 'failed' | 'partial',
  
  // Amount Details
  expectedAmount: Number,    // Total amount to be collected
  collectedAmount: Number,   // Amount actually collected
  balanceAmount: Number,     // Remaining balance
  
  // Collection Details
  collectionTimestamp: Date,
  collectionNotes: String,
  collectionStatus: 'not_collected' | 'collected' | 'partial_collected' | 'failed_collection',
  
  // Collection Issues
  collectionIssues: [String], // Array of issue types
  issueDescription: String,
  
  // Tracking
  deliveryAttempts: Number,
  lastAttemptDate: Date,
  
  // Admin Management
  isOutstanding: Boolean,
  adminNotes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model Updates
- Added `paymentRecord` field to reference Payment model for COD orders
- Maintains backward compatibility with existing payment structure

## API Endpoints

### Admin Endpoints

#### GET `/api/payments/admin/all`
Get all COD payments with filtering and pagination
- **Query Parameters**: `page`, `limit`, `status`, `collectionStatus`, `deliveryPersonId`, `isOutstanding`, `startDate`, `endDate`, `search`
- **Access**: Admin only
- **Response**: Paginated list of payments with order, customer, and delivery person details

#### GET `/api/payments/admin/statistics`
Get payment statistics for admin dashboard
- **Query Parameters**: `period` (day/week/month/year)
- **Access**: Admin only
- **Response**: Payment statistics, recent activities, collection rates

#### GET `/api/payments/admin/reports`
Generate payment reports
- **Query Parameters**: `startDate`, `endDate`, `deliveryPersonId`, `status`, `reportType` (summary/detailed/outstanding)
- **Access**: Admin only
- **Response**: Detailed payment reports based on criteria

#### GET `/api/payments/admin/:paymentId`
Get payment by ID with full details
- **Access**: Admin only
- **Response**: Complete payment information with populated references

#### PUT `/api/payments/admin/:paymentId/mark-received`
Mark payment as received/collected by admin
- **Body**: `{ amount, notes }`
- **Access**: Admin only
- **Response**: Updated payment information

#### PUT `/api/payments/admin/:paymentId/update`
Update payment details (admin notes, issues, etc.)
- **Body**: `{ adminNotes, collectionIssues, issueDescription }`
- **Access**: Admin only
- **Response**: Updated payment information

#### GET `/api/admin/dashboard/payments`
Get payment dashboard overview
- **Query Parameters**: `period` (day/week/month/year)
- **Access**: Admin only
- **Response**: Comprehensive payment dashboard data including statistics, outstanding payments, recent collections, and delivery person performance

### Delivery Person Endpoints

#### GET `/api/payments/delivery/my-payments`
Get payments assigned to the authenticated delivery person
- **Query Parameters**: `status`, `isOutstanding`
- **Access**: Delivery person only
- **Response**: List of assigned payments

#### POST `/api/payments/delivery/:paymentId/collect`
Collect payment during delivery
- **Body**: `{ amount, notes }`
- **Access**: Delivery person only
- **Response**: Updated payment information

#### POST `/api/payments/delivery/:paymentId/report-issue`
Report collection issue
- **Body**: `{ issues: [String], description }`
- **Access**: Delivery person only
- **Response**: Updated payment information

### General Endpoints

#### GET `/api/payments/outstanding`
Get outstanding payments
- **Access**: Admin or Delivery person
- **Response**: Outstanding payments (all for admin, assigned only for delivery person)

## Payment Flow

### 1. Order Creation
```
Customer places COD order
↓
Order created with payment.method = 'cash_on_delivery'
↓
Payment record created automatically
↓
Payment status = 'pending'
```

### 2. Delivery Assignment
```
Admin assigns delivery person to order
↓
Delivery person also assigned to payment record
↓
Payment remains in 'pending' status
```

### 3. Payment Collection
```
Delivery person attempts collection
↓
If successful: Payment collected (full/partial)
↓
Payment status updated to 'completed'/'partial'
↓
Collection timestamp and notes recorded
```

### 4. Issue Reporting
```
If collection fails: Issue reported
↓
Collection issues and description recorded
↓
Payment remains outstanding
↓
Admin can follow up or reassign
```

## Payment Status Flow

```
pending → paid_on_delivery → completed
   ↓           ↓              ↓
failed    partial_collected  (success)
   ↓           ↓
reported  balance_outstanding
```

## Collection Issues

The system tracks various collection issues:
- `customer_not_available`: Customer not present at delivery address
- `customer_refused`: Customer refused to pay
- `address_incorrect`: Delivery address is incorrect
- `insufficient_cash`: Customer doesn't have enough cash
- `other`: Other issues (specified in description)

## Admin Dashboard Integration

The payment system is fully integrated into the admin dashboard:

### Main Dashboard (`/api/admin/dashboard/overview`)
- Total COD payments count
- Total expected amount
- Total collected amount
- Outstanding payments count
- Outstanding amount
- Collection rate percentage

### Payment Dashboard (`/api/admin/dashboard/payments`)
- Period-based statistics (day/week/month/year)
- Outstanding payments list
- Recent payment collections
- Collection issues
- Delivery person performance metrics

## Validation Rules

### Payment Collection
- Amount must be numeric and greater than 0
- Amount cannot have more than 2 decimal places
- Notes are optional but limited to 500 characters

### Issue Reporting
- At least one issue type must be specified
- Valid issue types are predefined
- Description is optional but limited to 1000 characters

### Date Ranges
- Start date must be valid ISO 8601 format
- End date must be after start date
- All dates are automatically converted to Date objects

## Security & Authorization

### Authentication
- All endpoints require JWT authentication
- Token must be valid and not expired

### Authorization
- Admin endpoints: `authorizeAdmin` middleware
- Delivery person endpoints: `authorizeDeliveryPerson` middleware
- Mixed access: Role-based authorization checks

### Data Validation
- Comprehensive input validation using express-validator
- Sanitization of user inputs
- Business rule enforcement (amount limits, status transitions)

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [ // For validation errors
    {
      "field": "fieldName",
      "message": "Validation message",
      "value": "invalidValue"
    }
  ]
}
```

### Common Error Scenarios
- Payment not found (404)
- Unauthorized access (403)
- Validation failures (400)
- Server errors (500)

## Usage Examples

### Admin: Get Payment Statistics
```javascript
GET /api/payments/admin/statistics?period=month
```

### Admin: Generate Payment Report
```javascript
GET /api/payments/admin/reports?startDate=2024-01-01&endDate=2024-01-31&reportType=detailed
```

### Delivery Person: Collect Payment
```javascript
POST /api/payments/delivery/64f1a2b3c4d5e6f7g8h9i0j1/collect
{
  "amount": 2500.00,
  "notes": "Customer paid exact amount"
}
```

### Delivery Person: Report Issue
```javascript
POST /api/payments/delivery/64f1a2b3c4d5e6f7g8h9i0j1/report-issue
{
  "issues": ["customer_not_available"],
  "description": "Customer not home, left delivery note"
}
```

## Integration Points

### Order Management
- Automatic payment record creation for COD orders
- Payment record linking via `paymentRecord` field
- Delivery person assignment synchronization

### Delivery Management
- Delivery person assignment updates payment records
- Order status changes reflect in payment tracking
- Delivery completion triggers payment status updates

### Admin Dashboard
- Payment metrics integrated into main dashboard
- Dedicated payment dashboard for detailed management
- Real-time statistics and analytics

## Future Enhancements

### Potential Features
- SMS notifications for outstanding payments
- Payment collection scheduling
- Customer payment reminders
- Advanced analytics and forecasting
- Integration with external payment gateways
- Mobile app for delivery persons

### Performance Optimizations
- Database indexing for large payment datasets
- Caching for frequently accessed statistics
- Background job processing for reports
- Real-time updates using WebSockets

## Troubleshooting

### Common Issues
1. **Payment not created for COD order**: Check if order creation process includes payment record creation
2. **Delivery person not assigned to payment**: Verify delivery assignment process updates payment records
3. **Permission denied errors**: Ensure proper authentication and authorization middleware
4. **Validation errors**: Check request body format and validation rules

### Debug Mode
Enable debug logging by setting environment variable:
```
DEBUG_PAYMENTS=true
```

This will log detailed payment operations and database queries.

## Support

For technical support or questions about the payment management system:
1. Check the API documentation for endpoint details
2. Review validation rules and error messages
3. Verify database schema and relationships
4. Test with sample data to isolate issues

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: TrendBite Development Team

