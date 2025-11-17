import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Discount from "../models/Discount.js";
import User from "../models/User.js";
import Inventory from "../models/Inventory.js";
import StockMovement from "../models/StockMovement.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../utils/emailService.js";

// Create a new order
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  let order = null;

  try {
    order = await session.withTransaction(async () => {
      const {
        items,
        deliveryAddress,
        billingAddress,
        paymentMethod,
        shippingMethod,
        discountCode,
        notes,
      } = req.body;
      const customerId = req.user.id;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Order items are required");
      }

      if (!deliveryAddress || !billingAddress) {
        throw new Error("Delivery and billing addresses are required");
      }

      // Validate shipping method
      const validShippingMethods = ["standard", "express"];
      const selectedShippingMethod = shippingMethod || "standard";
      if (!validShippingMethods.includes(selectedShippingMethod)) {
        throw new Error(
          'Invalid shipping method. Choose "standard" or "express"'
        );
      }

      // Validate and process order items
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const { productId, variant, quantity } = item;

        // Find the product
        const product = await Product.findById(productId).session(session);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        // Find the specific variant
        const productVariant = product.variants.find(
          (v) =>
            v.size === variant.size &&
            v.color.name === variant.color.name &&
            v.sku === variant.sku
        );

        if (!productVariant) {
          throw new Error(`Product variant not found for ${product.name}`);
        }

        // Check stock availability
        if (productVariant.stockQuantity < quantity) {
          throw new Error(
            `Insufficient stock for ${product.name} - ${variant.size} ${variant.color.name}. Available: ${productVariant.stockQuantity}`
          );
        }

        // Calculate pricing
        const unitPrice =
          productVariant.price.sale || productVariant.price.regular;
        const totalPrice = unitPrice * quantity;

        console.log(
          `Product: ${product.name}, Variant: ${variant.size} ${variant.color.name}, Unit Price: ${unitPrice}, Quantity: ${quantity}, Total: ${totalPrice}`
        );

        orderItems.push({
          product: productId,
          variant: {
            size: variant.size,
            color: {
              name: variant.color.name,
              hex: variant.color.hex,
            },
            sku: variant.sku,
          },
          quantity,
          unitPrice,
          totalPrice,
        });

        subtotal += totalPrice;
      }

      console.log(`Total subtotal: ${subtotal}`);

      // Process discount if provided
      let discountAmount = 0;
      let appliedDiscountCode = null;
      if (discountCode) {
        console.log(
          `Creating order - Validating discount code: ${discountCode}, customerId: ${customerId}, subtotal: ${subtotal}`
        );
        const discount = await Discount.findValidDiscount(
          discountCode,
          customerId,
          subtotal
        );
        if (discount) {
          discountAmount = discount.calculateDiscountAmount(subtotal);
          appliedDiscountCode = discount.code;
          console.log(
            `Discount applied successfully: ${discount.code}, amount: ${discountAmount}`
          );
        } else {
          console.log(
            `Discount validation failed for code: ${discountCode}, customerId: ${customerId}, subtotal: ${subtotal}`
          );
          throw new Error("Invalid or expired discount code");
        }
      }

      // Calculate delivery cost based on shipping method
      const deliveryCost = Order.getDeliveryCost(selectedShippingMethod);
      const totalAmount = subtotal + deliveryCost - discountAmount;

      // Calculate estimated delivery date based on shipping method
      const deliveryDays = Order.getDeliveryDays(selectedShippingMethod);
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + deliveryDays
      );

      // Create the order
      const order = new Order({
        customer: customerId,
        items: orderItems,
        subtotal,
        deliveryCost,
        shipping: {
          method: selectedShippingMethod,
          estimatedDeliveryDate,
        },
        discount: {
          code: appliedDiscountCode,
          amount: discountAmount,
          type: appliedDiscountCode ? "fixed" : "fixed",
        },
        totalAmount,
        deliveryAddress,
        billingAddress,
        payment: {
          method: paymentMethod || "cash_on_delivery",
          status: "pending",
        },
        notes,
      });

      // Calculate totals
      order.calculateTotals();

      // Save the order
      await order.save({ session });

      // Create payment record for COD orders
      if (paymentMethod === "cash_on_delivery" || !paymentMethod) {
        const payment = new Payment({
          order: order._id,
          customer: customerId,
          expectedAmount: totalAmount,
          method: "cash_on_delivery",
          status: "pending",
        });
        await payment.save({ session });

        // Link payment record to order
        order.paymentRecord = payment._id;
        await order.save({ session });
      }

      // Update product stock and create inventory movements
      for (const item of orderItems) {
        // Find the variant to get its ID
        const product = await Product.findById(item.product).session(session);
        const variant = product.variants.find(
          (v) => v.sku === item.variant.sku
        );

        if (variant) {
          const previousStock = variant.stockQuantity;

          // Double-check stock availability before processing
          if (previousStock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name} - ${item.variant.size} ${item.variant.color.name}. Available: ${previousStock}, Requested: ${item.quantity}`
            );
          }

          const newStock = Math.max(0, previousStock - item.quantity);

          // Create stock movement record
          const stockMovement = new StockMovement({
            product: item.product,
            variant: variant._id,
            movementType: "out",
            quantity: -item.quantity,
            previousStock,
            newStock,
            reason: `Order placed - Order #${order.orderNumber}`,
            reference: {
              type: "order",
              id: order._id,
              number: order.orderNumber,
            },
            performedBy: customerId,
          });

          await stockMovement.save({ session });

          // Update variant stock with atomic operation
          const updateResult = await Product.updateOne(
            {
              _id: item.product,
              "variants.sku": item.variant.sku,
              "variants.stockQuantity": { $gte: item.quantity }, // Ensure sufficient stock
            },
            {
              $inc: { "variants.$.stockQuantity": -item.quantity },
            },
            { session }
          );

          // Check if the update was successful
          if (updateResult.modifiedCount === 0) {
            throw new Error(
              `Stock update failed for ${product.name} - ${item.variant.size} ${item.variant.color.name}. Please try again.`
            );
          }

          // Update inventory record
          await Inventory.updateFromMovement(stockMovement);
        }
      }

      // Increment discount usage if used
      if (appliedDiscountCode) {
        const discount = await Discount.findOne({
          code: appliedDiscountCode,
        }).session(session);
        if (discount) {
          await discount.incrementUsage(req.user.id);
        }
      }

      // Populate the order for response
      await order.populate([
        { path: "customer", select: "firstName lastName email phone" },
        { path: "items.product", select: "name brand images" },
      ]);

      // Return the order data from the transaction
      return order;
    });

    // If we reach here, the transaction was successful

    // Send order confirmation email asynchronously (don't wait for it)
    sendOrderConfirmationEmail(order).catch((err) => {
      console.error("Error sending order confirmation email:", err);
      // Don't fail the order creation if email fails
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Determine appropriate status code based on error type
    let statusCode = 500;
    let message = "Failed to create order";

    if (
      error.message.includes("Order items are required") ||
      error.message.includes("Delivery and billing addresses are required") ||
      error.message.includes("Invalid or expired discount code")
    ) {
      statusCode = 400;
      message = error.message;
    } else if (
      error.message.includes("not found") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("Stock update failed")
    ) {
      statusCode = 400;
      message = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      customer,
      deliveryPerson,
      dateFrom,
      dateTo,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      status,
      paymentStatus,
      customer,
      deliveryPerson,
      dateFrom,
      dateTo,
      search,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await Order.getFilteredOrders(filters);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get orders for a specific customer
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      customer: customerId,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await Order.getFilteredOrders(filters);

    res.status(200).json({
      success: true,
      message: "Customer orders retrieved successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
      error: error.message,
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name brand images")
      .populate("statusHistory.changedBy", "firstName lastName");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user can access this order
    if (userRole !== "admin" && order.customer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own orders.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "assigned",
      "out_for_delivery",
      "delivered",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Handle stock restoration if order is being cancelled
    if (status === "cancelled" && !["cancelled"].includes(order.status)) {
      // Restore product stock and create inventory movements
      for (const item of order.items) {
        // Find the variant to get its ID
        const product = await Product.findById(item.product);
        const variant = product.variants.find(
          (v) => v.sku === item.variant.sku
        );

        if (variant) {
          const previousStock = variant.stockQuantity;
          const newStock = previousStock + item.quantity;

          // Create stock movement record
          const stockMovement = new StockMovement({
            product: item.product,
            variant: variant._id,
            movementType: "restoration",
            quantity: item.quantity,
            previousStock,
            newStock,
            reason: `Order cancelled by admin - Order #${order.orderNumber}`,
            reference: {
              type: "order",
              id: order._id,
              number: order.orderNumber,
            },
            performedBy: adminId,
          });

          await stockMovement.save();

          // Update variant stock
          await Product.updateOne(
            {
              _id: item.product,
              "variants.sku": item.variant.sku,
            },
            {
              $inc: { "variants.$.stockQuantity": item.quantity },
            }
          );

          // Update inventory record
          await Inventory.updateFromMovement(stockMovement);
        }
      }
    }

    // Update order status
    order.updateStatus(status, adminId, notes);
    await order.save();

    // Populate the updated order
    await order.populate([
      { path: "customer", select: "firstName lastName email phone" },
      { path: "deliveryPerson", select: "firstName lastName email phone" },
      { path: "items.product", select: "name brand images" },
      { path: "statusHistory.changedBy", select: "firstName lastName" },
    ]);

    // Send status update email asynchronously for certain statuses
    if (
      ["confirmed", "shipped", "out_for_delivery", "delivered"].includes(status)
    ) {
      sendOrderStatusUpdateEmail(order, status).catch((err) => {
        console.error("Error sending status update email:", err);
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Update order shipping details (Admin only)
export const updateOrderShipping = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, deliveryPartner, estimatedDeliveryDate } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update shipping details
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (deliveryPartner) order.shipping.deliveryPartner = deliveryPartner;
    if (estimatedDeliveryDate)
      order.shipping.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

    // Automatically update order status to 'shipped' when shipping details are added
    let statusChanged = false;
    if (order.status === "confirmed" || order.status === "pending") {
      order.status = "shipped";
      statusChanged = true;

      // Add to status history
      order.statusHistory.push({
        status: "shipped",
        changedAt: new Date(),
        changedBy: req.user.id,
        notes: `Order marked as shipped - Tracking: ${
          trackingNumber || "N/A"
        }, Partner: ${deliveryPartner || "N/A"}`,
      });
    }

    await order.save();

    // Populate the updated order
    await order.populate([
      { path: "customer", select: "firstName lastName email phone" },
      { path: "items.product", select: "name brand images" },
    ]);

    // Send shipped notification email if status was changed
    if (statusChanged) {
      sendOrderStatusUpdateEmail(order, "shipped").catch((err) => {
        console.error("Error sending shipped notification email:", err);
      });
    }

    res.status(200).json({
      success: true,
      message: "Order shipping details updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order shipping:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order shipping details",
      error: error.message,
    });
  }
};

// Update order payment status (Admin only)
export const updateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, transactionId } = req.body;

    const validPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
      "partially_refunded",
    ];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment details
    order.payment.status = paymentStatus;
    if (transactionId) order.payment.transactionId = transactionId;
    if (paymentStatus === "paid") {
      order.payment.paidAt = new Date();
    }

    await order.save();

    // Populate the updated order
    await order.populate([
      { path: "customer", select: "firstName lastName email phone" },
      { path: "items.product", select: "name brand images" },
    ]);

    res.status(200).json({
      success: true,
      message: "Order payment status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order payment status",
      error: error.message,
    });
  }
};

// Update delivery address (Customer only, before processing)
export const updateDeliveryAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAddress } = req.body;
    const customerId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own orders.",
      });
    }

    // Check if order is still in pending or confirmed status
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update delivery address. Order is already being processed.",
      });
    }

    // Update delivery address
    order.deliveryAddress = deliveryAddress;
    await order.save();

    // Populate the updated order
    await order.populate([
      { path: "customer", select: "firstName lastName email phone" },
      { path: "items.product", select: "name brand images" },
    ]);

    res.status(200).json({
      success: true,
      message: "Delivery address updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating delivery address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update delivery address",
      error: error.message,
    });
  }
};

// Cancel order (Customer only, before processing)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const customerId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only cancel your own orders.",
      });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order. Order is already being processed.",
      });
    }

    // Restore product stock and create inventory movements
    for (const item of order.items) {
      // Find the variant to get its ID
      const product = await Product.findById(item.product);
      const variant = product.variants.find((v) => v.sku === item.variant.sku);

      if (variant) {
        const previousStock = variant.stockQuantity;
        const newStock = previousStock + item.quantity;

        // Create stock movement record
        const stockMovement = new StockMovement({
          product: item.product,
          variant: variant._id,
          movementType: "restoration",
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: `Order cancelled - Order #${order.orderNumber}`,
          reference: {
            type: "order",
            id: order._id,
            number: order.orderNumber,
          },
          performedBy: customerId,
        });

        await stockMovement.save();

        // Update variant stock
        await Product.updateOne(
          {
            _id: item.product,
            "variants.sku": item.variant.sku,
          },
          {
            $inc: { "variants.$.stockQuantity": item.quantity },
          }
        );

        // Update inventory record
        await Inventory.updateFromMovement(stockMovement);
      }
    }

    // Update order status
    order.updateStatus(
      "cancelled",
      customerId,
      reason || "Order cancelled by customer"
    );
    await order.save();

    // Populate the updated order
    await order.populate([
      { path: "customer", select: "firstName lastName email phone" },
      { path: "items.product", select: "name brand images" },
    ]);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const stats = await Order.getOrderStats(dateFrom, dateTo);

    res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};

// Validate discount code
export const validateDiscountCode = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const customerId = req.user.id;

    console.log(
      `Validating discount code: ${code}, orderAmount: ${orderAmount}, customerId: ${customerId}`
    );

    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: "Discount code and order amount are required",
      });
    }

    const discount = await Discount.findValidDiscount(
      code,
      customerId,
      orderAmount
    );

    if (!discount) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired discount code",
      });
    }

    const discountAmount = discount.calculateDiscountAmount(orderAmount);

    res.status(200).json({
      success: true,
      message: "Discount code is valid",
      data: {
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount,
        displayValue: discount.displayValue,
      },
    });
  } catch (error) {
    console.error("Error validating discount code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate discount code",
      error: error.message,
    });
  }
};

// Update order (Admin only) - Generic update for multiple fields
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check permissions - only admin or order owner can update
    if (userRole !== "admin" && order.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own orders.",
      });
    }

    // Validate status if being updated
    if (updateData.status) {
      const validStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "assigned",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "customer", select: "firstName lastName email phone" },
      { path: "items.product", select: "name brand images" },
    ]);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};

// Rate delivery person (Customer only)
export const rateDeliveryPerson = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, feedback } = req.body;
    const customerId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Find the order
    const order = await Order.findById(orderId).populate(
      "deliveryPerson",
      "firstName lastName email deliveryStats"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to the customer
    if (order.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only rate delivery for your own orders.",
      });
    }

    // Check if order has been delivered
    if (order.status !== "delivered" && order.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "You can only rate delivery after the order has been delivered",
      });
    }

    // Check if delivery person was assigned
    if (!order.deliveryPerson) {
      return res.status(400).json({
        success: false,
        message: "No delivery person was assigned to this order",
      });
    }

    // Check if already rated
    if (order.deliveryRating && order.deliveryRating.rating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated the delivery for this order",
      });
    }

    // Add rating to order
    order.deliveryRating = {
      rating,
      feedback: feedback || "",
      ratedAt: new Date(),
    };

    await order.save();

    // Update delivery person's stats
    const deliveryPerson = await User.findById(order.deliveryPerson);

    if (deliveryPerson && deliveryPerson.role === "deliveryperson") {
      const currentTotalRatings =
        deliveryPerson.deliveryStats.totalRatings || 0;
      const currentAverageRating =
        deliveryPerson.deliveryStats.averageRating || 0;

      // Calculate new average rating
      const newTotalRatings = currentTotalRatings + 1;
      const newAverageRating =
        (currentAverageRating * currentTotalRatings + rating) / newTotalRatings;

      deliveryPerson.deliveryStats.totalRatings = newTotalRatings;
      deliveryPerson.deliveryStats.averageRating =
        Math.round(newAverageRating * 10) / 10; // Round to 1 decimal

      await deliveryPerson.save();
    }

    // Populate the order for response
    await order.populate([
      { path: "customer", select: "firstName lastName email" },
      {
        path: "deliveryPerson",
        select: "firstName lastName email deliveryStats",
      },
      { path: "items.product", select: "name brand images" },
    ]);

    res.status(200).json({
      success: true,
      message: "Delivery rating submitted successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveryRating: order.deliveryRating,
        deliveryPerson: {
          id: order.deliveryPerson._id,
          name: `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}`,
          averageRating: order.deliveryPerson.deliveryStats.averageRating,
          totalRatings: order.deliveryPerson.deliveryStats.totalRatings,
        },
      },
    });
  } catch (error) {
    console.error("Error rating delivery person:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit delivery rating",
      error: error.message,
    });
  }
};

// Get delivery person ratings and feedback
export const getDeliveryPersonRatings = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "ratedAt",
      sortOrder = "desc",
    } = req.query;

    // Validate delivery person
    const deliveryPerson = await User.findById(deliveryPersonId);

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: "Delivery person not found",
      });
    }

    if (deliveryPerson.role !== "deliveryperson") {
      return res.status(400).json({
        success: false,
        message: "User is not a delivery person",
      });
    }

    // Check authorization: delivery person can only view their own ratings
    if (
      req.user.role === "deliveryperson" &&
      req.user.id !== deliveryPersonId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own ratings.",
      });
    }

    // Get ratings from orders
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[`deliveryRating.${sortBy}`] = sortOrder === "desc" ? -1 : 1;

    const ratings = await Order.find({
      deliveryPerson: deliveryPersonId,
      "deliveryRating.rating": { $exists: true, $ne: null },
    })
      .populate("customer", "firstName lastName avatar")
      .select("orderNumber deliveryRating status createdAt")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalRatings = await Order.countDocuments({
      deliveryPerson: deliveryPersonId,
      "deliveryRating.rating": { $exists: true, $ne: null },
    });

    // Calculate rating distribution
    const ratingDistribution = await Order.aggregate([
      {
        $match: {
          deliveryPerson: new mongoose.Types.ObjectId(deliveryPersonId),
          "deliveryRating.rating": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$deliveryRating.rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    // Format rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      message: "Delivery person ratings retrieved successfully",
      data: {
        deliveryPerson: {
          id: deliveryPerson._id,
          name: `${deliveryPerson.firstName} ${deliveryPerson.lastName}`,
          averageRating: deliveryPerson.deliveryStats.averageRating || 0,
          totalRatings: deliveryPerson.deliveryStats.totalRatings || 0,
          totalDeliveries: deliveryPerson.deliveryStats.totalDeliveries || 0,
        },
        ratingDistribution: distribution,
        ratings: ratings.map((order) => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          customer: {
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            avatar: order.customer.avatar,
          },
          rating: order.deliveryRating.rating,
          feedback: order.deliveryRating.feedback,
          ratedAt: order.deliveryRating.ratedAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRatings / limit),
          totalRatings,
          hasNextPage: page < Math.ceil(totalRatings / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching delivery person ratings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery person ratings",
      error: error.message,
    });
  }
};

// Get all delivery persons with their ratings (Admin only)
export const getAllDeliveryPersonsWithRatings = async (req, res) => {
  try {
    const { sortBy = "averageRating", sortOrder = "desc" } = req.query;

    const sortOptions = {};
    sortOptions[`deliveryStats.${sortBy}`] = sortOrder === "desc" ? -1 : 1;

    const deliveryPersons = await User.find({
      role: "deliveryperson",
      isActive: true,
    })
      .select("firstName lastName email phone avatar deliveryStats")
      .sort(sortOptions)
      .lean();

    // Get additional stats for each delivery person
    const deliveryPersonsWithStats = await Promise.all(
      deliveryPersons.map(async (person) => {
        const totalOrders = await Order.countDocuments({
          deliveryPerson: person._id,
        });

        const deliveredOrders = await Order.countDocuments({
          deliveryPerson: person._id,
          status: { $in: ["delivered", "completed"] },
        });

        const pendingOrders = await Order.countDocuments({
          deliveryPerson: person._id,
          status: { $in: ["assigned", "out_for_delivery"] },
        });

        return {
          id: person._id,
          name: `${person.firstName} ${person.lastName}`,
          email: person.email,
          phone: person.phone,
          avatar: person.avatar,
          stats: {
            averageRating: person.deliveryStats?.averageRating || 0,
            totalRatings: person.deliveryStats?.totalRatings || 0,
            totalDeliveries: person.deliveryStats?.totalDeliveries || 0,
            totalOrders,
            deliveredOrders,
            pendingOrders,
            deliveryRate:
              totalOrders > 0
                ? Math.round((deliveredOrders / totalOrders) * 100 * 10) / 10
                : 0,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Delivery persons with ratings retrieved successfully",
      data: {
        deliveryPersons: deliveryPersonsWithStats,
        total: deliveryPersonsWithStats.length,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery persons with ratings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery persons with ratings",
      error: error.message,
    });
  }
};
