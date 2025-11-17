import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { categoriesAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import CategoryViewModal from './CategoryViewModal';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
      };

      const response = await categoriesAPI.getAll(params);
      
      
      // Handle different response structures
      if (response.data && response.data.data) {
        const { categories: categoriesData, pagination } = response.data.data;
        
        // Check if we have categories data
        if (categoriesData && Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          setTotalPages(pagination?.totalPages || 1);
          setTotalCategories(pagination?.totalCategories || categoriesData.length);
        } else {
          // If categories is not an array, use the data directly
          setCategories(response.data.data.categories || []);
          setTotalPages(1);
          setTotalCategories(response.data.data.categories?.length || 0);
        }
      } else if (response.data && response.data.categories) {
        // Handle direct categories response
        setCategories(response.data.categories || []);
        setTotalPages(1);
        setTotalCategories(response.data.categories?.length || 0);
      } else if (response.data && response.data.data && response.data.data.categories) {
        // Handle nested categories response
        setCategories(response.data.data.categories || []);
        setTotalPages(1);
        setTotalCategories(response.data.data.categories?.length || 0);
      } else {
        // If response structure is different, use mock data
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching categories from API, using mock data:', error);
      // Use mock data when API fails
      try {
        const params = {
          page: currentPage,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
        };
        
        const mockResponse = await mockApi.getCategories(params);
        const { categories: categoriesData, pagination } = mockResponse.data.data;
        
        setCategories(categoriesData || []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalCategories(pagination?.totalCategories || 0);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        toast.error('Failed to fetch categories');
        // Set default values to prevent further errors
        setCategories([]);
        setTotalPages(1);
        setTotalCategories(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoriesAPI.delete(categoryToDelete._id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('API delete failed, trying mock:', error);
      try {
        await mockApi.deleteCategory(categoryToDelete._id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (mockError) {
        console.error('Mock delete also failed:', mockError);
        toast.error('Failed to delete category');
      }
    } finally {
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };

  const handleCategoryCreated = () => {
    fetchCategories(); // Refresh the categories list
  };

  const handleCategoryUpdated = () => {
    fetchCategories(); // Refresh the categories list
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
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

  const renderCategoryTree = (categoryList, level = 0) => {
    return categoryList.map((category) => (
      <div key={category._id} className="border-b border-gray-200 last:border-b-0">
        <div 
          className={`flex items-center justify-between p-4 hover:bg-gray-50 ${level > 0 ? 'pl-8' : ''}`}
          style={{ paddingLeft: `${level * 2}rem` }}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            {category.children && category.children.length > 0 && (
              <button
                onClick={() => toggleCategoryExpansion(category._id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expandedCategories.has(category._id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
            
            {/* Category Image */}
            <div className="flex-shrink-0 ml-2">
              {category.image && category.image.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {category.name}
                </h3>
                {getStatusBadge(category.isActive)}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {category.description || 'No description'}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-400">
                  {category.productsCount || category.productCount || 0} products
                </span>
                {category.parent && (
                  <span className="text-xs text-gray-400">
                    Parent: {typeof category.parent === 'object' ? category.parent.name : 'Parent Category'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleViewCategory(category)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="View category"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleEditCategory(category)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDeleteCategory(category._id)}
              className="p-2 text-gray-400 hover:text-danger-600 hover:bg-red-50 rounded"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Render Children */}
        {category.children && category.children.length > 0 && expandedCategories.has(category._id) && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Organize your products with categories</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-md w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content mt-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Categories
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
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
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="p-6">
                {categories.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first category.</p>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="btn btn-primary btn-md w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {renderCategoryTree(categories)}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {categories.length > 0 && (
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
                        {Math.min(currentPage * 20, totalCategories)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{totalCategories}</span>
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleCategoryUpdated}
        category={selectedCategory}
      />

      {/* Category View Modal */}
      <CategoryViewModal
        category={selectedCategory}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCategory(null);
        }}
        onDelete={handleDeleteCategory}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Category
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{categoryToDelete.name}</strong>? This action cannot be undone and will permanently remove the category and all its data.
              </p>
              {categoryToDelete.children && categoryToDelete.children.length > 0 && (
                <p className="text-sm text-warning-600 mt-2">
                  ⚠️ This category has {categoryToDelete.children.length} subcategories that will also be affected.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="btn btn-danger btn-sm"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
