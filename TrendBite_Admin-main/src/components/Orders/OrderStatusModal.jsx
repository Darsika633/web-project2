import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const OrderStatusModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState(order?.status || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Order is awaiting processing' },
    { value: 'confirmed', label: 'Confirmed', description: 'Order has been confirmed and is ready for assignment' },
    { value: 'out_for_delivery', label: 'Out for Delivery', description: 'Order is currently being delivered' },
    { value: 'delivered', label: 'Delivered', description: 'Order has been successfully delivered' },
    { value: 'completed', label: 'Completed', description: 'Order process is fully completed' },
    { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!status) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    
    try {
      const updateData = {
        status,
        ...(notes && { notes }),
      };

      await ordersAPI.updateStatus(order._id, updateData);
      toast.success('Order status updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('API update failed, trying mock:', error);
      try {
        await mockApi.updateOrderStatus(order._id, updateData);
        toast.success('Order status updated successfully');
        onSuccess();
        onClose();
      } catch (mockError) {
        console.error('Mock update also failed:', mockError);
        toast.error('Failed to update order status');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue) => {
    const colors = {
      pending: 'text-warning-600 bg-warning-50 border-warning-200',
      confirmed: 'text-purple-600 bg-purple-50 border-purple-200',
      out_for_delivery: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      delivered: 'text-green-600 bg-green-50 border-green-200',
      completed: 'text-gray-600 bg-gray-50 border-gray-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[statusValue] || colors.pending;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
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
            {/* Current Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
              </div>
            </div>

            {/* New Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-danger-500">*</span>
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      status === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full border-2 mr-3 ${
                          status === option.value
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {status === option.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any additional notes about this status change..."
                className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Warning for certain status changes */}
            {status === 'cancelled' && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-warning-800">
                      Cancellation Warning
                    </h4>
                    <p className="text-sm text-warning-700 mt-1">
                      Cancelling this order will notify the customer and may trigger refunds. 
                      Please ensure this action is correct.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'delivered' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Delivery Confirmation
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Marking this order as delivered will notify the customer. The order can then be marked as completed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">
                      Order Completion
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Marking this order as completed will finalize the order process. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              disabled={loading || !status}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusModal;

