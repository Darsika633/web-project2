import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  MapPin,
  Phone,
  User,
  FileText
} from 'lucide-react';
import { paymentsAPI } from '../../services/api';

const DeliveryPaymentIssueModal = ({ payment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState([]);
  const [description, setDescription] = useState('');

  const issueOptions = [
    { value: 'customer_not_available', label: 'Customer Not Available' },
    { value: 'address_incorrect', label: 'Incorrect Address' },
    { value: 'customer_refused_payment', label: 'Customer Refused Payment' },
    { value: 'insufficient_funds', label: 'Insufficient Funds' },
    { value: 'damaged_goods', label: 'Damaged Goods' },
    { value: 'wrong_items', label: 'Wrong Items Delivered' },
    { value: 'customer_unreachable', label: 'Customer Unreachable' },
    { value: 'other', label: 'Other' }
  ];

  const handleIssueToggle = (issueValue) => {
    setIssues(prev => 
      prev.includes(issueValue) 
        ? prev.filter(issue => issue !== issueValue)
        : [...prev, issueValue]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (issues.length === 0) {
      setError('Please select at least one issue');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await paymentsAPI.reportIssue(payment._id, {
        issues,
        description: description.trim()
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Report Collection Issue</h2>
            <p className="text-gray-600">Order: {payment.order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <User className="w-4 h-4 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">Customer Information</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-blue-800">
                    {payment.customer.firstName} {payment.customer.lastName}
                  </p>
                  <div className="flex items-center text-sm text-blue-700">
                    <Phone className="w-3 h-3 mr-1" />
                    {payment.customer.phone}
                  </div>
                  <div className="flex items-start text-sm text-blue-700">
                    <MapPin className="w-3 h-3 mr-1 mt-0.5" />
                    <div>
                      <p>{payment.order.deliveryAddress.street}</p>
                      <p>{payment.order.deliveryAddress.city}, {payment.order.deliveryAddress.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Be specific about the issue encountered</li>
                      <li>Include any attempts made to resolve the issue</li>
                      <li>Mention if you left a delivery note or contacted the customer</li>
                      <li>This will help the admin take appropriate follow-up action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Issue Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What issues did you encounter? (Select all that apply)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {issueOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={issues.includes(option.value)}
                        onChange={() => handleIssueToggle(option.value)}
                        className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Please provide a detailed description of the issue encountered..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 flex-shrink-0">
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reporting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Report Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryPaymentIssueModal;
