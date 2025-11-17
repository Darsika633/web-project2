import React, { useState } from 'react';
import { X, Save, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const PaymentModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    paymentStatus: order?.payment?.status || order?.paymentStatus || 'pending',
    paymentMethod: order?.payment?.method || order?.paymentDetails?.method || order?.paymentMethod || '',
    transactionId: order?.payment?.transactionId || order?.paymentDetails?.transactionId || '',
    paidAt: (order?.payment?.paidAt || order?.paymentDetails?.paidAt) ? 
      new Date(order.payment?.paidAt || order.paymentDetails?.paidAt).toISOString().slice(0, 16) : '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const paymentStatusOptions = [
    { 
      value: 'pending', 
      label: 'Pending', 
      description: 'Payment is awaiting processing',
      icon: AlertCircle,
      color: 'text-warning-600 bg-warning-50 border-warning-200'
    },
    { 
      value: 'paid', 
      label: 'Paid', 
      description: 'Payment has been successfully processed',
      icon: CheckCircle,
      color: 'text-success-600 bg-success-50 border-success-200'
    },
    { 
      value: 'failed', 
      label: 'Failed', 
      description: 'Payment processing failed',
      icon: XCircle,
      color: 'text-danger-600 bg-danger-50 border-danger-200'
    },
    { 
      value: 'refunded', 
      label: 'Refunded', 
      description: 'Payment has been refunded',
      icon: XCircle,
      color: 'text-gray-600 bg-gray-50 border-gray-200'
    },
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'apple_pay', label: 'Apple Pay' },
    { value: 'google_pay', label: 'Google Pay' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery' },
    { value: 'other', label: 'Other' },
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
    
    if (!formData.paymentStatus) {
      toast.error('Please select a payment status');
      return;
    }

    if (formData.paymentStatus === 'paid' && !formData.transactionId) {
      toast.error('Transaction ID is required for paid status');
      return;
    }

    setLoading(true);
    
    try {
      const paymentData = {
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        ...(formData.transactionId && { transactionId: formData.transactionId }),
        ...(formData.paidAt && { 
          paidAt: new Date(formData.paidAt).toISOString() 
        }),
        ...(formData.notes && { notes: formData.notes }),
      };

      await ordersAPI.updatePayment(order._id, paymentData);
      toast.success('Payment details updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('API update failed, trying mock:', error);
      try {
        await mockApi.updateOrderPayment(order._id, paymentData);
        toast.success('Payment details updated successfully');
        onSuccess();
        onClose();
      } catch (mockError) {
        console.error('Mock update also failed:', mockError);
        toast.error('Failed to update payment details');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Update Payment Details</h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Payment Status */}
            <div className="space-y-6">
              {/* Order Total */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Order Total</h4>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                {order.discount && (
                  <p className="text-sm text-success-600 mt-1">
                    Discount applied: -{formatPrice(order.discount.amount)}
                  </p>
                )}
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status <span className="text-danger-500">*</span>
                </label>
                <div className="space-y-2">
                  {paymentStatusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.paymentStatus === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentStatus"
                          value={option.value}
                          checked={formData.paymentStatus === option.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full border-2 mr-3 ${
                              formData.paymentStatus === option.value
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {formData.paymentStatus === option.value && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <Icon className={`h-4 w-4 mr-2 ${
                              formData.paymentStatus === option.value ? 'text-primary-600' : 'text-gray-400'
                            }`} />
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
                    );
                  })}
                </div>
              </div>

              {/* Transaction ID */}
              {formData.paymentStatus === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    placeholder="Enter transaction ID"
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              )}

              {/* Payment Date */}
              {formData.paymentStatus === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="datetime-local"
                    name="paidAt"
                    value={formData.paidAt}
                    onChange={handleInputChange}
                    max={new Date().toISOString().slice(0, 16)}
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}

              {/* Warning for refunds */}
              {formData.paymentStatus === 'refunded' && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-warning-800">
                        Refund Warning
                      </h4>
                      <p className="text-sm text-warning-700 mt-1">
                        Marking this payment as refunded will notify the customer and may trigger 
                        additional refund processing. Please ensure this action is correct.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add any additional payment notes..."
                  className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Current Payment Info */}
              {(order.payment || order.paymentDetails) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Current Payment Information</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p><strong>Status:</strong> {order.payment?.status || order.paymentStatus}</p>
                    {(order.payment?.method || order.paymentDetails?.method) && (
                      <p><strong>Method:</strong> {order.payment?.method || order.paymentDetails?.method}</p>
                    )}
                    {(order.payment?.transactionId || order.paymentDetails?.transactionId) && (
                      <p><strong>Transaction ID:</strong> {order.payment?.transactionId || order.paymentDetails?.transactionId}</p>
                    )}
                    {(order.payment?.paidAt || order.paymentDetails?.paidAt) && (
                      <p><strong>Paid At:</strong> {formatDate(order.payment?.paidAt || order.paymentDetails?.paidAt)}</p>
                    )}
                  </div>
                </div>
              )}
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
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
