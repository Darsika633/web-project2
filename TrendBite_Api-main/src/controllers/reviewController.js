import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, description } = req.body;
    const userId = req.user.id;

    // Check if user can review this product
    const canReview = await Review.canUserReview(userId, productId);
    if (!canReview.canReview) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create review
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      title,
      description
    });

    await review.save();

    // Populate the review with user and product details
    await review.populate([
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'product', select: 'name brand images' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      data: review
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get all reviews with filters
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const {
      product,
      user,
      status,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      product,
      user,
      status,
      rating,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Review.getFilteredReviews(filters);

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const filters = {
      product: productId,
      status: 'approved', // Only show approved reviews
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Review.getFilteredReviews(filters);
    const stats = await Review.getProductReviewStats(productId);

    res.status(200).json({
      success: true,
      message: 'Product reviews retrieved successfully',
      data: {
        reviews: result.reviews,
        stats,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get a single review by ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'firstName lastName avatar')
      .populate('product', 'name brand images')
      .populate('adminReply.repliedBy', 'firstName lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review retrieved successfully',
      data: review
    });

  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, description } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Check if review is already approved (can't edit approved reviews)
    if (review.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved reviews'
      });
    }

    // Update review
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.description = description || review.description;
    review.status = 'pending'; // Reset to pending after edit

    await review.save();

    // Populate the updated review
    await review.populate([
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'product', select: 'name brand images' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Soft delete by setting isActive to false
    review.isActive = false;
    await review.save();

    // Update product rating if review was approved
    if (review.status === 'approved') {
      await updateProductRating(review.product);
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/my-reviews
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {
      user: userId,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Review.getFilteredReviews(filters);

    res.status(200).json({
      success: true,
      message: 'User reviews retrieved successfully',
      data: result.reviews,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Approve a review (Admin only)
// @route   PATCH /api/reviews/:id/approve
// @access  Private (Admin)
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Review is already approved'
      });
    }

    review.status = 'approved';
    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });

  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Reject a review (Admin only)
// @route   PATCH /api/reviews/:id/reject
// @access  Private (Admin)
export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Review is already rejected'
      });
    }

    review.status = 'rejected';
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: review
    });

  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Add admin reply to a review
// @route   POST /api/reviews/:id/reply
// @access  Private (Admin)
export const addAdminReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.addAdminReply(message, adminId);
    await review.save();

    // Populate the updated review
    await review.populate([
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'product', select: 'name brand images' },
      { path: 'adminReply.repliedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Admin reply added successfully',
      data: review
    });

  } catch (error) {
    console.error('Error adding admin reply:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get pending reviews for moderation (Admin only)
// @route   GET /api/reviews/admin/pending
// @access  Private (Admin)
export const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {
      status: 'pending',
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Review.getFilteredReviews(filters);

    res.status(200).json({
      success: true,
      message: 'Pending reviews retrieved successfully',
      data: result.reviews,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const stats = await Review.getProductReviewStats(productId);
    
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats.averageRating,
      reviewCount: stats.totalReviews
    });

    console.log(`Updated product ${productId} rating: ${stats.averageRating}, count: ${stats.totalReviews}`);
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

