import Discount from "../models/Discount.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { sendDiscountNotificationToAllCustomers } from "../utils/emailService.js";

// Create a new discount code (Admin only)
export const createDiscount = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      type,
      value,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      applicableProducts,
      applicableCategories,
      applicableUsers,
      isPublic,
    } = req.body;

    const createdBy = req.user.id;

    // Check if discount code already exists
    const existingDiscount = await Discount.findOne({
      code: code.toUpperCase(),
    });
    if (existingDiscount) {
      return res.status(400).json({
        success: false,
        message: "Discount code already exists",
      });
    }

    // Validate dates
    const validFromDate = new Date(validFrom);
    const validUntilDate = new Date(validUntil);

    if (validFromDate >= validUntilDate) {
      return res.status(400).json({
        success: false,
        message: "Valid until date must be after valid from date",
      });
    }

    // Validate percentage discount
    if (type === "percentage" && value > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const discount = new Discount({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount,
      usageLimit,
      validFrom: validFromDate,
      validUntil: validUntilDate,
      applicableProducts,
      applicableCategories,
      applicableUsers,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy,
    });

    await discount.save();

    // Populate the discount for response
    await discount.populate([
      { path: "applicableProducts", select: "name" },
      { path: "applicableCategories", select: "name" },
      { path: "applicableUsers", select: "firstName lastName email" },
      { path: "createdBy", select: "firstName lastName" },
      { path: "usedBy.user", select: "firstName lastName email" },
    ]);

    // Send discount notification emails to all active customers
    // This runs asynchronously in the background
    sendDiscountNotificationToAllCustomers(discount)
      .then((emailResult) => {
        console.log(
          `✅ Discount notification email campaign completed:`,
          emailResult
        );
      })
      .catch((error) => {
        console.error(
          `❌ Error in discount notification email campaign:`,
          error
        );
      });

    res.status(201).json({
      success: true,
      message:
        "Discount code created successfully. Notification emails are being sent to all active customers.",
      data: discount,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discount code",
      error: error.message,
    });
  }
};

// Get all discount codes (Admin only)
export const getAllDiscounts = async (req, res) => {
  try {
    const {
      isActive,
      isPublic,
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Apply filters
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === "true";
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { code: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const discounts = await Discount.find(query)
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name")
      .populate("applicableUsers", "firstName lastName email")
      .populate("createdBy", "firstName lastName")
      .populate("usedBy.user", "firstName lastName email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Discount.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Discount codes retrieved successfully",
      data: discounts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDiscounts: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount codes",
      error: error.message,
    });
  }
};

// Get active discount codes (Public)
export const getActiveDiscounts = async (req, res) => {
  try {
    const userId = req.user?.id;
    const discounts = await Discount.getActiveDiscounts(userId);

    res.status(200).json({
      success: true,
      message: "Active discount codes retrieved successfully",
      data: discounts,
    });
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active discount codes",
      error: error.message,
    });
  }
};

// Get discount by ID (Admin only)
export const getDiscountById = async (req, res) => {
  try {
    const { discountId } = req.params;

    const discount = await Discount.findById(discountId)
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name")
      .populate("applicableUsers", "firstName lastName email")
      .populate("createdBy", "firstName lastName")
      .populate("usedBy.user", "firstName lastName email");

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Discount code retrieved successfully",
      data: discount,
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount code",
      error: error.message,
    });
  }
};

// Update discount code (Admin only)
export const updateDiscount = async (req, res) => {
  try {
    const { discountId } = req.params;
    const updateData = req.body;

    const discount = await Discount.findById(discountId);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    // Check if code is being updated and if it already exists
    if (updateData.code && updateData.code !== discount.code) {
      const existingDiscount = await Discount.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: discountId },
      });

      if (existingDiscount) {
        return res.status(400).json({
          success: false,
          message: "Discount code already exists",
        });
      }

      updateData.code = updateData.code.toUpperCase();
    }

    // Validate dates if being updated
    if (updateData.validFrom || updateData.validUntil) {
      const validFromDate = updateData.validFrom
        ? new Date(updateData.validFrom)
        : discount.validFrom;
      const validUntilDate = updateData.validUntil
        ? new Date(updateData.validUntil)
        : discount.validUntil;

      if (validFromDate >= validUntilDate) {
        return res.status(400).json({
          success: false,
          message: "Valid until date must be after valid from date",
        });
      }
    }

    // Validate percentage discount
    if (updateData.type === "percentage" && updateData.value > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const updatedDiscount = await Discount.findByIdAndUpdate(
      discountId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "applicableProducts", select: "name" },
      { path: "applicableCategories", select: "name" },
      { path: "applicableUsers", select: "firstName lastName email" },
      { path: "createdBy", select: "firstName lastName" },
      { path: "usedBy.user", select: "firstName lastName email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Discount code updated successfully",
      data: updatedDiscount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discount code",
      error: error.message,
    });
  }
};

// Delete discount code (Admin only)
export const deleteDiscount = async (req, res) => {
  try {
    const { discountId } = req.params;

    const discount = await Discount.findById(discountId);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    await Discount.findByIdAndDelete(discountId);

    res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete discount code",
      error: error.message,
    });
  }
};

// Toggle discount status (Admin only)
export const toggleDiscountStatus = async (req, res) => {
  try {
    const { discountId } = req.params;

    const discount = await Discount.findById(discountId);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    res.status(200).json({
      success: true,
      message: `Discount code ${
        discount.isActive ? "activated" : "deactivated"
      } successfully`,
      data: discount,
    });
  } catch (error) {
    console.error("Error toggling discount status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle discount status",
      error: error.message,
    });
  }
};

// Get discount statistics (Admin only)
export const getDiscountStats = async (req, res) => {
  try {
    const stats = await Discount.aggregate([
      {
        $group: {
          _id: null,
          totalDiscounts: { $sum: 1 },
          activeDiscounts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          publicDiscounts: {
            $sum: { $cond: [{ $eq: ["$isPublic", true] }, 1, 0] },
          },
          totalUsage: { $sum: "$usedCount" },
          percentageDiscounts: {
            $sum: { $cond: [{ $eq: ["$type", "percentage"] }, 1, 0] },
          },
          fixedDiscounts: {
            $sum: { $cond: [{ $eq: ["$type", "fixed"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalDiscounts: 0,
      activeDiscounts: 0,
      publicDiscounts: 0,
      totalUsage: 0,
      percentageDiscounts: 0,
      fixedDiscounts: 0,
    };

    res.status(200).json({
      success: true,
      message: "Discount statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching discount statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount statistics",
      error: error.message,
    });
  }
};
