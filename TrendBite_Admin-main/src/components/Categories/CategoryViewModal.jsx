import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Image as ImageIcon, FolderOpen, Calendar, Package } from 'lucide-react';
import { categoriesAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const CategoryViewModal = ({ isOpen, onClose, category, onDelete }) => {
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      console.log('CategoryViewModal - Category data:', category); // Debug log
      fetchCategoryDetails();
      fetchCategoryProducts();
    }
  }, [isOpen, category]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getById(category._id);
      
      if (response.data && response.data.data && response.data.data.category) {
        console.log('CategoryViewModal - Fetched category details:', response.data.data.category); // Debug log
        setCategoryDetails(response.data.data.category);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching category details, using mock data:', error);
      try {
        const mockResponse = await mockApi.getCategoryById(category._id);
        setCategoryDetails(mockResponse.data.data.category);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        setCategoryDetails(category); // Use the passed category as fallback
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await categoriesAPI.getById(category._id, { 
        params: { includeProducts: true, limit: 10 } 
      });
      
      if (response.data && response.data.data && response.data.data.products) {
        setProducts(response.data.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching category products, using mock data:', error);
      try {
        const mockResponse = await mockApi.getCategoryProducts(category._id, { limit: 10 });
        setProducts(mockResponse.data.data.products || []);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        setProducts([]);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(category._id);
    }
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!isOpen || !category) return null;

  const displayCategory = categoryDetails || category;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {displayCategory.image && displayCategory.image.url ? (
              <img
                src={displayCategory.image.url}
                alt={displayCategory.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{displayCategory.name}</h2>
              <p className="text-sm text-gray-500">Category Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{displayCategory.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {displayCategory.description || 'No description provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(displayCategory.isActive)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <p className="mt-1 text-sm text-gray-900">{displayCategory.sortOrder ?? 0}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <p className="mt-1 text-sm text-gray-900">{displayCategory.level ?? 0}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Path</label>
                    <p className="mt-1 text-sm text-gray-900">{displayCategory.path || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {displayCategory.parent ? 
                        (typeof displayCategory.parent === 'object' ? displayCategory.parent.name : 'Parent Category') 
                        : 'Root Category'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Total Products</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {displayCategory.productsCount || displayCategory.productCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Subcategories</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {displayCategory.children ? displayCategory.children.length : 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatDate(displayCategory.createdAt)}
                    </span>
                  </div>

                  {displayCategory.updatedAt && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Last Updated</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {formatDate(displayCategory.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Information */}
            {(displayCategory.seoTitle || displayCategory.seoDescription || displayCategory.seoKeywords) && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">SEO Information</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {displayCategory.seoTitle || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {displayCategory.seoDescription || 'Not set'}
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">SEO Keywords</label>
                    <div className="mt-1">
                      {displayCategory.seoKeywords && displayCategory.seoKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {displayCategory.seoKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No keywords set</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subcategories */}
            {displayCategory.children && displayCategory.children.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Subcategories</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayCategory.children.map((child) => (
                    <div key={child._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {child.image && child.image.url ? (
                          <img
                            src={child.image.url}
                            alt={child.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {child.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {child.productsCount || child.productCount || 0} products
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Products */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
              
              {productsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div key={product._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images.length > 0 && product.images[0].url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products in this category yet</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={onClose}
                className="btn btn-secondary btn-md"
              >
                Close
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger btn-md"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Category
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryViewModal;
