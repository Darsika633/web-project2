import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Package,
  Calendar,
} from 'lucide-react';
import { reviewsAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';
import ReviewViewModal from './ReviewViewModal';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [currentPage, searchTerm, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await reviewsAPI.getAll(params);
      // Handle the actual API response structure: {success, message, data: [reviews], pagination}
      const reviewsData = response.data.data; // This is the array of reviews
      const paginationData = response.data.pagination; // This is the pagination object
      
      console.log('API Response:', response.data);
      console.log('Reviews Data:', reviewsData);
      console.log('Pagination Data:', paginationData);
      
      setReviews(reviewsData);
      setTotalPages(paginationData.totalPages);
      setTotalReviews(paginationData.totalReviews);
      
      // Update stats based on current page data
      const currentPageStats = calculateStats(reviewsData);
      // For now, we'll use the current page stats
      // In a real scenario, you'd need a separate stats endpoint or calculate from all data
      setStats(currentPageStats);
    } catch (error) {
      console.error('Error fetching reviews from API, using mock data:', error);
      // Use mock data when API fails
      try {
        const mockResponse = await mockApi.getReviews(params);
        const { reviews: reviewsData, pagination } = mockResponse.data.data;
        
        setReviews(reviewsData);
        setTotalPages(pagination.totalPages);
        setTotalReviews(pagination.totalReviews);
        
        // Update stats based on current page data
        const currentPageStats = calculateStats(reviewsData);
        setStats(currentPageStats);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        toast.error('Failed to fetch reviews');
        // Set empty state as fallback
        setReviews([]);
        setTotalPages(1);
        setTotalReviews(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const stats = {
      totalReviews: reviewsData.length,
      pendingReviews: reviewsData.filter(r => r.status === 'pending').length,
      approvedReviews: reviewsData.filter(r => r.status === 'approved').length,
      rejectedReviews: reviewsData.filter(r => r.status === 'rejected').length,
    };
    
    console.log('Stats Calculated from Reviews Data:', stats);
    return stats;
  };

  const fetchStats = async () => {
    try {
      // Fetch all reviews to get complete stats (this is necessary for accurate statistics)
      const response = await reviewsAPI.getAll({ limit: 1000 });
      const reviewsData = response.data.data; // This is the array of reviews
      
      const stats = calculateStats(reviewsData);
      setStats(stats);
    } catch (error) {
      console.error('Error fetching real stats, using mock data:', error);
      try {
        // Fallback to mock data if API fails
        const mockResponse = await mockApi.getReviews({ limit: 1000 });
        const mockReviews = mockResponse.data.data.reviews;
        
        const stats = calculateStats(mockReviews);
        setStats(stats);
      } catch (mockError) {
        console.error('Error with mock stats:', mockError);
        // Set default stats as fallback
        setStats({
          totalReviews: 0,
          pendingReviews: 0,
          approvedReviews: 0,
          rejectedReviews: 0,
        });
      }
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await reviewsAPI.approve(reviewId);
      toast.success('Review approved successfully');
      fetchReviews();
      // Stats will be updated when fetchReviews() is called
    } catch (error) {
      console.error('API approve failed, trying mock:', error);
      try {
        await mockApi.approveReview(reviewId);
        toast.success('Review approved successfully');
        fetchReviews();
        // Stats will be updated when fetchReviews() is called
      } catch (mockError) {
        console.error('Mock approve also failed:', mockError);
        toast.error('Failed to approve review');
      }
    }
  };

  const handleRejectReview = async (reviewId, reason) => {
    try {
      await reviewsAPI.reject(reviewId, reason);
      toast.success('Review rejected successfully');
      fetchReviews();
      // Stats will be updated when fetchReviews() is called
    } catch (error) {
      console.error('API reject failed, trying mock:', error);
      try {
        await mockApi.rejectReview(reviewId, reason);
        toast.success('Review rejected successfully');
        fetchReviews();
        // Stats will be updated when fetchReviews() is called
      } catch (mockError) {
        console.error('Mock reject also failed:', mockError);
        toast.error('Failed to reject review');
      }
    }
  };

  const handleViewReview = async (reviewId) => {
    try {
      const response = await reviewsAPI.getById(reviewId);
      console.log('View Review API Response:', response.data);
      // Handle different response structures
      const reviewData = response.data.data?.review || response.data.data || response.data;
      setSelectedReview(reviewData);
      setShowReviewModal(true);
    } catch (error) {
      console.error('API getById failed, trying mock:', error);
      try {
        const mockResponse = await mockApi.getReviewById(reviewId);
        console.log('View Review Mock Response:', mockResponse.data);
        const reviewData = mockResponse.data.data?.review || mockResponse.data.data || mockResponse.data;
        setSelectedReview(reviewData);
        setShowReviewModal(true);
      } catch (mockError) {
        console.error('Mock getById also failed:', mockError);
        toast.error('Failed to fetch review details');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-warning-100', text: 'text-warning-800', label: 'Pending' },
      approved: { bg: 'bg-success-100', text: 'text-success-800', label: 'Approved' },
      rejected: { bg: 'bg-danger-100', text: 'text-danger-800', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-1">Manage product reviews and customer feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingReviews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedReviews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejectedReviews || 0}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Review
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews && reviews.length > 0 ? reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {review.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {review.comment || review.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              {review.user.avatar?.url ? (
                                <img
                                  src={review.user.avatar.url}
                                  alt={`${review.user.firstName} ${review.user.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-primary-600" />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {review.user.firstName} {review.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{review.user.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mr-2">
                              {review.product?.images?.[0]?.url ? (
                                <img
                                  src={review.product?.images[0]?.url}
                                  alt={review.product?.name || 'Product'}
                                  className="w-8 h-8 object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div className="text-sm text-gray-900 truncate max-w-xs">
                              {review.product?.name || 'Product not found'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRatingStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-500">({review.rating})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(review.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                console.log('View Review button clicked for ID:', review._id);
                                handleViewReview(review._id);
                              }}
                              className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                              title="View Review"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {review.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveReview(review._id)}
                                  className="text-success-600 hover:text-success-900"
                                  title="Approve Review"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectReview(review._id, 'Inappropriate content')}
                                  className="text-danger-600 hover:text-danger-900"
                                  title="Reject Review"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No reviews found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
                    disabled={currentPage === (totalPages || 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, totalReviews || 0)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{totalReviews || 0}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
                        disabled={currentPage === (totalPages || 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review View Modal */}
      {showReviewModal && selectedReview && (
        <ReviewViewModal
          review={selectedReview}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReview(null);
          }}
          onApprove={handleApproveReview}
          onReject={handleRejectReview}
          onRefresh={fetchReviews}
        />
      )}
    </div>
  );
};

export default ReviewManagement;
