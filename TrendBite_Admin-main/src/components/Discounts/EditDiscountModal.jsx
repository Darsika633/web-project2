import React, { useState, useEffect } from 'react';
import { X, Percent, DollarSign, Calendar, Users, Package, Tag } from 'lucide-react';
import { discountsAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import { categoriesAPI } from '../../services/api';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EditDiscountModal = ({ isOpen, onClose, onSuccess, discount }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    applicableProducts: [],
    applicableCategories: [],
    applicableUsers: [],
    isPublic: true,
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && discount) {
      // Populate form with existing discount data
      setFormData({
        code: discount.code || '',
        name: discount.name || '',
        description: discount.description || '',
        type: discount.type || 'percentage',
        value: discount.value || '',
        minimumOrderAmount: discount.minimumOrderAmount || '',
        maximumDiscountAmount: discount.maximumDiscountAmount || '',
        usageLimit: discount.usageLimit || '',
        validFrom: discount.validFrom ? new Date(discount.validFrom).toISOString().slice(0, 16) : '',
        validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().slice(0, 16) : '',
        applicableProducts: discount.applicableProducts || [],
        applicableCategories: discount.applicableCategories || [],
        applicableUsers: discount.applicableUsers || [],
        isPublic: discount.isPublic !== undefined ? discount.isPublic : true,
      });
    }
  }, [isOpen, discount]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({ limit: 100 });
      if (response.data && response.data.data) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      try {
        const mockResponse = await mockApi.getCategories({ limit: 100 });
        setCategories(mockResponse.data.data.categories || []);
      } catch (mockError) {
        console.error('Error fetching categories:', mockError);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      if (response.data && response.data.data) {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      try {
        const mockResponse = await mockApi.getProducts({ limit: 100 });
        setProducts(mockResponse.data.data.products || []);
      } catch (mockError) {
        console.error('Error fetching products:', mockError);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Discount code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Discount code must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Discount name is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Discount value must be greater than 0';
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage discount cannot exceed 100%';
    }

    if (formData.minimumOrderAmount && formData.minimumOrderAmount < 0) {
      newErrors.minimumOrderAmount = 'Minimum order amount cannot be negative';
    }

    if (formData.maximumDiscountAmount && formData.maximumDiscountAmount < 0) {
      newErrors.maximumDiscountAmount = 'Maximum discount amount cannot be negative';
    }

    if (formData.usageLimit && formData.usageLimit < 0) {
      newErrors.usageLimit = 'Usage limit cannot be negative';
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (formData.validFrom && formData.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'Valid until date must be after valid from date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const discountData = {
        ...formData,
        value: parseFloat(formData.value),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
        maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      };

      await discountsAPI.update(discount._id, discountData);
      toast.success('Discount updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('API update failed, trying mock:', error);
      try {
        const discountData = {
          ...formData,
          value: parseFloat(formData.value),
          minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
          maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : undefined,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        };

        await mockApi.updateDiscount(discount._id, discountData);
        toast.success('Discount updated successfully');
        onSuccess();
        onClose();
      } catch (mockError) {
        console.error('Mock update also failed:', mockError);
        toast.error('Failed to update discount');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      applicableProducts: [],
      applicableCategories: [],
      applicableUsers: [],
      isPublic: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !discount) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Discount</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SAVE10"
                  className={`input w-full ${errors.code ? 'border-red-500' : ''}`}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 10% Off Everything"
                  className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the discount offer..."
                rows={3}
                className="input w-full"
              />
            </div>
          </div>

          {/* Discount Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Percent className="h-5 w-5 mr-2" />
              Discount Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <div className="relative">
                  {formData.type === 'percentage' ? (
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'percentage' ? '10' : '5.00'}
                    min="0"
                    step={formData.type === 'percentage' ? '1' : '0.01'}
                    className={`input w-full pl-10 ${errors.value ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="minimumOrderAmount"
                    value={formData.minimumOrderAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`input w-full pl-10 ${errors.minimumOrderAmount ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.minimumOrderAmount && <p className="text-red-500 text-sm mt-1">{errors.minimumOrderAmount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Discount Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="maximumDiscountAmount"
                    value={formData.maximumDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="No limit"
                    min="0"
                    step="0.01"
                    className={`input w-full pl-10 ${errors.maximumDiscountAmount ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.maximumDiscountAmount && <p className="text-red-500 text-sm mt-1">{errors.maximumDiscountAmount}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="No limit"
                  min="0"
                  className={`input w-full pl-10 ${errors.usageLimit ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.usageLimit && <p className="text-red-500 text-sm mt-1">{errors.usageLimit}</p>}
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Validity Period
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.validFrom ? 'border-red-500' : ''}`}
                />
                {errors.validFrom && <p className="text-red-500 text-sm mt-1">{errors.validFrom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.validUntil ? 'border-red-500' : ''}`}
                />
                {errors.validUntil && <p className="text-red-500 text-sm mt-1">{errors.validUntil}</p>}
              </div>
            </div>
          </div>

          {/* Applicability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Applicability
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Categories
              </label>
              <select
                multiple
                value={formData.applicableCategories}
                onChange={(e) => handleMultiSelectChange('applicableCategories', Array.from(e.target.selectedOptions, option => option.value))}
                className="input w-full h-32"
              >
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple categories. Leave empty for all categories.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Products
              </label>
              <select
                multiple
                value={formData.applicableProducts}
                onChange={(e) => handleMultiSelectChange('applicableProducts', Array.from(e.target.selectedOptions, option => option.value))}
                className="input w-full h-32"
              >
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple products. Leave empty for all products.</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Make this discount public (visible to all customers)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary btn-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiscountModal;

