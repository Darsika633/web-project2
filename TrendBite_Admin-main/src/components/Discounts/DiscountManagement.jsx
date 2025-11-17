import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Percent,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { discountsAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import AddDiscountModal from './AddDiscountModal';
import EditDiscountModal from './EditDiscountModal';
import DiscountViewModal from './DiscountViewModal';
import toast from 'react-hot-toast';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDiscounts, setTotalDiscounts] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      };

      const response = await discountsAPI.getAll(params);
      
      // Handle different response structures
      if (response.data && response.data.data) {
        // Check if data is an array (direct discounts) or object with discounts property
        if (Array.isArray(response.data.data)) {
          // Direct array of discounts
          setDiscounts(response.data.data || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalDiscounts(response.data.pagination?.totalDiscounts || 0);
        } else {
          // Object with discounts property
          const { discounts: discountsData, pagination } = response.data.data;
          setDiscounts(discountsData || []);
          setTotalPages(pagination?.totalPages || 1);
          setTotalDiscounts(pagination?.totalDiscounts || 0);
        }
      } else {
        // If response structure is different, use mock data
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching discounts from API, using mock data:', error);
      // Use mock data when API fails
      try {
        const params = {
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
          ...(typeFilter !== 'all' && { type: typeFilter }),
        };
        
        const mockResponse = await mockApi.getDiscounts(params);
        const { discounts: discountsData, pagination } = mockResponse.data.data;
        
        setDiscounts(discountsData || []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalDiscounts(pagination?.totalDiscounts || 0);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        toast.error('Failed to fetch discounts');
        // Set default values to prevent further errors
        setDiscounts([]);
        setTotalPages(1);
        setTotalDiscounts(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = (discountId) => {
    const discount = discounts.find(d => d._id === discountId);
    setDiscountToDelete(discount);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return;
    
    try {
      await discountsAPI.delete(discountToDelete._id);
      toast.success('Discount deleted successfully');
      fetchDiscounts();
    } catch (error) {
      console.error('API delete failed, trying mock:', error);
      try {
        await mockApi.deleteDiscount(discountToDelete._id);
        toast.success('Discount deleted successfully');
        fetchDiscounts();
      } catch (mockError) {
        console.error('Mock delete also failed:', mockError);
        toast.error('Failed to delete discount');
      }
    } finally {
      setShowDeleteConfirm(false);
      setDiscountToDelete(null);
    }
  };

  const handleToggleStatus = async (discountId) => {
    try {
      await discountsAPI.toggleStatus(discountId);
      toast.success('Discount status updated successfully');
      fetchDiscounts();
    } catch (error) {
      console.error('API toggle failed, trying mock:', error);
      try {
        await mockApi.toggleDiscountStatus(discountId);
        toast.success('Discount status updated successfully');
        fetchDiscounts();
      } catch (mockError) {
        console.error('Mock toggle also failed:', mockError);
        toast.error('Failed to update discount status');
      }
    }
  };

  const handleDiscountCreated = () => {
    fetchDiscounts(); // Refresh the discounts list
  };

  const handleDiscountUpdated = () => {
    fetchDiscounts(); // Refresh the discounts list
  };

  const handleViewDiscount = (discount) => {
    setSelectedDiscount(discount);
    setShowViewModal(true);
  };

  const handleEditDiscount = (discount) => {
    setSelectedDiscount(discount);
    setShowEditModal(true);
  };

  const getStatusBadge = (isActive) => {
    const statusConfig = {
      true: { color: 'bg-success-100 text-success-800', label: 'Active' },
      false: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    };
    
    const config = statusConfig[isActive] || statusConfig.false;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      percentage: { color: 'bg-blue-100 text-blue-800', label: 'Percentage' },
      fixed: { color: 'bg-green-100 text-green-800', label: 'Fixed Amount' },
    };
    
    const config = typeConfig[type] || typeConfig.percentage;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const isUpcoming = (validFrom) => {
    return new Date(validFrom) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
          <p className="text-gray-600 mt-1">Manage promotional discounts and offers</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-md w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Discount
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content mt-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Discounts
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code, name, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Discounts List */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="p-6">
                {discounts.length === 0 ? (
                  <div className="text-center py-12">
                    <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first discount.</p>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="btn btn-primary btn-md w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Discount
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {discounts.map((discount) => (
                      <div key={discount._id} className="border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* Discount Icon */}
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                <Percent className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>

                            {/* Discount Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {discount.code}
                                </h3>
                                {getStatusBadge(discount.isActive)}
                                {getTypeBadge(discount.type)}
                                {isExpired(discount.validUntil) && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Expired
                                  </span>
                                )}
                                {isUpcoming(discount.validFrom) && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Upcoming
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 font-medium truncate">
                                {discount.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {discount.description || 'No description'}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-400 flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {discount.usedCount || 0}/{discount.usageLimit || '∞'} used
                                </span>
                                <span className="text-xs text-gray-400 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Until {formatDate(discount.validUntil)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleToggleStatus(discount._id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title={discount.isActive ? "Deactivate discount" : "Activate discount"}
                            >
                              {discount.isActive ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleViewDiscount(discount)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="View discount"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditDiscount(discount)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit discount"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDiscount(discount._id)}
                              className="p-2 text-gray-400 hover:text-danger-600 hover:bg-red-50 rounded"
                              title="Delete discount"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {discounts.length > 0 && (
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 20, totalDiscounts)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{totalDiscounts}</span>
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
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Discount Modal */}
      <AddDiscountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleDiscountCreated}
      />

      {/* Edit Discount Modal */}
      <EditDiscountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDiscount(null);
        }}
        onSuccess={handleDiscountUpdated}
        discount={selectedDiscount}
      />

      {/* Discount View Modal */}
      <DiscountViewModal
        discount={selectedDiscount}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDiscount(null);
        }}
        onDelete={handleDeleteDiscount}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && discountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col p-6">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Discount
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{discountToDelete.code}</strong>? This action cannot be undone and will permanently remove the discount.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDiscountToDelete(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDiscount}
                className="btn btn-danger btn-sm"
              >
                Delete Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountManagement;
