import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  User,
  Phone,
  Calendar,
  MoreHorizontal,
  Truck
} from 'lucide-react';
import { paymentsAPI } from '../../services/api';
import DeliveryPaymentCollectionModal from './DeliveryPaymentCollectionModal';
import DeliveryPaymentIssueModal from './DeliveryPaymentIssueModal';

const DeliveryPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    isOutstanding: ''
  });

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Filter out empty parameters
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await paymentsAPI.getMyPayments(cleanFilters);
      
      if (response.data && response.data.data && Array.isArray(response.data.data.payments)) {
        setPayments(response.data.data.payments);
        setError(null);
      } else {
        setPayments([]);
        setError('Invalid response structure from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCollectPayment = (payment) => {
    setSelectedPayment(payment);
    setShowCollectionModal(true);
  };

  const handleReportIssue = (payment) => {
    setSelectedPayment(payment);
    setShowIssueModal(true);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

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
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
            <p className="text-gray-600 mt-2">Manage assigned COD payments</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchPayments}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid_on_delivery">Paid on Delivery</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding</label>
            <select
              value={filters.isOutstanding}
              onChange={(e) => handleFilterChange('isOutstanding', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Outstanding Only</option>
              <option value="false">Not Outstanding</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', isOutstanding: '' })}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading payments...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchPayments}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payments assigned to you</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order & Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.order?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customer?.firstName || 'N/A'} {payment.customer?.lastName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {payment.customer?.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="flex items-start">
                          <MapPin className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="truncate">{payment.order?.deliveryAddress?.street || 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                              {payment.order?.deliveryAddress?.city || 'N/A'}, {payment.order?.deliveryAddress?.state || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.expectedAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Collected: {formatCurrency(payment.collectedAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Balance: {formatCurrency(payment.balanceAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCollectionStatusBadge(payment.collectionStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(payment.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {payment.collectionStatus === 'not_collected' && (
                          <>
                            <button
                              onClick={() => handleCollectPayment(payment)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Collect Payment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReportIssue(payment)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Report Issue"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {payment.collectionStatus === 'partial_collected' && (
                          <button
                            onClick={() => handleCollectPayment(payment)}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Collect Remaining Payment"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {payment.collectionStatus === 'failed_collection' && (
                          <button
                            onClick={() => handleCollectPayment(payment)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Retry Collection"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCollectionModal && selectedPayment && (
        <DeliveryPaymentCollectionModal
          payment={selectedPayment}
          onClose={() => {
            setShowCollectionModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={fetchPayments}
        />
      )}

      {showIssueModal && selectedPayment && (
        <DeliveryPaymentIssueModal
          payment={selectedPayment}
          onClose={() => {
            setShowIssueModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={fetchPayments}
        />
      )}
    </div>
  );
};

export default DeliveryPayments;
