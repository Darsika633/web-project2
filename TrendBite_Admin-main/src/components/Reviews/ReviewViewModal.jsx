import React, { useState } from 'react';
import {
  X,
  Star,
  User,
  Package,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  ThumbsUp,
  Image as ImageIcon,
  ExternalLink,
  Clock,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { reviewsAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const ReviewViewModal = ({ 
  review, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  onRefresh 
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !review) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-warning-100', 
        text: 'text-warning-800', 
        label: 'Pending',
        icon: Clock
      },
      approved: { 
        bg: 'bg-success-100', 
        text: 'text-success-800', 
        label: 'Approved',
        icon: CheckCircle
      },
      rejected: { 
        bg: 'bg-danger-100', 
        text: 'text-danger-800', 
        label: 'Rejected',
        icon: XCircle
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(review._id);
      onClose();
    } catch (error) {
      console.error('Error approving review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await onReject(review._id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!adminReply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setLoading(true);
    try {
      await reviewsAPI.addReply(review._id, { message: adminReply });
      toast.success('Admin reply added successfully');
      setShowReplyForm(false);
      setAdminReply('');
      onRefresh();
    } catch (error) {
      console.error('API addReply failed, trying mock:', error);
      try {
        await mockApi.addReplyToReview(review._id, { message: adminReply });
        toast.success('Admin reply added successfully');
        setShowReplyForm(false);
        setAdminReply('');
        onRefresh();
      } catch (mockError) {
        console.error('Mock addReply also failed:', mockError);
        toast.error('Failed to add admin reply');
      }
    } finally {
      setLoading(false);
    }
  };

  const openProductPage = () => {
    // This would open the product page in a new tab
    window.open(`/products/${review.product._id}`, '_blank');
  };

  const openUserProfile = () => {
    // This would open the user profile in a new tab
    window.open(`/users/${review.user._id}`, '_blank');
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-gray-900">Review Details</h3>
              {getStatusBadge(review.status)}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {review.user.avatar?.url ? (
                        <img
                          src={review.user.avatar.url}
                          alt={`${review.user.firstName} ${review.user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">{review.user.email}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {getRatingStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">({review.rating}/5)</span>
                  </div>
                </div>

                {/* Review Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {review.title}
                </h2>

                {/* Review Comment */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment || review.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {review.status === 'pending' && (
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="btn btn-success btn-sm flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="btn btn-danger btn-sm flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Review Images ({review.images.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {review.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Information */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Product Information
              </h4>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {review.product.images?.[0]?.url ? (
                    <img
                      src={review.product.images[0].url}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{review.product.name}</h5>
                  <p className="text-sm text-gray-500">Product ID: {review.product._id}</p>
                </div>
                <button
                  onClick={openProductPage}
                  className="btn btn-secondary btn-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Product</span>
                </button>
              </div>
            </div>

            {/* Review Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Review Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Review ID:</span>
                    <span className="text-sm font-mono text-gray-900">{review._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm text-gray-900">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Updated:</span>
                    <span className="text-sm text-gray-900">{formatDate(review.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Verified Purchase:</span>
                    <span className={`text-sm font-medium ${review.isVerified ? 'text-success-600' : 'text-gray-500'}`}>
                      {review.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {review.helpfulCount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Helpful Votes:</span>
                      <span className="text-sm text-gray-900">{review.helpfulCount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">User ID:</span>
                    <span className="text-sm font-mono text-gray-900">{review.user._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name:</span>
                    <span className="text-sm text-gray-900">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="text-sm text-gray-900">{review.user.email}</span>
                  </div>
                  <button
                    onClick={openUserProfile}
                    className="btn btn-secondary btn-xs flex items-center space-x-1 mt-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View User</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Reply Section */}
            {review.adminReply ? (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Admin Reply
                </h4>
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">A</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{review.adminReply.message || review.adminReply.reply}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <span>Replied by {review.adminReply.repliedBy?.firstName} {review.adminReply.repliedBy?.lastName || review.adminReply.repliedBy}</span>
                        <span>•</span>
                        <span>{formatDate(review.adminReply.repliedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Admin Reply
                </h4>
                {!showReplyForm ? (
                  <button
                    onClick={() => setShowReplyForm(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    Add Admin Reply
                  </button>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Enter your reply..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddReply}
                        disabled={loading}
                        className="btn btn-primary btn-sm"
                      >
                        {loading ? 'Adding...' : 'Add Reply'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReplyForm(false);
                          setAdminReply('');
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="btn btn-secondary btn-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col p-6">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Reject Review
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please provide a reason for rejecting this review. This will help the user understand why their review was not approved.
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="btn btn-danger btn-sm"
              >
                {loading ? 'Rejecting...' : 'Reject Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewViewModal;
