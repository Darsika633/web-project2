import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Package, 
  User, 
  Truck,
  Edit3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { paymentsAPI } from '../../services/api';

const PaymentViewModal = ({ payment, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState(payment.adminNotes || '');
  const [collectionIssues, setCollectionIssues] = useState(payment.collectionIssues || []);
  const [issueDescription, setIssueDescription] = useState(payment.issueDescription || '');
  const [editing, setEditing] = useState(false);

  const issueOptions = [
    'customer_not_available',
    'address_incorrect',
    'customer_refused_payment',
    'insufficient_funds',
    'damaged_goods',
    'other'
  ];

  const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return 'LKR 0.00';
    }
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-LK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid_on_delivery: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      partial: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getCollectionStatusBadge = (status) => {
    const statusConfig = {
      not_collected: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      collected: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      partial_collected: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      failed_collection: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig.not_collected;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const handleUpdatePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await paymentsAPI.updatePayment(payment._id, {
        adminNotes,
        collectionIssues,
        issueDescription
      });
      
      setEditing(false);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueToggle = (issue) => {
    setCollectionIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-gray-600">Order: {payment.order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
              <div className="flex space-x-3">
                {getStatusBadge(payment.status)}
                {getCollectionStatusBadge(payment.collectionStatus)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payment.expectedAmount)}
                </div>
                <div className="text-sm text-gray-600">Expected Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(payment.collectedAmount)}
                </div>
                <div className="text-sm text-gray-600">Collected Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(payment.balanceAmount)}
                </div>
                <div className="text-sm text-gray-600">Balance Amount</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">
                    {payment.customer?.firstName || 'N/A'} {payment.customer?.lastName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Phone
                  </label>
                  <p className="text-gray-900">{payment.customer?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <p className="text-gray-900">{payment.customer?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Delivery Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Person</label>
                  <p className="text-gray-900">
                    {payment.deliveryPerson ? 
                      `${payment.deliveryPerson.firstName || 'N/A'} ${payment.deliveryPerson.lastName || 'N/A'}` : 
                      'Not Assigned'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Attempts</label>
                  <p className="text-gray-900">{payment.deliveryAttempts || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-gray-900 capitalize">{(payment.method || 'N/A').replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h3>
            <div className="text-gray-900">
              {payment.order.deliveryAddress ? (
                <>
                  <p>{payment.order.deliveryAddress.street || 'N/A'}</p>
                  <p>{payment.order.deliveryAddress.city || 'N/A'}, {payment.order.deliveryAddress.state || 'N/A'}</p>
                  <p>{payment.order.deliveryAddress.zipCode || 'N/A'}</p>
                </>
              ) : (
                <p className="text-gray-500">No delivery address available</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items
            </h3>
            <div className="space-y-3">
              {payment.order.items && payment.order.items.length > 0 ? (
                payment.order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        {typeof item.product === 'object' && item.product?.name 
                          ? item.product.name 
                          : `Product ${item.product || 'N/A'}`
                        }
                      </p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {item.variant.size} - {item.variant.color?.name || 'N/A'} ({item.variant.sku || 'N/A'})
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {item.quantity || 0} x {formatCurrency(item.unitPrice || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.totalPrice || 0)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items available</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(payment.order?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add admin notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Issues
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {issueOptions.map((issue) => (
                      <label key={issue} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={collectionIssues.includes(issue)}
                          onChange={() => handleIssueToggle(issue)}
                          className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {issue.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Description
                  </label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe the collection issues..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdatePayment}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Payment'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <p className="text-gray-900 mt-1">
                    {adminNotes || 'No admin notes'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Collection Issues</label>
                  <div className="mt-1">
                    {collectionIssues.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {collectionIssues.map((issue) => (
                          <span
                            key={issue}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {issue.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900">No collection issues reported</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Issue Description</label>
                  <p className="text-gray-900 mt-1">
                    {issueDescription || 'No issue description'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Timestamps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created At</label>
                <p className="text-gray-900">{formatDate(payment.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Updated At</label>
                <p className="text-gray-900">{formatDate(payment.updatedAt)}</p>
              </div>
              {payment.collectionTimestamp && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Collection Timestamp</label>
                  <p className="text-gray-900">{formatDate(payment.collectionTimestamp)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentViewModal;
