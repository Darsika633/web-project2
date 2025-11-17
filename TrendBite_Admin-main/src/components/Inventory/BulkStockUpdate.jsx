import React, { useState, useEffect } from 'react';
import { inventoryAPI, productsAPI } from '../../services/api';

const BulkStockUpdate = () => {
  const [products, setProducts] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 1000 });
      setProducts(response.data.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const addUpdate = () => {
    setUpdates(prev => [...prev, {
      id: Date.now(),
      productId: '',
      variantId: '',
      quantity: 0,
      isValid: false
    }]);
  };

  const removeUpdate = (id) => {
    setUpdates(prev => prev.filter(update => update.id !== id));
  };

  const updateField = (id, field, value) => {
    setUpdates(prev => prev.map(update => {
      if (update.id === id) {
        const updated = { ...update, [field]: value };
        
        // Validate the update
        if (updated.productId && updated.variantId && updated.quantity !== '') {
          updated.isValid = true;
        } else {
          updated.isValid = false;
        }
        
        return updated;
      }
      return update;
    }));
  };

  const getProductVariants = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.variants || [] : [];
  };

  const handleSubmit = async () => {
    if (updates.length === 0) {
      setError('Please add at least one stock update');
      return;
    }

    const validUpdates = updates.filter(update => update.isValid);
    if (validUpdates.length === 0) {
      setError('Please ensure all updates are valid');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const bulkUpdateData = {
        updates: validUpdates.map(update => ({
          productId: update.productId,
          variantId: update.variantId,
          quantity: parseInt(update.quantity)
        })),
        reason: reason || 'Bulk stock update',
        notes: notes || ''
      };

      const response = await inventoryAPI.bulkUpdate(bulkUpdateData);
      setSuccess(response.data.message);
      setUpdates([]);
      setReason('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
      console.error('Error updating stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bulk Stock Update</h2>
        <p className="text-gray-600">Update stock levels for multiple products at once</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Update Successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Updates</h3>

        {/* Add Update Button */}
        <div className="mb-4">
          <button
            onClick={addUpdate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Stock Update
          </button>
        </div>

        {/* Updates List */}
        {updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={update.productId}
                      onChange={(e) => updateField(update.id, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} - {product.brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variant Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                    <select
                      value={update.variantId}
                      onChange={(e) => updateField(update.id, 'variantId', e.target.value)}
                      disabled={!update.productId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Variant</option>
                      {getProductVariants(update.productId).map((variant, index) => (
                        <option key={index} value={variant._id || index}>
                          {variant.size} - {variant.color?.name || 'Default'} (Stock: {variant.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Change</label>
                    <input
                      type="number"
                      value={update.quantity}
                      onChange={(e) => updateField(update.id, 'quantity', e.target.value)}
                      placeholder="+/- quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Positive for stock in, negative for stock out
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end space-x-2">
                    {update.isValid && (
                      <div className="flex items-center text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs">Valid</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeUpdate(update.id)}
                      className="p-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-2">No stock updates added yet</p>
            <p className="text-sm">Click "Add Stock Update" to get started</p>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Update</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., New shipment received, Stock adjustment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or comments"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary and Submit */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Update Summary</h3>
            <p className="text-sm text-gray-600">
              {updates.length} update(s) • {updates.filter(u => u.isValid).length} valid
            </p>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading || updates.filter(u => u.isValid).length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Stock'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select a product and its variant from the dropdowns</li>
          <li>• Enter a positive number to add stock, negative to remove stock</li>
          <li>• All updates will be applied as a single transaction</li>
          <li>• Stock movements will be tracked and logged automatically</li>
          <li>• You can add multiple updates before submitting</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkStockUpdate;
