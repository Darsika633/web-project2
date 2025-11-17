import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { paymentsAPI } from '../../services/api';

const PaymentCollectionModal = ({ payment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(payment.balanceAmount.toString());
  const [notes, setNotes] = useState('');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > payment.balanceAmount) {
      setError('Amount cannot exceed the balance amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await paymentsAPI.markAsReceived(payment._id, {
        amount: parseFloat(amount),
        notes
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark payment as received');
    } finally {
      setLoading(false);
    }
  };

  const handleFullPayment = () => {
    setAmount(payment.balanceAmount.toString());
  };

  const handlePartialPayment = () => {
    setAmount((payment.balanceAmount * 0.5).toString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mark Payment as Received</h2>
            <p className="text-gray-600">Order: {payment.order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(payment.expectedAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collected Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(payment.collectedAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-medium text-gray-900">Balance Amount:</span>
                <span className="text-sm font-bold text-orange-600">
                  {formatCurrency(payment.balanceAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-blue-900">Customer Information</h3>
            </div>
            <p className="text-sm text-blue-800">
              {payment.customer.firstName} {payment.customer.lastName}
            </p>
            <p className="text-sm text-blue-700">{payment.customer.phone}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Collect
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max={payment.balanceAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={handleFullPayment}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Full Payment
              </button>
              <button
                type="button"
                onClick={handlePartialPayment}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
              >
                50% Payment
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add notes about the collection..."
            />
          </div>

          {/* Payment Type Info */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                This will mark the payment as received by admin. The delivery person will be notified.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Received
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentCollectionModal;

