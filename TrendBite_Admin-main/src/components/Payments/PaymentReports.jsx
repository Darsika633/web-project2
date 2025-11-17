import React, { useState } from 'react';
import { 
  Download, 
  Calendar, 
  FileText, 
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { paymentsAPI } from '../../services/api';

const PaymentReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'summary',
    deliveryPersonId: '',
    status: ''
  });

  const reportTypes = [
    { value: 'summary', label: 'Summary Report' },
    { value: 'detailed', label: 'Detailed Report' },
    { value: 'outstanding', label: 'Outstanding Report' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid_on_delivery', label: 'Paid on Delivery' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = {
        ...prev,
        [key]: value
      };

      // If user changes the start date to a date after the currently selected end date,
      // auto-correct the end date to the new start date so the end picker doesn't become invalid.
      if (key === 'startDate' && value) {
        // both values are in YYYY-MM-DD format from the date input; string compare is safe
        if (prev.endDate && prev.endDate < value) {
          next.endDate = value;
        }
      }

      return next;
    });

    // Clear date-related errors when user edits date inputs
    if (key === 'startDate' || key === 'endDate') {
      setError(null);
    }
  };

  const generateReport = async (e) => {
    e.preventDefault();
    
    if (!filters.startDate || !filters.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentsAPI.getReports(filters);
      setReportData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData || !reportData.report || !Array.isArray(reportData.report)) return;
    
    // Create CSV content
    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Delivery Person',
      'Expected Amount',
      'Collected Amount',
      'Balance Amount',
      'Status',
      'Collection Status',
      'Created Date',
      'Collection Date'
    ];

    const rows = reportData.report.map(payment => [
      payment.order?.orderNumber || 'N/A',
      `${payment.customer?.firstName || 'N/A'} ${payment.customer?.lastName || 'N/A'}`,
      payment.customer?.email || 'N/A',
      payment.customer?.phone || 'N/A',
      payment.deliveryPerson ? `${payment.deliveryPerson.firstName || 'N/A'} ${payment.deliveryPerson.lastName || 'N/A'}` : 'Not Assigned',
      payment.expectedAmount || 0,
      payment.collectedAmount || 0,
      payment.balanceAmount || 0,
      payment.status || 'N/A',
      payment.collectionStatus || 'N/A',
      payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A',
      payment.collectionTimestamp ? new Date(payment.collectionTimestamp).toLocaleDateString() : 'Not Collected'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-report-${filters.startDate}-to-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData || !reportData.report || !Array.isArray(reportData.report)) {
      return null;
    }

    const payments = reportData.report;
    const totalExpected = payments.reduce((sum, p) => sum + (p.expectedAmount || 0), 0);
    const totalCollected = payments.reduce((sum, p) => sum + (p.collectedAmount || 0), 0);
    const totalBalance = payments.reduce((sum, p) => sum + (p.balanceAmount || 0), 0);
    const completedCount = payments.filter(p => p.status === 'completed').length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const failedCount = payments.filter(p => p.status === 'failed').length;
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return {
      totalPayments: payments.length,
      totalExpected,
      totalCollected,
      totalBalance,
      completedCount,
      pendingCount,
      failedCount,
      collectionRate
    };
  };

  const summary = calculateSummary();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Reports</h1>
        <p className="text-gray-600 mt-2">Generate and export payment reports</p>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={generateReport} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              /* Disable selecting dates before the chosen start date */
              min={filters.startDate || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {reportTypes.find(t => t.value === filters.reportType)?.label}
                </h2>
                <p className="text-gray-600">
                  {formatDate(filters.startDate)} to {formatDate(filters.endDate)}
                </p>
              </div>
              <button
                onClick={exportReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>

            {/* Report Summary */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Expected</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalExpected)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Collected</p>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalCollected)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Total Balance</p>
                      <p className="text-2xl font-bold text-orange-900">{formatCurrency(summary.totalBalance)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Collection Rate</p>
                      <p className="text-2xl font-bold text-purple-900">{summary.collectionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order & Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Person
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
                      Dates
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.report && Array.isArray(reportData.report) && reportData.report.map((payment) => (
                    <tr key={payment._id || Math.random()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.order?.orderNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.customer?.firstName || 'N/A'} {payment.customer?.lastName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {payment.customer?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.deliveryPerson ? 
                            `${payment.deliveryPerson.firstName || 'N/A'} ${payment.deliveryPerson.lastName || 'N/A'}` : 
                            'Not Assigned'
                          }
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
                        <div>
                          <div>Created: {payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}</div>
                          {payment.collectionTimestamp && (
                            <div>Collected: {formatDate(payment.collectionTimestamp)}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Report Message */}
      {!reportData && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Generated</h3>
          <p className="text-gray-600">Select date range and generate a report to view payment data.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentReports;
