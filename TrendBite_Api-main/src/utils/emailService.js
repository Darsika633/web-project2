import { sendEmail } from "../config/email.js";
import {
  generateOrderConfirmationEmail,
  generateOrderStatusUpdateEmail,
  generatePasswordResetEmail,
  generateDiscountNotificationEmail,
} from "./emailTemplates.js";
import User from "../models/User.js";

/**
 * Send order confirmation email with invoice
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    // Populate order data if needed
    if (!order.populated("customer")) {
      await order.populate([
        { path: "customer", select: "firstName lastName email" },
        { path: "items.product", select: "name brand images" },
      ]);
    }

    // Prepare order data for email
    const orderData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
      },
      items: order.items.map((item) => ({
        product: {
          name: item.product.name,
          brand: item.product.brand,
          images: item.product.images,
        },
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: order.subtotal,
      deliveryCost: order.deliveryCost,
      discount: order.discount,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      shipping: order.shipping,
      payment: order.payment,
      createdAt: order.createdAt,
      currency: order.currency || "LKR",
    };

    // Generate HTML email
    const htmlContent = generateOrderConfirmationEmail(orderData);

    // Send email
    const result = await sendEmail({
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber} 🎉`,
      html: htmlContent,
    });

    if (result.success) {
      console.log(
        `✅ Order confirmation email sent to ${order.customer.email} for order ${order.orderNumber}`
      );
    } else {
      console.error(
        `❌ Failed to send order confirmation email for order ${order.orderNumber}:`,
        result.message
      );
    }

    return result;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

/**
 * Send order status update email
 */
export const sendOrderStatusUpdateEmail = async (order, newStatus) => {
  try {
    // Only send emails for certain status updates
    const notifiableStatuses = [
      "confirmed",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];
    if (!notifiableStatuses.includes(newStatus)) {
      console.log(`ℹ️  Skipping email notification for status: ${newStatus}`);
      return { success: true, skipped: true };
    }

    // Populate order data if needed
    if (!order.populated("customer")) {
      await order.populate([
        { path: "customer", select: "firstName lastName email" },
      ]);
    }

    const orderData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
      },
      totalAmount: order.totalAmount,
      currency: order.currency || "LKR",
    };

    // Generate HTML email
    const htmlContent = generateOrderStatusUpdateEmail(orderData, newStatus);

    // Email subject based on status
    const statusSubjects = {
      confirmed: `Order Confirmed - ${order.orderNumber} ✅`,
      shipped: `Order Shipped - ${order.orderNumber} 📦`,
      out_for_delivery: `Order Out for Delivery - ${order.orderNumber} 🚚`,
      delivered: `Order Delivered - ${order.orderNumber} 🎁`,
    };

    // Send email
    const result = await sendEmail({
      to: order.customer.email,
      subject:
        statusSubjects[newStatus] || `Order Update - ${order.orderNumber}`,
      html: htmlContent,
    });

    if (result.success) {
      console.log(
        `✅ Status update email sent to ${order.customer.email} for order ${order.orderNumber}`
      );
    } else {
      console.error(
        `❌ Failed to send status update email for order ${order.orderNumber}:`,
        result.message
      );
    }

    return result;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

/**
 * Send delivery rating reminder email
 */
export const sendRatingReminderEmail = async (order) => {
  try {
    if (!order.populated("customer")) {
      await order.populate([
        { path: "customer", select: "firstName lastName email" },
        { path: "deliveryPerson", select: "firstName lastName" },
      ]);
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Your Delivery</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
              <h1 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 700;">
                How was your delivery experience?
              </h1>
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                We'd love to hear about your experience with ${
                  order.deliveryPerson
                    ? `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}`
                    : "our delivery service"
                }.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Order Number</div>
                <div style="font-size: 18px; font-weight: 700; color: #111827;">${
                  order.orderNumber
                }</div>
              </div>
              <a href="${
                process.env.FRONTEND_URL || "https://trendbite.com"
              }/orders/${order._id}/rate" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ⭐ Rate Delivery Service
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Your feedback helps us improve our service. Thank you!</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const result = await sendEmail({
      to: order.customer.email,
      subject: `Rate Your Delivery - ${order.orderNumber} ⭐`,
      html: htmlContent,
    });

    if (result.success) {
      console.log(
        `✅ Rating reminder email sent to ${order.customer.email} for order ${order.orderNumber}`
      );
    } else {
      console.error(
        `❌ Failed to send rating reminder email for order ${order.orderNumber}:`,
        result.message
      );
    }

    return result;
  } catch (error) {
    console.error("Error sending rating reminder email:", error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    // Generate HTML email
    const htmlContent = generatePasswordResetEmail(userData, resetToken);

    // Send email
    const result = await sendEmail({
      to: user.email,
      subject: "Reset Your Password - TrendBite 🔐",
      html: htmlContent,
    });

    if (result.success) {
      console.log(`✅ Password reset email sent to ${user.email}`);
    } else {
      console.error(
        `❌ Failed to send password reset email to ${user.email}:`,
        result.message
      );
    }

    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

/**
 * Send new discount notification to all active customers
 */
export const sendDiscountNotificationToAllCustomers = async (discount) => {
  try {
    console.log(
      `📧 Starting to send discount notification for: ${discount.code}`
    );

    // Get all active customers (role: 'customer' and isActive: true)
    const activeCustomers = await User.find({
      role: "customer",
      isActive: true,
    }).select("firstName lastName email");

    if (!activeCustomers || activeCustomers.length === 0) {
      console.log(
        "ℹ️  No active customers found to send discount notifications"
      );
      return {
        success: true,
        message: "No active customers found",
        emailsSent: 0,
        emailsFailed: 0,
      };
    }

    console.log(
      `📨 Found ${activeCustomers.length} active customers. Sending emails...`
    );

    // Prepare discount data
    const discountData = {
      code: discount.code,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      minimumOrderAmount: discount.minimumOrderAmount || 0,
      maximumDiscountAmount: discount.maximumDiscountAmount,
      validFrom: discount.validFrom,
      validUntil: discount.validUntil,
      currency: "LKR",
    };

    // Track email sending results
    let emailsSent = 0;
    let emailsFailed = 0;
    const failedEmails = [];

    // Send emails to all active customers
    // Process in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < activeCustomers.length; i += batchSize) {
      const batch = activeCustomers.slice(i, i + batchSize);

      // Send emails in parallel for each batch
      const batchPromises = batch.map(async (customer) => {
        try {
          const userData = {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
          };

          // Generate HTML email
          const htmlContent = generateDiscountNotificationEmail(
            discountData,
            userData
          );

          // Send email
          const result = await sendEmail({
            to: customer.email,
            subject: `🎉 New Exclusive Discount: ${discount.code} - ${discount.name}`,
            html: htmlContent,
          });

          if (result.success) {
            emailsSent++;
            console.log(
              `✅ [${emailsSent}/${activeCustomers.length}] Email sent to ${customer.email}`
            );
          } else {
            emailsFailed++;
            failedEmails.push({
              email: customer.email,
              reason: result.message,
            });
            console.error(
              `❌ Failed to send email to ${customer.email}:`,
              result.message
            );
          }

          return result;
        } catch (error) {
          emailsFailed++;
          failedEmails.push({ email: customer.email, reason: error.message });
          console.error(
            `❌ Error sending email to ${customer.email}:`,
            error.message
          );
          return { success: false, error: error.message };
        }
      });

      // Wait for batch to complete before processing next batch
      await Promise.all(batchPromises);

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < activeCustomers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    const summary = {
      success: true,
      message: `Discount notification emails sent`,
      totalCustomers: activeCustomers.length,
      emailsSent,
      emailsFailed,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    };

    console.log(`\n📊 Email Campaign Summary for ${discount.code}:`);
    console.log(`   Total Customers: ${activeCustomers.length}`);
    console.log(`   ✅ Emails Sent: ${emailsSent}`);
    console.log(`   ❌ Emails Failed: ${emailsFailed}`);

    if (failedEmails.length > 0) {
      console.log(`\n⚠️  Failed Emails:`, failedEmails);
    }

    return summary;
  } catch (error) {
    console.error("Error sending discount notification emails:", error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendRatingReminderEmail,
  sendPasswordResetEmail,
  sendDiscountNotificationToAllCustomers,
};
