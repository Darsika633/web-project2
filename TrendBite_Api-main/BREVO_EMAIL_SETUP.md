# 📧 Brevo Email Setup Guide

## Overview

This guide will help you set up Brevo (formerly Sendinblue) as your email service for TrendBite. Brevo offers a generous free tier with 300 emails/day, making it perfect for both development and production.

---

## ✨ Why Brevo?

**Advantages:**
- ✅ 300 free emails per day (permanent)
- ✅ Professional email service
- ✅ High deliverability rates
- ✅ Email analytics and tracking
- ✅ Easy SMTP setup
- ✅ No credit card required for free tier
- ✅ Sender domain verification
- ✅ Beautiful dashboard

---

## 🚀 Quick Setup

### Your Brevo SMTP Credentials

```env
EMAIL_SERVICE=brevo
BREVO_SMTP_USER=98fe1e001@smtp-brevo.com
BREVO_SMTP_KEY=TWM6CSJpvdnL3zR7
EMAIL_FROM=noreply@trendbite.com
EMAIL_FROM_NAME=TrendBite - Your Fashion Destination
```

### Step 1: Add to .env File

Add these variables to your `.env` file:

```bash
# Email Configuration - Brevo
EMAIL_SERVICE=brevo
BREVO_SMTP_USER=98fe1e001@smtp-brevo.com
BREVO_SMTP_KEY=TWM6CSJpvdnL3zR7
EMAIL_FROM=noreply@trendbite.com
EMAIL_FROM_NAME=TrendBite - Your Fashion Destination

# Frontend URL (for email links)
FRONTEND_URL=https://trendbite.com
```

### Step 2: Verify Configuration

The email service will automatically initialize when you start the server:

```bash
npm run dev
```

Look for:
```
✅ Email service is ready
```

If you see:
```
❌ Email service verification failed
```

Check your credentials and network connection.

---

## 🔧 Configuration Details

### SMTP Settings

| Setting | Value |
|---------|-------|
| **SMTP Server** | smtp-relay.brevo.com |
| **Port** | 587 |
| **Security** | STARTTLS |
| **Login** | 98fe1e001@smtp-brevo.com |
| **Password** | TWM6CSJpvdnL3zR7 |

### Email Settings

**From Email:** Use a verified sender email in Brevo
- Recommended: `noreply@trendbite.com`
- Alternative: `orders@trendbite.com`
- Must be verified in Brevo dashboard

**From Name:** Display name in recipient's inbox
- Example: "TrendBite - Your Fashion Destination"
- Keep it professional and recognizable

---

## 📋 Sender Verification (Important!)

### Why Verify Your Domain?

✅ **Better deliverability** - Emails won't go to spam  
✅ **Professional appearance** - Use your own domain  
✅ **Build trust** - Customers trust emails from @trendbite.com  
✅ **Required for production** - Many providers require verification  

### How to Verify in Brevo

1. **Login to Brevo Dashboard**
   - Go to https://app.brevo.com

2. **Navigate to Senders**
   - Settings → Senders & IP

3. **Add Sender Email**
   - Click "Add a sender"
   - Enter: `noreply@trendbite.com`
   - Verify via email link

4. **Verify Domain (Optional but Recommended)**
   - Settings → Domains
   - Add your domain: `trendbite.com`
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification (can take up to 48 hours)

### DNS Records to Add

After adding your domain in Brevo, you'll receive DNS records like:

```
Type: TXT
Host: @
Value: v=spf1 include:spf.brevo.com ~all

Type: TXT  
Host: mail._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBA...

Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@trendbite.com
```

Add these to your domain's DNS settings (GoDaddy, Namecheap, Cloudflare, etc.)

---

## 🧪 Testing Email Functionality

### Test 1: Verify Email Service

Create a simple test script: `test-email.js`

```javascript
import { verifyEmailConfig } from './src/config/email.js';
import { sendEmail } from './src/config/email.js';

// Test 1: Verify configuration
console.log('Testing email configuration...');
const isValid = await verifyEmailConfig();

if (isValid) {
  console.log('✅ Email service configured correctly');
  
  // Test 2: Send test email
  console.log('\nSending test email...');
  const result = await sendEmail({
    to: 'your-test-email@example.com',
    subject: 'Test Email from TrendBite',
    html: '<h1>Hello!</h1><p>This is a test email from TrendBite API.</p>'
  });
  
  console.log('Result:', result);
} else {
  console.log('❌ Email service not configured');
}

process.exit(0);
```

Run:
```bash
node test-email.js
```

### Test 2: Create Test Order

Make a POST request to create an order:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "deliveryAddress": {...},
    "billingAddress": {...}
  }'
```

Check:
1. Order created successfully ✓
2. Email sent message in console ✓
3. Email received in inbox ✓
4. Email formatted correctly ✓

---

## 📊 Monitoring Emails in Brevo

### Dashboard Access

1. Login to https://app.brevo.com
2. Go to **Statistics** → **Email**

### What You Can Track:

- **Sent:** Total emails sent
- **Delivered:** Successfully delivered
- **Opened:** Emails opened by recipients
- **Clicked:** Links clicked in emails
- **Bounced:** Failed deliveries
- **Spam Reports:** Marked as spam
- **Unsubscribed:** Unsubscribe requests

### View Individual Emails

- Go to **Campaigns** → **Transactional**
- See all transactional emails sent
- View delivery status, opens, clicks
- Debug delivery issues

---

## 🎯 Email Types Sent by TrendBite

### 1. Order Confirmation Email

**Trigger:** Order successfully created  
**Subject:** `Order Confirmation - TB000123 🎉`  
**Contains:**
- Order number and date
- Complete invoice with items
- Pricing breakdown
- Delivery address
- Payment method
- Shipping information
- Track order button

**Daily Estimate:** 50-200 emails (depends on orders)

### 2. Order Status Update Emails

**Triggers:**
- Order confirmed ✅
- Order shipped 📦
- Out for delivery 🚚
- Order delivered 🎁

**Subject Examples:**
- `Order Confirmed - TB000123 ✅`
- `Order Shipped - TB000123 📦`
- `Order Out for Delivery - TB000123 🚚`
- `Order Delivered - TB000123 🎁`

**Daily Estimate:** 100-400 emails (4 emails per order on average)

### Total Estimated Daily Volume

- Low traffic: 50-100 emails/day
- Medium traffic: 200-500 emails/day
- High traffic: 500-1000 emails/day

**Brevo Free Tier:** 300 emails/day ✅

---

## 📈 Scaling Considerations

### When to Upgrade

**Free Tier (300 emails/day):**
- ✅ Perfect for: 50-75 orders/day
- ✅ Suitable for: New stores, development

**Lite Plan ($25/month - 20,000 emails/month):**
- ✅ Perfect for: 100-300 orders/day
- ✅ Suitable for: Growing stores

**Premium Plans:**
- For stores with 300+ daily orders
- Advanced features needed

### Email Volume Calculation

```
Orders per day × 5 emails per order = Total emails/day

Example:
60 orders/day × 5 emails = 300 emails/day (Free tier limit)
```

**5 emails per order:**
1. Order confirmation
2. Order confirmed (status update)
3. Order shipped
4. Out for delivery
5. Order delivered

---

## 🔒 Security Best Practices

### Protect Your SMTP Credentials

1. **Never commit .env to Git:**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use different keys for dev/prod:**
   ```
   Development: One Brevo account
   Production: Separate Brevo account
   ```

3. **Rotate keys regularly:**
   - Change SMTP key every 3-6 months
   - Immediately if compromised

4. **Monitor for unusual activity:**
   - Check Brevo dashboard daily
   - Set up alerts in Brevo
   - Watch for bounce rate spikes

---

## 🎨 Customizing Email Content

### Update Email Templates

**File:** `src/utils/emailTemplates.js`

### Add Your Logo

```javascript
// In email header, add:
<img src="https://trendbite.com/logo.png" 
     alt="TrendBite" 
     style="height: 50px; margin-bottom: 20px;" />
```

### Change Colors

```javascript
// Update gradient
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Modify Content

Edit the text, add sections, or rearrange layout as needed.

---

## 🐛 Troubleshooting

### Issue: Authentication Failed

**Error in console:**
```
❌ Email service verification failed: Invalid login
```

**Solutions:**
1. ✅ Verify SMTP credentials are correct
2. ✅ Check for extra spaces in .env file
3. ✅ Ensure you're using SMTP key, not API key
4. ✅ Login to Brevo and generate new SMTP key if needed

### Issue: Emails Not Received

**Checklist:**
1. ✅ Check spam/junk folder
2. ✅ Verify sender email in Brevo dashboard
3. ✅ Check Brevo statistics for delivery status
4. ✅ Ensure recipient email is valid
5. ✅ Check console logs for "Email sent successfully"

### Issue: Emails in Spam

**Solutions:**
1. **Verify your domain** in Brevo
2. **Add DNS records** (SPF, DKIM, DMARC)
3. **Use professional sender** (noreply@yourdomain.com)
4. **Warm up your domain** (start with low volume)
5. **Avoid spam trigger words** in subject/content

### Issue: Rate Limit Exceeded

**Error:** `Too many emails sent`

**Solutions:**
1. Check current usage in Brevo dashboard
2. Upgrade to paid plan if needed
3. Implement email queuing for high volume
4. Reduce unnecessary emails

---

## 📊 Brevo Dashboard Guide

### Key Sections

**1. Statistics**
- View email performance
- Track delivery rates
- Monitor engagement

**2. Senders & IP**
- Manage sender emails
- Verify domains
- Check IP reputation

**3. Transactional**
- View all sent emails
- Track individual email status
- Debug delivery issues

**4. SMTP & API**
- Get SMTP credentials
- Manage API keys
- View usage statistics

---

## 🎯 Best Practices

### Email Content

1. **Keep subject lines short** (< 50 characters)
2. **Use clear CTAs** (Track Order, View Invoice)
3. **Include order number** prominently
4. **Mobile-responsive design** ✓ (already implemented)
5. **Alt text for images** for accessibility

### Deliverability

1. **Verify sender domain** ✓
2. **Authenticate with SPF/DKIM** ✓
3. **Monitor bounce rates** (keep < 5%)
4. **Clean email list** (remove invalid addresses)
5. **Test across email clients** (Gmail, Outlook, Apple Mail)

### Performance

1. **Send emails asynchronously** ✓ (already implemented)
2. **Don't block API responses** ✓
3. **Log email errors** ✓
4. **Retry failed sends** (implement if needed)
5. **Queue high-volume emails** (implement if needed)

---

## 📝 Checklist

### Initial Setup
- [x] Brevo account created
- [x] SMTP credentials obtained
- [x] Environment variables added to .env
- [x] Email service configured in code
- [ ] Sender email verified in Brevo
- [ ] Test email sent successfully
- [ ] Test order confirmation email
- [ ] Check email in spam folder
- [ ] Verify email formatting on mobile

### Production Readiness
- [ ] Domain verified in Brevo
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC policy configured
- [ ] Sender email matches verified domain
- [ ] Email templates customized with branding
- [ ] Logo added to email templates
- [ ] Contact information updated
- [ ] Privacy policy link added
- [ ] Monitoring set up in Brevo dashboard

---

## 🔗 Useful Resources

**Brevo Resources:**
- [Brevo Dashboard](https://app.brevo.com)
- [Brevo Documentation](https://developers.brevo.com/)
- [SMTP Documentation](https://developers.brevo.com/docs/send-emails-with-smtp)
- [Domain Verification Guide](https://help.brevo.com/hc/en-us/articles/209461765)

**Email Testing:**
- [Mail Tester](https://www.mail-tester.com/) - Check spam score
- [Litmus](https://www.litmus.com/) - Preview across email clients
- [Email on Acid](https://www.emailonacid.com/) - Email testing platform

**DNS Tools:**
- [MXToolbox](https://mxtoolbox.com/) - Check SPF, DKIM, DMARC
- [DMARC Analyzer](https://www.dmarcanalyzer.com/)

---

## 📧 Sample Emails Preview

### Order Confirmation Email

```
From: TrendBite - Your Fashion Destination <noreply@trendbite.com>
To: customer@email.com
Subject: Order Confirmation - TB000123 🎉

╔════════════════════════════════════════════╗
║           🎉 Order Confirmed!             ║
║    Thank you for your purchase, John!     ║
╚════════════════════════════════════════════╝

✅ Your order has been successfully placed and is being processed.

Order Number: TB000123
Order Date: October 10, 2025, 2:30 PM

📋 Order Invoice
────────────────────────────────────────────
[Product Image] Premium Cotton T-Shirt
                TrendBite • Size: M • Color: Red
                SKU: TSHIRT-M-RED-001
                Qty: 2    Price: 1,000    Total: 2,000
────────────────────────────────────────────

Subtotal:                      LKR 2,000.00
Delivery (Standard):           LKR   400.00
Discount (SAVE10):           - LKR   200.00
────────────────────────────────────────────
Total Amount:                  LKR 2,200.00

📍 Delivery Address          💳 Payment & Shipping
John Doe                     Payment: CASH ON DELIVERY
123 Main Street              Shipping: Standard (3 days)
Colombo, Western 00100       Est. Delivery: October 13, 2025
Sri Lanka
📞 +94771234567

        [📦 Track Your Order]

💡 Need Help?
Contact us at support@trendbite.com or call +94 77 123 4567
```

---

## 🚦 Production Deployment

### Pre-Deployment Checklist

- [ ] Brevo account upgraded if needed (based on volume)
- [ ] Production sender email verified
- [ ] Domain verified with DNS records
- [ ] Environment variables set in production
- [ ] Test emails in production environment
- [ ] Monitor first 100 emails for issues
- [ ] Set up Brevo webhooks (optional)
- [ ] Configure email analytics

### Environment Variables in Production

For platforms like Render, Heroku, Vercel:

```bash
# Add these as environment variables
EMAIL_SERVICE=brevo
BREVO_SMTP_USER=98fe1e001@smtp-brevo.com
BREVO_SMTP_KEY=TWM6CSJpvdnL3zR7
EMAIL_FROM=noreply@trendbite.com
EMAIL_FROM_NAME=TrendBite - Your Fashion Destination
FRONTEND_URL=https://trendbite.com
```

---

## 📊 Monitoring & Analytics

### Daily Monitoring

Check Brevo dashboard for:
- **Delivery rate** (should be > 95%)
- **Bounce rate** (should be < 5%)
- **Open rate** (typical: 15-25%)
- **Click rate** (typical: 2-5%)
- **Spam reports** (should be < 0.1%)

### Weekly Review

1. Review email templates based on engagement
2. Check for bounce patterns
3. Monitor spam complaints
4. Optimize subject lines if needed
5. Update content based on feedback

### Set Up Alerts

In Brevo:
1. Go to Settings → Alerts
2. Enable alerts for:
   - Bounce rate spike
   - Spam complaint threshold
   - Daily limit approaching
   - Delivery issues

---

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Check email statistics
- Review bounce reports
- Clean invalid email addresses

**Monthly:**
- Review email templates
- Update content if needed
- Check deliverability trends
- Optimize based on analytics

**Quarterly:**
- Review sender domain health
- Update DNS records if needed
- Audit email content
- A/B test subject lines

---

## 💡 Tips for Success

1. **Warm Up Your Domain**
   - Start with low volume (10-20 emails/day)
   - Gradually increase over 2-4 weeks
   - Build sender reputation

2. **Maintain Clean List**
   - Remove bounced emails
   - Validate email addresses
   - Handle unsubscribes

3. **Personalize Content**
   - Use customer's name ✓ (already implemented)
   - Include order-specific details ✓
   - Relevant product recommendations

4. **Monitor Engagement**
   - Track open rates
   - Analyze click patterns
   - Optimize based on data

5. **Test Regularly**
   - Preview in different email clients
   - Test on mobile devices
   - Check spam score

---

## 🎉 You're All Set!

Your TrendBite application is now configured to send beautiful, professional emails using Brevo!

**What happens automatically:**
1. ✅ Customer places order
2. ✅ Order confirmation email sent with invoice
3. ✅ Admin updates order status
4. ✅ Status update email sent to customer
5. ✅ All emails tracked in Brevo dashboard

**Next steps:**
1. Test email sending
2. Verify sender email in Brevo
3. Add domain verification (for production)
4. Monitor first emails in dashboard
5. Enjoy automated email notifications! 🚀

---

*Last Updated: October 10, 2025*
*For support: support@trendbite.com*


