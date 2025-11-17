# 📧 Email Configuration Guide

## Overview

TrendBite automatically sends beautiful, professional emails for order confirmations and status updates. This guide explains how to configure email services for your application.

---

## ✨ Features

### Automatic Emails

1. **Order Confirmation Email** 🎉
   - Sent immediately after successful order placement
   - Includes complete order invoice
   - Beautiful HTML template with product images
   - Order details, pricing breakdown, delivery info

2. **Order Status Update Emails** 📦
   - Sent when order status changes to: `confirmed`, `shipped`, `out_for_delivery`, `delivered`
   - Clean, responsive design
   - Direct link to track order

3. **Delivery Rating Reminder** ⭐
   - Can be sent after delivery completion
   - Encourages customer feedback

---

## 🔧 Supported Email Providers

### 1. Gmail (Recommended for Development)

**Pros:**
- Easy to set up
- Free for low volume
- Reliable delivery

**Cons:**
- Daily sending limits (500-2000 emails/day)
- Requires App Password for security
- Not ideal for production at scale

**Configuration:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=TrendBite
```

**Setup Steps:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an App Password for "Mail"
4. Use this 16-character password in `EMAIL_PASS`

---

### 2. SendGrid (Recommended for Production)

**Pros:**
- High deliverability
- 100 free emails/day
- Detailed analytics
- Professional service

**Cons:**
- Requires account setup
- Paid plans for higher volume

**Configuration:**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=TrendBite
```

**Setup Steps:**
1. Sign up at https://sendgrid.com
2. Verify your sender email/domain
3. Create API key with "Mail Send" permissions
4. Add API key to environment variables

---

### 3. Mailgun

**Pros:**
- Developer-friendly
- Good free tier
- Excellent documentation

**Cons:**
- Domain verification required
- Credit card needed (even for free tier)

**Configuration:**
```env
EMAIL_SERVICE=mailgun
MAILGUN_SMTP_HOST=smtp.mailgun.org
MAILGUN_SMTP_PORT=587
MAILGUN_SMTP_USER=postmaster@your-domain.mailgun.org
MAILGUN_SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=TrendBite
```

**Setup Steps:**
1. Sign up at https://www.mailgun.com
2. Add and verify your domain
3. Get SMTP credentials from dashboard
4. Add credentials to environment variables

---

### 4. Generic SMTP (Any Provider)

**Use for:** Any SMTP service (Office 365, Zoho, custom server)

**Configuration:**
```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=TrendBite
```

---

## 📋 Environment Variables

### Required Variables (Choose One Set)

#### For Gmail:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=TrendBite
```

#### For SendGrid:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=TrendBite
```

#### For Generic SMTP:
```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=TrendBite
```

### Optional Variables:
```env
FRONTEND_URL=https://trendbite.com
```

---

## 🚀 Quick Setup

### Step 1: Choose Email Provider

Pick one based on your needs:
- **Development:** Gmail
- **Production (Small):** SendGrid Free Tier
- **Production (Large):** SendGrid/Mailgun Paid
- **Custom:** Your own SMTP server

### Step 2: Add Environment Variables

Create or update your `.env` file:

```bash
# Example with Gmail (for development)
EMAIL_SERVICE=gmail
EMAIL_USER=trendbite.orders@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=trendbite.orders@gmail.com
EMAIL_FROM_NAME=TrendBite - Online Store
FRONTEND_URL=http://localhost:3000
```

### Step 3: Test Email Configuration

Add this to your server startup or create a test script:

```javascript
import { verifyEmailConfig } from './src/config/email.js';

// On server start
verifyEmailConfig().then(isValid => {
  if (isValid) {
    console.log('✅ Email service configured correctly');
  } else {
    console.warn('⚠️  Email service not configured');
  }
});
```

### Step 4: Restart Your Server

```bash
npm run dev
```

### Step 5: Test with Order Creation

Create a test order and check if email is sent:

```bash
POST /api/orders
{
  "items": [...],
  "deliveryAddress": {...},
  "billingAddress": {...},
  "paymentMethod": "cash_on_delivery"
}
```

Check console for:
```
✅ Email sent successfully: <message-id>
✅ Order confirmation email sent to customer@email.com for order TB000123
```

---

## 🎨 Email Templates

### Order Confirmation Email

**Features:**
- ✅ Beautiful gradient header
- ✅ Order number and date prominently displayed
- ✅ Itemized product list with images
- ✅ Detailed pricing breakdown
- ✅ Delivery and payment information
- ✅ Track order button
- ✅ Help and contact information
- ✅ Responsive design (mobile-friendly)

**Preview:**
```
╔════════════════════════════════════════════╗
║        🎉 Order Confirmed!                ║
║   Thank you for your purchase, John!      ║
╚════════════════════════════════════════════╝

✅ Your order has been successfully placed

Order Number: TB000123
Order Date: October 10, 2025

📋 Order Invoice
────────────────────────────────────────────
Product               Qty    Price    Total
────────────────────────────────────────────
T-Shirt (M, Red)       2   1,000   2,000
────────────────────────────────────────────

Subtotal:                      LKR 2,000.00
Delivery (Standard):           LKR   400.00
Discount (SAVE10):           - LKR   200.00
──────────────────────────────────────────
Total Amount:                  LKR 2,200.00

📍 Delivery Address     💳 Payment & Shipping
John Doe                Payment: CASH ON DELIVERY
123 Main Street         Shipping: Standard (3 days)
Colombo, Western        Est. Delivery: Oct 13, 2025

        [📦 Track Your Order]
```

### Order Status Update Email

**Sent for:**
- ✅ Order Confirmed
- ✅ Order Shipped
- ✅ Out for Delivery
- ✅ Order Delivered

**Features:**
- Status-specific colors and icons
- Clear, concise messaging
- Direct link to order details

---

## 🔍 Testing

### Test Email Sending

Create a test endpoint (optional):

```javascript
// src/routes/testRoutes.js
import express from 'express';
import { sendEmail } from '../config/email.js';

const router = express.Router();

router.post('/test-email', async (req, res) => {
  const { to } = req.body;
  
  const result = await sendEmail({
    to: to || 'test@example.com',
    subject: 'Test Email from TrendBite',
    html: '<h1>Hello!</h1><p>This is a test email.</p>'
  });

  res.json(result);
});

export default router;
```

### Check Email Delivery

1. **Check Console Logs:**
   ```
   ✅ Email sent successfully: <message-id>
   ```

2. **Check Spam Folder:**
   - Emails might land in spam initially
   - Add proper SPF/DKIM records for production

3. **Check Provider Dashboard:**
   - SendGrid: Check activity dashboard
   - Mailgun: Check logs
   - Gmail: Check sent folder

---

## ⚠️ Troubleshooting

### Email Not Sending

**Issue:** No email received, no error in console

**Check:**
```bash
# 1. Verify environment variables are loaded
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);

# 2. Check if email service initialized
import { transporter } from './src/config/email.js';
console.log('Transporter:', transporter ? 'Configured' : 'Not configured');

# 3. Run verification
import { verifyEmailConfig } from './src/config/email.js';
await verifyEmailConfig();
```

### Gmail Authentication Failed

**Error:** `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solution:**
1. Enable 2-Factor Authentication
2. Generate App Password (not your regular password)
3. Use App Password in `EMAIL_PASS`

### SendGrid Authentication Failed

**Error:** `Unauthorized`

**Solution:**
1. Verify API key is correct
2. Check API key has "Mail Send" permission
3. Verify sender email in SendGrid dashboard

### Emails Going to Spam

**Solutions:**
1. **Verify domain:** Add SPF, DKIM, DMARC records
2. **Use professional email:** `noreply@yourdomain.com` instead of Gmail
3. **Warm up:** Start with low volume, gradually increase
4. **Content:** Avoid spam trigger words
5. **Authentication:** Properly configure SMTP auth

---

## 🔒 Security Best Practices

### 1. Environment Variables

✅ **DO:**
- Store credentials in `.env` file
- Add `.env` to `.gitignore`
- Use different credentials for dev/prod
- Rotate passwords regularly

❌ **DON'T:**
- Commit credentials to Git
- Share credentials in code
- Use same password everywhere
- Hardcode email credentials

### 2. Gmail App Passwords

✅ Create unique App Password for this app  
✅ Revoke if compromised  
✅ Use 2FA on Gmail account  

### 3. API Keys

✅ Restrict API key permissions  
✅ Monitor usage in provider dashboard  
✅ Set up alerts for unusual activity  

---

## 📊 Email Tracking & Analytics

### SendGrid Analytics

Track:
- Delivery rate
- Open rate
- Click rate
- Bounce rate
- Spam reports

### Custom Tracking

Add tracking parameters to links:

```javascript
const trackingUrl = `${FRONTEND_URL}/orders/${orderId}?utm_source=email&utm_campaign=order_confirmation`;
```

---

## 🎯 Production Recommendations

### For Production Use:

1. **Use Professional Email Service**
   - SendGrid, Mailgun, or AWS SES
   - Not Gmail (has sending limits)

2. **Verify Your Domain**
   - Add SPF record
   - Add DKIM signature
   - Add DMARC policy

3. **Monitor Email Delivery**
   - Track bounce rates
   - Monitor spam reports
   - Check delivery rates

4. **Handle Bounces**
   - Log failed deliveries
   - Retry failed sends
   - Clean email list regularly

5. **Rate Limiting**
   - Respect provider limits
   - Queue emails if needed
   - Implement retry logic

---

## 📝 Example .env File

```env
# ==============================================
# EMAIL CONFIGURATION
# ==============================================

# Choose ONE of the following configurations

# Option 1: Gmail (Development)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-16-char-app-password
# EMAIL_FROM=your-email@gmail.com
# EMAIL_FROM_NAME=TrendBite

# Option 2: SendGrid (Production Recommended)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@trendbite.com
EMAIL_FROM_NAME=TrendBite - Your Fashion Destination

# Option 3: Mailgun
# EMAIL_SERVICE=mailgun
# MAILGUN_SMTP_HOST=smtp.mailgun.org
# MAILGUN_SMTP_PORT=587
# MAILGUN_SMTP_USER=postmaster@mg.yourdomain.com
# MAILGUN_SMTP_PASS=your-smtp-password
# EMAIL_FROM=noreply@yourdomain.com
# EMAIL_FROM_NAME=TrendBite

# Option 4: Generic SMTP
# SMTP_HOST=smtp.yourprovider.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-username
# SMTP_PASS=your-password
# EMAIL_FROM=noreply@yourdomain.com
# EMAIL_FROM_NAME=TrendBite

# Frontend URL (for email links)
FRONTEND_URL=https://trendbite.com
```

---

## 🧪 Testing Email Templates

### Test in Browser

Copy the HTML from `emailTemplates.js` and open in browser to preview.

### Send Test Email

```javascript
import { sendEmail } from './src/config/email.js';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1><p>This is a test email.</p>'
});
```

### Use Email Testing Services

**Mailtrap (Development):**
- Catches all emails
- Preview without sending to real addresses
- Free tier available

**Configuration:**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

---

## 📈 Monitoring & Logging

### Console Logs

The system logs all email activities:

```bash
✅ Email service is ready
✅ Email sent successfully: <message-id>
✅ Order confirmation email sent to customer@email.com for order TB000123
❌ Failed to send order confirmation email for order TB000123: Error message
⚠️  Email not sent: Email service not configured
```

### Error Handling

Emails are sent asynchronously and won't block order creation:

```javascript
// Order is created successfully
// Email is sent in background
// If email fails, order is still created
```

---

## 🎨 Customizing Email Templates

### Edit Templates

File: `src/utils/emailTemplates.js`

### Customization Options:

1. **Colors:**
   ```javascript
   // Change gradient colors
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   ```

2. **Logo:**
   ```javascript
   // Add your logo
   <img src="https://yourdomain.com/logo.png" alt="TrendBite" />
   ```

3. **Fonts:**
   ```javascript
   font-family: 'Your Font', -apple-system, BlinkMacSystemFont, sans-serif;
   ```

4. **Content:**
   - Edit text messages
   - Add/remove sections
   - Change layout

### Example: Add Company Logo

```javascript
// In generateOrderConfirmationEmail, add after header:
<tr>
  <td style="padding: 20px; text-align: center; background-color: #ffffff;">
    <img src="https://trendbite.com/logo.png" 
         alt="TrendBite Logo" 
         style="height: 50px; width: auto;" />
  </td>
</tr>
```

---

## 🔄 Email Flow Diagram

```
Order Created
     ↓
Transaction Successful
     ↓
[Order Confirmation Email Sent] ← Beautiful invoice template
     ↓
Response to Customer
     ↓
Admin Updates Status to 'shipped'
     ↓
[Shipped Email Sent] ← Tracking info
     ↓
Delivery Person Updates to 'out_for_delivery'
     ↓
[Out for Delivery Email Sent]
     ↓
Delivery Person Marks as 'delivered'
     ↓
[Delivered Email Sent]
     ↓
(Optional) [Rating Reminder Email]
```

---

## ⚡ Advanced Configuration

### Email Queue (Future Enhancement)

For high-volume production:

```javascript
// Using Bull Queue
import Queue from 'bull';

const emailQueue = new Queue('emails', {
  redis: { host: 'localhost', port: 6379 }
});

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});

// Add to queue instead of sending directly
emailQueue.add({ to, subject, html });
```

### Email Templates with Variables

```javascript
// Template with dynamic content
const template = {
  subject: 'Order {{orderNumber}} Confirmed',
  html: '<h1>Thank you {{customerName}}!</h1>'
};

// Replace variables
const email = template.html
  .replace('{{customerName}}', customer.firstName)
  .replace('{{orderNumber}}', order.orderNumber);
```

### Scheduled Emails

```javascript
// Send rating reminder 2 days after delivery
import cron from 'node-cron';

cron.schedule('0 9 * * *', async () => {
  // Find delivered orders from 2 days ago without rating
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const orders = await Order.find({
    status: 'delivered',
    'shipping.actualDeliveryDate': { 
      $gte: twoDaysAgo,
      $lt: new Date(twoDaysAgo.getTime() + 24*60*60*1000)
    },
    'deliveryRating.rating': { $exists: false }
  });

  for (const order of orders) {
    await sendRatingReminderEmail(order);
  }
});
```

---

## 📞 Support & Resources

### Documentation
- [Nodemailer Docs](https://nodemailer.com/)
- [SendGrid API](https://docs.sendgrid.com/)
- [Mailgun Docs](https://documentation.mailgun.com/)

### Testing Tools
- [Mailtrap](https://mailtrap.io/) - Email testing
- [Mail Tester](https://www.mail-tester.com/) - Spam score check
- [Litmus](https://www.litmus.com/) - Email preview across clients

### Email Deliverability
- [MXToolbox](https://mxtoolbox.com/) - DNS/SPF checker
- [DMARC Analyzer](https://www.dmarcanalyzer.com/)

---

## ✅ Configuration Checklist

### Development Setup
- [ ] Choose email provider (Gmail recommended)
- [ ] Add environment variables to `.env`
- [ ] Test email configuration
- [ ] Send test order confirmation
- [ ] Verify email received
- [ ] Check email formatting in different clients

### Production Setup
- [ ] Set up professional email service (SendGrid/Mailgun)
- [ ] Verify sender domain
- [ ] Add SPF/DKIM/DMARC records
- [ ] Configure production environment variables
- [ ] Test email delivery
- [ ] Monitor deliverability rates
- [ ] Set up error monitoring
- [ ] Configure email analytics

---

## 🎯 Common Issues & Solutions

### Issue: Emails not received

**Check:**
1. ✅ Environment variables configured correctly
2. ✅ Email service credentials valid
3. ✅ Transporter initialized successfully
4. ✅ Check spam folder
5. ✅ Verify recipient email is correct
6. ✅ Check console logs for errors

### Issue: Emails in spam folder

**Solutions:**
1. Verify sender domain
2. Add SPF/DKIM records
3. Use professional email service
4. Improve email content (avoid spam triggers)
5. Start with low volume

### Issue: Gmail limits exceeded

**Solutions:**
1. Switch to SendGrid or Mailgun
2. Implement email queuing
3. Distribute across multiple accounts (not recommended)

---

## 📊 Email Statistics

### Track These Metrics:

1. **Delivery Rate:** % of emails successfully delivered
2. **Open Rate:** % of emails opened by recipients
3. **Click Rate:** % of recipients clicking links
4. **Bounce Rate:** % of emails that bounced
5. **Unsubscribe Rate:** % of recipients unsubscribing
6. **Spam Reports:** Number of spam complaints

### SendGrid Dashboard

Access detailed analytics at: https://app.sendgrid.com/

---

## 🚀 Next Steps

After email is configured:

1. **Test Thoroughly**
   - Create test orders
   - Verify all email types
   - Check on mobile devices

2. **Monitor Performance**
   - Track delivery rates
   - Monitor errors
   - Review customer feedback

3. **Optimize Templates**
   - A/B test subject lines
   - Improve click-through rates
   - Enhance design based on feedback

4. **Add More Email Types** (Optional)
   - Welcome email for new users
   - Password reset emails
   - Promotional emails
   - Newsletter

---

*Last Updated: October 10, 2025*
*Version: 1.0.0*


