/**
 * Email Templates for TrendBite
 * Beautiful, responsive HTML email templates
 */

/**
 * Generate Order Confirmation Email Template
 */
export const generateOrderConfirmationEmail = (orderData) => {
  const {
    orderNumber,
    customer,
    items,
    subtotal,
    deliveryCost,
    discount,
    totalAmount,
    deliveryAddress,
    shipping,
    payment,
    createdAt,
    currency = "LKR",
  } = orderData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shippingMethodDisplay = {
    standard: "Standard Delivery (3 working days)",
    express: "Express Delivery (within 1 day)",
  };

  const itemsHTML = items
    .map(
      (item, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 16px 0;">
        <div style="display: flex; align-items: center;">
          <div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; margin-right: 16px; overflow: hidden;">
            ${
              item.product.images && item.product.images[0]
                ? `<img src="${item.product.images[0].url}" alt="${item.product.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 24px;">📦</div>`
            }
          </div>
          <div>
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${
              item.product.name
            }</div>
            <div style="font-size: 14px; color: #6b7280;">
              ${item.product.brand || ""} • Size: ${
        item.variant.size
      } • Color: ${item.variant.color.name}
            </div>
            <div style="font-size: 14px; color: #6b7280;">SKU: ${
              item.variant.sku
            }</div>
          </div>
        </div>
      </td>
      <td style="padding: 16px 0; text-align: center; color: #6b7280;">
        ${item.quantity}
      </td>
      <td style="padding: 16px 0; text-align: right; color: #6b7280;">
        ${currency} ${formatCurrency(item.unitPrice)}
      </td>
      <td style="padding: 16px 0; text-align: right; font-weight: 600; color: #111827;">
        ${currency} ${formatCurrency(item.totalPrice)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Content -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🎉 Order Confirmed!
              </h1>
              <p style="margin: 12px 0 0 0; color: #e0e7ff; font-size: 16px;">
                Thank you for your purchase, ${customer.firstName}!
              </p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #065f46; font-size: 14px;">
                  ✅ Your order has been successfully placed and is being processed.
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 50%; padding-bottom: 20px;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Order Number</div>
                    <div style="font-size: 18px; font-weight: 700; color: #111827;">${orderNumber}</div>
                  </td>
                  <td style="width: 50%; padding-bottom: 20px; text-align: right;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Order Date</div>
                    <div style="font-size: 14px; color: #111827;">${formatDate(
                      createdAt
                    )}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Header -->
          <tr>
            <td style="padding: 0 30px 16px 30px;">
              <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">
                  📋 Order Invoice
                </h2>
              </div>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 12px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Product</th>
                    <th style="text-align: center; padding: 12px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Qty</th>
                    <th style="text-align: right; padding: 12px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Price</th>
                    <th style="text-align: right; padding: 12px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 500;">${currency} ${formatCurrency(
    subtotal
  )}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    Delivery (${
                      shippingMethodDisplay[shipping?.method] || "Standard"
                    })
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 500;">${currency} ${formatCurrency(
    deliveryCost
  )}</td>
                </tr>
                ${
                  discount?.amount > 0
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #10b981; font-size: 14px;">
                    Discount ${discount.code ? `(${discount.code})` : ""}
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 500;">- ${currency} ${formatCurrency(
                        discount.amount
                      )}</td>
                </tr>
                `
                    : ""
                }
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 16px 0 0 0; color: #111827; font-size: 18px; font-weight: 700;">Total Amount</td>
                  <td style="padding: 16px 0 0 0; text-align: right; color: #667eea; font-size: 24px; font-weight: 700;">${currency} ${formatCurrency(
    totalAmount
  )}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery & Payment Info -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Delivery Address -->
                  <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px;">
                      <div style="font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600;">
                        📍 Delivery Address
                      </div>
                      <div style="font-size: 14px; color: #78350f; line-height: 1.6;">
                        <strong>${customer.firstName} ${
    customer.lastName
  }</strong><br>
                        ${deliveryAddress.street}<br>
                        ${deliveryAddress.city}, ${deliveryAddress.state} ${
    deliveryAddress.zipCode
  }<br>
                        ${deliveryAddress.country}<br>
                        📞 ${deliveryAddress.phone}
                      </div>
                    </div>
                  </td>
                  
                  <!-- Payment & Shipping Info -->
                  <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px;">
                      <div style="font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600;">
                        💳 Payment & Shipping
                      </div>
                      <div style="font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                        <strong>Payment:</strong> ${payment.method
                          .replace(/_/g, " ")
                          .toUpperCase()}<br>
                        <strong>Shipping:</strong> ${
                          shippingMethodDisplay[shipping?.method] || "Standard"
                        }<br>
                        ${
                          shipping?.estimatedDeliveryDate
                            ? `<strong>Est. Delivery:</strong> ${formatDate(
                                shipping.estimatedDeliveryDate
                              )}`
                            : ""
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Order Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="${
                process.env.FRONTEND_URL || "https://trendbite.com"
              }/orders/${orderData._id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                📦 Track Your Order
              </a>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 12px 0;">
                      💡 <strong>Need Help?</strong>
                    </p>
                    <p style="margin: 0;">
                      Contact us at 
                      <a href="mailto:support@trendbite.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@trendbite.com</a>
                      or call <strong>+94 77 123 4567</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #111827;">
              <div style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;">
                  <strong style="color: #ffffff; font-size: 16px; letter-spacing: 1px;">TRENDBITE</strong>
                </p>
                <p style="margin: 0 0 8px 0;">
                  Your Fashion Destination
                </p>
                <p style="margin: 0;">
                  © ${new Date().getFullYear()} TrendBite. All rights reserved.
                </p>
                <div style="margin-top: 16px;">
                  <a href="${
                    process.env.FRONTEND_URL || "https://trendbite.com"
                  }/privacy" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
                  <a href="${
                    process.env.FRONTEND_URL || "https://trendbite.com"
                  }/terms" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Terms of Service</a> |
                  <a href="${
                    process.env.FRONTEND_URL || "https://trendbite.com"
                  }/contact" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Contact Us</a>
                </div>
              </div>
            </td>
          </tr>

        </table>

        <!-- Mobile Optimization Note -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center; color: #9ca3af; font-size: 11px;">
              <p style="margin: 0;">
                This email was sent to ${
                  customer.email
                }. If you didn't place this order, please contact us immediately.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Generate Order Status Update Email Template
 */
export const generateOrderStatusUpdateEmail = (orderData, newStatus) => {
  const { orderNumber, customer, totalAmount, currency = "LKR" } = orderData;

  const statusMessages = {
    confirmed: {
      icon: "✅",
      title: "Order Confirmed",
      message:
        "Your order has been confirmed and is being prepared for shipping.",
      color: "#10b981",
    },
    shipped: {
      icon: "📦",
      title: "Order Shipped",
      message: "Your order has been shipped and is on its way to you!",
      color: "#3b82f6",
    },
    out_for_delivery: {
      icon: "🚚",
      title: "Out for Delivery",
      message: "Your order is out for delivery and will arrive soon!",
      color: "#f59e0b",
    },
    delivered: {
      icon: "🎁",
      title: "Order Delivered",
      message: "Your order has been delivered. We hope you love it!",
      color: "#10b981",
    },
  };

  const statusInfo = statusMessages[newStatus] || {
    icon: "📝",
    title: "Order Status Updated",
    message: `Your order status has been updated to ${newStatus}.`,
    color: "#6b7280",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Update - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: ${
              statusInfo.color
            };">
              <div style="font-size: 48px; margin-bottom: 12px;">${
                statusInfo.icon
              }</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ${statusInfo.title}
              </h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="margin: 0 0 24px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                ${statusInfo.message}
              </p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Order Number</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${orderNumber}</div>
              </div>
              <a href="${
                process.env.FRONTEND_URL || "https://trendbite.com"
              }/orders/${orderData._id}" 
                 style="display: inline-block; background-color: ${
                   statusInfo.color
                 }; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View Order Details
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Thank you for shopping with TrendBite!</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Generate Password Reset Email Template
 */
export const generatePasswordResetEmail = (userData, resetToken) => {
  const { firstName, lastName, email } = userData;
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/forgot-password/${resetToken}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Password Reset Request
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                Hi <strong>${firstName} ${lastName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your TrendBite account (<strong>${email}</strong>).
              </p>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for security reasons.
              </p>

              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      🔑 Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0; word-break: break-all;">
                  <a href="${resetUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">${resetUrl}</a>
                </p>
              </div>

              <!-- Security Notice -->
              <div style="margin-top: 30px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                This link will expire in 1 hour
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} TrendBite. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Generate New Discount Notification Email Template
 */
export const generateDiscountNotificationEmail = (discountData, userData) => {
  const {
    code,
    name,
    description,
    type,
    value,
    minimumOrderAmount,
    maximumDiscountAmount,
    validFrom,
    validUntil,
    currency = "LKR",
  } = discountData;

  const { firstName, lastName } = userData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDiscountValue = () => {
    if (type === "percentage") {
      return `${value}% OFF`;
    } else {
      return `${currency} ${formatCurrency(value)} OFF`;
    }
  };

  const getDiscountDescription = () => {
    if (type === "percentage") {
      let desc = `Get ${value}% discount`;
      if (maximumDiscountAmount) {
        desc += ` (up to ${currency} ${formatCurrency(maximumDiscountAmount)})`;
      }
      if (minimumOrderAmount > 0) {
        desc += ` on orders above ${currency} ${formatCurrency(
          minimumOrderAmount
        )}`;
      }
      return desc;
    } else {
      let desc = `Get ${currency} ${formatCurrency(value)} off`;
      if (minimumOrderAmount > 0) {
        desc += ` on orders above ${currency} ${formatCurrency(
          minimumOrderAmount
        )}`;
      }
      return desc;
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Discount Available!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Content -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Animated Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 50px 30px; text-align: center; position: relative;">
              <div style="font-size: 64px; margin-bottom: 20px; animation: bounce 2s infinite;">🎉</div>
              <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Exclusive Discount Just for You!
              </h1>
              <p style="margin: 0; color: #e0e7ff; font-size: 18px; font-weight: 500;">
                Save big on your next purchase, ${firstName}!
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 30px 20px 30px;">
              <p style="margin: 0; color: #111827; font-size: 18px; line-height: 1.6;">
                Hi <strong>${firstName} ${lastName}</strong>,
              </p>
            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 6px solid #f59e0b; padding: 24px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);">
                <p style="margin: 0; color: #92400e; font-size: 16px; line-height: 1.8;">
                  <strong>🎁 Great news!</strong> We've just launched a brand new discount exclusively for our valued customers. Don't miss this amazing opportunity to save on your favorite products!
                </p>
              </div>
            </td>
          </tr>

          <!-- Discount Details Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 16px; text-align: center; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);">
                    
                    <!-- Discount Code Box -->
                    <div style="background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 3px dashed #ffffff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                      <div style="font-size: 14px; color: #e0e7ff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-weight: 600;">
                        YOUR PROMO CODE
                      </div>
                      <div style="font-size: 42px; font-weight: 900; color: #ffffff; letter-spacing: 4px; font-family: 'Courier New', monospace; text-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                        ${code}
                      </div>
                      <div style="margin-top: 12px;">
                        <span style="background-color: #fbbf24; color: #78350f; padding: 8px 20px; border-radius: 20px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3);">
                          ${getDiscountValue()}
                        </span>
                      </div>
                    </div>

                    <!-- Discount Name -->
                    <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      ${name}
                    </h2>
                    
                    ${
                      description
                        ? `
                    <p style="margin: 0 0 20px 0; color: #e0e7ff; font-size: 16px; line-height: 1.6;">
                      ${description}
                    </p>
                    `
                        : ""
                    }

                    <!-- Discount Details -->
                    <div style="background-color: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; text-align: left; margin-top: 20px;">
                      <div style="color: #ffffff; font-size: 15px; line-height: 2;">
                        <div style="margin-bottom: 8px;">
                          <span style="display: inline-block; width: 24px;">💰</span>
                          <strong>Discount:</strong> ${getDiscountDescription()}
                        </div>
                        ${
                          minimumOrderAmount > 0
                            ? `
                        <div style="margin-bottom: 8px;">
                          <span style="display: inline-block; width: 24px;">🛒</span>
                          <strong>Minimum Order:</strong> ${currency} ${formatCurrency(
                                minimumOrderAmount
                              )}
                        </div>
                        `
                            : ""
                        }
                        <div style="margin-bottom: 8px;">
                          <span style="display: inline-block; width: 24px;">📅</span>
                          <strong>Valid From:</strong> ${formatDate(validFrom)}
                        </div>
                        <div>
                          <span style="display: inline-block; width: 24px;">⏰</span>
                          <strong>Valid Until:</strong> ${formatDate(
                            validUntil
                          )}
                        </div>
                      </div>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- How to Use Section -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px;">
                <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 700;">
                  ✨ How to Use This Discount
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 2;">
                  <li>Browse our amazing collection of products</li>
                  <li>Add your favorite items to the cart</li>
                  <li>Enter promo code <strong style="color: #667eea; font-family: 'Courier New', monospace;">${code}</strong> at checkout</li>
                  <li>Enjoy your instant discount! 🎊</li>
                </ol>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="${
                process.env.FRONTEND_URL || "https://trendbite.com"
              }/products" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4); transition: transform 0.3s ease;">
                🛍️ Shop Now & Save
              </a>
              <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 13px;">
                Don't wait! This offer is valid until ${formatDate(validUntil)}
              </p>
            </td>
          </tr>

          <!-- Social Proof / Urgency -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 6px solid #ef4444; padding: 20px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 600;">
                  ⚡ <strong>Limited Time Offer!</strong> This exclusive discount won't last forever. Shop now before it expires!
                </p>
              </div>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 2px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; color: #6b7280; font-size: 14px; line-height: 1.8;">
                    <p style="margin: 0 0 12px 0;">
                      💬 <strong>Need Help?</strong>
                    </p>
                    <p style="margin: 0;">
                      Contact us at 
                      <a href="mailto:support@trendbite.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@trendbite.com</a>
                      or call <strong>+94 77 123 4567</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #111827 0%, #1f2937 100%);">
              <div style="color: #9ca3af; font-size: 13px; line-height: 1.8;">
                <p style="margin: 0 0 8px 0;">
                  <strong style="color: #ffffff; font-size: 18px; letter-spacing: 2px;">TRENDBITE</strong>
                </p>
                <p style="margin: 0 0 8px 0; color: #d1d5db;">
                  Your Fashion Destination ✨
                </p>
                <p style="margin: 0 0 16px 0;">
                  © ${new Date().getFullYear()} TrendBite. All rights reserved.
                </p>
                <div style="margin-top: 16px;">
                  <a href="${
                    process.env.FRONTEND_URL || "https://trendbite.com"
                  }/privacy" style="color: #9ca3af; text-decoration: none; margin: 0 8px; font-size: 12px;">Privacy Policy</a> |
                  <a href="${
                    process.env.FRONTEND_URL || "https://trendbite.com"
                  }/terms" style="color: #9ca3af; text-decoration: none; margin: 0 8px; font-size: 12px;">Terms of Service</a> |
                  <a href="${
                    process.env.FRONTEND_URL || "https://trendbite.com"
                  }/unsubscribe" style="color: #9ca3af; text-decoration: none; margin: 0 8px; font-size: 12px;">Unsubscribe</a>
                </div>
              </div>
            </td>
          </tr>

        </table>

        <!-- Email Footer Note -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center; color: #9ca3af; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0;">
                You're receiving this email because you're a valued customer of TrendBite.<br>
                This email was sent to ${userData.email}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

export default {
  generateOrderConfirmationEmail,
  generateOrderStatusUpdateEmail,
  generatePasswordResetEmail,
  generateDiscountNotificationEmail,
};
