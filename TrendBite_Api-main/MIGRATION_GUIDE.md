# 🔄 Database Migration Guide

## Overview

This guide explains how to run the database migration script to update existing orders in the database to use the new order status values.

---

## 📋 What Changed

### Old Status Values (Removed)
- ❌ `processing`
- ❌ `hand_over_to_delivery_partner`
- ❌ `overnight` (shipping method)

### New Status Values (Added)
- ✅ `shipped` - Order has been shipped and is in transit
- ✅ `assigned` - Order assigned to delivery person
- ✅ `out_for_delivery` - Delivery person is en route

### Current Valid Statuses
1. `pending` - Order created, awaiting confirmation
2. `confirmed` - Order confirmed, ready for processing
3. `shipped` - Order shipped and in transit
4. `assigned` - Order assigned to delivery person
5. `out_for_delivery` - Out for delivery
6. `delivered` - Successfully delivered
7. `completed` - Order completed and closed
8. `cancelled` - Order cancelled

---

## 🗺️ Status Mapping

The migration script will automatically map old statuses to new ones:

| Old Status | New Status | Reason |
|------------|------------|--------|
| `processing` | `shipped` | Order is being processed/shipped |
| `hand_over_to_delivery_partner` | `assigned` | Order handed to delivery person |

---

## 🚀 Running the Migration

### Prerequisites

1. **Backup your database** before running migration:
   ```bash
   # For MongoDB
   mongodump --uri="mongodb://localhost:27017/trendbite" --out=./backup
   ```

2. **Ensure you have the latest code:**
   ```bash
   git pull origin main
   npm install
   ```

3. **Set up environment variables:**
   - Make sure `.env` file has `MONGODB_URI` configured
   - Or the script will use default: `mongodb://localhost:27017/trendbite`

### Run Migration Script

**Option 1: Using Node directly**
```bash
node src/utils/migrateOrderStatus.js
```

**Option 2: Using npm script (if configured)**
```bash
npm run migrate:order-status
```

### Script Output

The script will:
1. ✅ Connect to MongoDB
2. ✅ Find all orders with old statuses
3. ✅ Display orders to be updated
4. ✅ Show migration summary
5. ✅ Wait 3 seconds (gives you time to cancel if needed)
6. ✅ Update all orders in bulk
7. ✅ Verify migration success
8. ✅ Display final status distribution

**Example Output:**
```
╔══════════════════════════════════════════════════════════╗
║       TrendBite Order Status Migration Script          ║
╚══════════════════════════════════════════════════════════╝

🚀 Starting Order Status Migration...

📡 Connecting to MongoDB: mongodb://***:***@...
✅ Connected to MongoDB

🔍 Searching for orders with old statuses: processing, hand_over_to_delivery_partner

📊 Found 15 orders to update

📋 Orders to be updated:
────────────────────────────────────────────────────────────────────────────────
Order Number        Current Status                New Status
────────────────────────────────────────────────────────────────────────────────
TB000123           processing                    shipped
TB000124           processing                    shipped
TB000125           hand_over_to_delivery_partner assigned
────────────────────────────────────────────────────────────────────────────────

📊 Migration Summary:
   processing → shipped: 12 orders
   hand_over_to_delivery_partner → assigned: 3 orders

⚠️  Starting update in 3 seconds... (Press Ctrl+C to cancel)

🔄 Updating orders...
   ✅ Updated 12 orders: processing → shipped
   ✅ Updated 3 orders: hand_over_to_delivery_partner → assigned

✅ Successfully updated 15 orders!

🔍 Verifying migration...
✅ Verification passed! No orders with old statuses remain.

📊 Current Order Status Distribution:
────────────────────────────────────────────────────────────
Status                        Count
────────────────────────────────────────────────────────────
pending                       25
confirmed                     18
shipped                       12
assigned                      8
out_for_delivery              5
delivered                     30
completed                     45
────────────────────────────────────────────────────────────

✅ Database connection closed

🎉 Migration completed successfully!

📝 Migration Results:
{
  "processing": {
    "newStatus": "shipped",
    "count": 12
  },
  "hand_over_to_delivery_partner": {
    "newStatus": "assigned",
    "count": 3
  }
}

✨ All done! You can now safely use the updated order statuses.
```

---

## ⚠️ Important Notes

### Before Migration

1. **Backup your database** - Always backup before running migrations
2. **Review the changes** - Understand what will be updated
3. **Run in development first** - Test on development database first
4. **Check active orders** - Ensure no critical orders are in process

### During Migration

1. **Monitor the output** - Watch for any errors
2. **Cancel if needed** - You have 3 seconds to cancel (Ctrl+C)
3. **Don't interrupt** - Let the script complete once started

### After Migration

1. **Verify results** - Check the status distribution
2. **Test API** - Make sure all endpoints work correctly
3. **Monitor errors** - Watch for any issues in production
4. **Update frontend** - Ensure UI handles new statuses

---

## 🔍 Verification Queries

### Check for Old Statuses

```javascript
// In MongoDB shell
db.orders.find({ 
  status: { $in: ['processing', 'hand_over_to_delivery_partner', 'overnight'] } 
}).count()

// Should return 0 after migration
```

### View Status Distribution

```javascript
db.orders.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
])
```

### Check Recent Updates

```javascript
db.orders.find({
  'statusHistory.notes': /system migration/
}).limit(10)
```

---

## 🛠️ Troubleshooting

### Issue: Connection Error

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- Verify credentials

### Issue: No Orders Found

**Message:** `Found 0 orders to update`

**Meaning:** All orders already use current status values - migration not needed

### Issue: Some Orders Not Updated

**Check:**
- Review script output for errors
- Check database connection during migration
- Verify MongoDB version compatibility

### Issue: Script Hangs

**Solution:**
- Check database connectivity
- Ensure MongoDB is accessible
- Check for firewall/network issues

---

## 🔄 Rollback Plan

If you need to rollback the migration:

### Manual Rollback Script

Create a rollback script or run in MongoDB shell:

```javascript
// Rollback: shipped → processing
db.orders.updateMany(
  { 
    status: 'shipped',
    'statusHistory.notes': /system migration/
  },
  { 
    $set: { status: 'processing' }
  }
);

// Rollback: assigned → hand_over_to_delivery_partner
db.orders.updateMany(
  { 
    status: 'assigned',
    'statusHistory.notes': /system migration/
  },
  { 
    $set: { status: 'hand_over_to_delivery_partner' }
  }
);
```

### Restore from Backup

```bash
mongorestore --uri="mongodb://localhost:27017/trendbite" --drop ./backup
```

---

## 📊 Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Review code changes
- [ ] Test in development environment
- [ ] Notify team about maintenance window
- [ ] Check for active critical orders

### Migration
- [ ] Run migration script
- [ ] Monitor output for errors
- [ ] Verify success message
- [ ] Check status distribution

### Post-Migration
- [ ] Test order creation
- [ ] Test status updates
- [ ] Test order queries/filters
- [ ] Monitor API logs
- [ ] Verify frontend compatibility
- [ ] Check admin dashboard
- [ ] Test delivery person flow

---

## 📝 Adding to package.json

Add this script to your `package.json`:

```json
{
  "scripts": {
    "migrate:order-status": "node src/utils/migrateOrderStatus.js"
  }
}
```

Then run:
```bash
npm run migrate:order-status
```

---

## 🔒 Safety Features

The migration script includes:

✅ **Dry-run preview** - Shows what will be updated before making changes  
✅ **3-second delay** - Time to cancel if needed  
✅ **Bulk operations** - Efficient database updates  
✅ **Verification** - Checks migration success  
✅ **Status history** - Adds migration note to order history  
✅ **Error handling** - Proper error messages and cleanup  
✅ **Connection management** - Properly closes connections  

---

## 📞 Support

If you encounter issues during migration:

1. **Stop the migration** - Press Ctrl+C if it's still in the 3-second delay
2. **Check logs** - Review the error messages
3. **Restore backup** - If needed, restore from backup
4. **Contact support** - Reach out to technical team

---

## 📈 Expected Results

### Before Migration
```
Status Distribution:
- pending: 25
- confirmed: 18
- processing: 12        ← Old status
- hand_over_to_delivery_partner: 3  ← Old status
- delivered: 30
- completed: 45
```

### After Migration
```
Status Distribution:
- pending: 25
- confirmed: 18
- shipped: 12          ← Migrated from 'processing'
- assigned: 3          ← Migrated from 'hand_over_to_delivery_partner'
- out_for_delivery: 0
- delivered: 30
- completed: 45
```

---

*Last Updated: October 10, 2025*
*Version: 1.0.0*

