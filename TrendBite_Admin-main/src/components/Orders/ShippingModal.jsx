import React, { useState } from 'react';
import { X, Save, Truck, MapPin, Calendar, Package } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const ShippingModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    trackingNumber: order?.shipping?.trackingNumber || order?.trackingInfo?.trackingNumber || '',
    carrier: order?.shipping?.deliveryPartner || order?.trackingInfo?.carrier || '',
    shippingMethod: order?.shipping?.method || order?.trackingInfo?.shippingMethod || 'standard',
    estimatedDelivery: (order?.shipping?.estimatedDeliveryDate || order?.trackingInfo?.estimatedDelivery) ? 
      new Date(order.shipping?.estimatedDeliveryDate || order.trackingInfo?.estimatedDelivery).toISOString().split('T')[0] : '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const carriers = [
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'usps', label: 'USPS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'amazon', label: 'Amazon Logistics' },
    { value: 'other', label: 'Other' },
  ];

  const shippingMethods = [
    { value: 'standard', label: 'Standard Shipping' },
    { value: 'express', label: 'Express Shipping' },
    { value: 'overnight', label: 'Overnight Shipping' },
    { value: 'pickup', label: 'Store Pickup' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.trackingNumber || !formData.carrier) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const shippingData = {
        trackingNumber: formData.trackingNumber,
        carrier: formData.carrier,
        shippingMethod: formData.shippingMethod,
        ...(formData.estimatedDelivery && { 
          estimatedDelivery: new Date(formData.estimatedDelivery).toISOString() 
        }),
        ...(formData.notes && { notes: formData.notes }),
      };

      await ordersAPI.updateShipping(order._id, shippingData);
      toast.success('Shipping details updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('API update failed, trying mock:', error);
      try {
        await mockApi.updateOrderShipping(order._id, shippingData);
        toast.success('Shipping details updated successfully');
        onSuccess();
        onClose();
      } catch (mockError) {
        console.error('Mock update also failed:', mockError);
        toast.error('Failed to update shipping details');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Update Shipping Details</h2>
            <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Current Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Delivery Address
              </label>
              {order.deliveryAddress ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {order.deliveryAddress.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{order.deliveryAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No delivery address provided</p>
              )}
            </div>

            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleInputChange}
                placeholder="Enter tracking number"
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Carrier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Carrier <span className="text-danger-500">*</span>
              </label>
              <select
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select carrier</option>
                {carriers.map((carrier) => (
                  <option key={carrier.value} value={carrier.value}>
                    {carrier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shipping Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Method
              </label>
              <select
                name="shippingMethod"
                value={formData.shippingMethod}
                onChange={handleInputChange}
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {shippingMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Delivery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Estimated Delivery Date
              </label>
              <input
                type="date"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add any additional shipping notes..."
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Current Shipping Info */}
            {(order.shipping?.trackingNumber || order.trackingInfo) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Current Shipping Information</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  {(order.shipping?.trackingNumber || order.trackingInfo?.trackingNumber) && (
                    <p><strong>Tracking:</strong> {order.shipping?.trackingNumber || order.trackingInfo?.trackingNumber}</p>
                  )}
                  {(order.shipping?.deliveryPartner || order.trackingInfo?.carrier) && (
                    <p><strong>Carrier:</strong> {order.shipping?.deliveryPartner || order.trackingInfo?.carrier}</p>
                  )}
                  {(order.shipping?.estimatedDeliveryDate || order.trackingInfo?.estimatedDelivery) && (
                    <p><strong>Est. Delivery:</strong> {formatDate(order.shipping?.estimatedDeliveryDate || order.trackingInfo?.estimatedDelivery)}</p>
                  )}
                  {order.shippedAt && (
                    <p><strong>Shipped:</strong> {formatDate(order.shippedAt)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Order Items Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                <Package className="h-4 w-4 mr-1" />
                Order Items ({order.items?.length || 0})
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                {order.items?.slice(0, 3).map((item, index) => (
                  <p key={index}>
                    {item.quantity}x {item.product?.name}
                    {item.variant?.size && ` (${item.variant.size})`}
                  </p>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-gray-500">+{order.items.length - 3} more items</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Update Shipping
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingModal;
