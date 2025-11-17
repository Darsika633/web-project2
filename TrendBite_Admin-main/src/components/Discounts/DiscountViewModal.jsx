import React from 'react';
import { X, Percent, DollarSign, Calendar, Users, Package, Tag, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const DiscountViewModal = ({ isOpen, onClose, discount, onDelete }) => {
  if (!isOpen || !discount) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const isUpcoming = (validFrom) => {
    return new Date(validFrom) > new Date();
  };

  const isActive = () => {
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validUntil = new Date(discount.validUntil);
    return discount.isActive && now >= validFrom && now <= validUntil;
  };

  const getStatusBadge = () => {
    if (isExpired(discount.validUntil)) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }
    if (isUpcoming(discount.validFrom)) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Upcoming</span>;
    }
    if (isActive()) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
  };

  const getTypeBadge = () => {
    const typeConfig = {
      percentage: { color: 'bg-blue-100 text-blue-800', label: 'Percentage' },
      fixed: { color: 'bg-green-100 text-green-800', label: 'Fixed Amount' },
    };
    
    const config = typeConfig[discount.type] || typeConfig.percentage;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getUsagePercentage = () => {
    if (!discount.usageLimit) return null;
    const percentage = (discount.usedCount / discount.usageLimit) * 100;
    return Math.round(percentage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Discount Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Percent className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{discount.code}</h3>
                <p className="text-sm text-gray-600">{discount.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {getTypeBadge()}
            </div>
          </div>

          {/* Description */}
          {discount.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{discount.description}</p>
            </div>
          )}

          {/* Discount Value */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Discount Value</h4>
                <p className="text-2xl font-bold text-primary-600">
                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Usage</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {discount.usedCount || 0}
                    {discount.usageLimit && ` / ${discount.usageLimit}`}
                  </p>
                </div>
              </div>
              {discount.usageLimit && (
                <div className="mt-2">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">{getUsagePercentage()}% used</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">Total Savings</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${discount.totalSavings || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Validity Period
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Valid From</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(discount.validFrom)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Valid Until</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(discount.validUntil)}</p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Conditions</h4>
            <div className="space-y-2">
              {discount.minimumOrderAmount && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Minimum Order Amount</span>
                  <span className="text-sm font-medium text-gray-900">${discount.minimumOrderAmount}</span>
                </div>
              )}
              {discount.maximumDiscountAmount && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Maximum Discount Amount</span>
                  <span className="text-sm font-medium text-gray-900">${discount.maximumDiscountAmount}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Public Discount</span>
                <span className={`text-sm font-medium ${discount.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                  {discount.isPublic ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Applicability */}
          {(discount.applicableProducts?.length > 0 || discount.applicableCategories?.length > 0) && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Applicability
              </h4>
              <div className="space-y-3">
                {discount.applicableCategories?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Applicable Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {discount.applicableCategories.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.name || category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {discount.applicableProducts?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Applicable Products</p>
                    <div className="flex flex-wrap gap-1">
                      {discount.applicableProducts.map((product, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {product.name || product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {discount.createdAt ? formatDate(discount.createdAt) : 'N/A'}
                </p>
                {discount.createdBy && (
                  <p className="text-xs text-gray-400">
                    by {discount.createdBy.firstName} {discount.createdBy.lastName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {discount.updatedAt ? formatDate(discount.updatedAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-secondary btn-md"
            >
              Close
            </button>
            <button
              onClick={() => onDelete(discount._id)}
              className="btn btn-danger btn-md"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountViewModal;
