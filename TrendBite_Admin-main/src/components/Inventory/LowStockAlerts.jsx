import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';

const LowStockAlerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [thresholdInput, setThresholdInput] = useState('');
  const [filters, setFilters] = useState({
    threshold: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchAlertsData();
  }, [filters]);

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      const [alertsResponse, lowStockResponse] = await Promise.all([
        inventoryAPI.getAlerts({ limit: 50 }),
        inventoryAPI.getLowStock(filters)
      ]);

      setAlerts(alertsResponse.data.data);
      setLowStock(lowStockResponse.data.data.lowStockProducts || []);
      setPagination(lowStockResponse.data.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch alerts data');
      console.error('Error fetching alerts data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setFilters(prev => ({
      ...prev,
      threshold: thresholdInput,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'lowStock':
        return '⚠️';
      case 'outOfStock':
        return '🚫';
      case 'staleInventory':
        return '📅';
      default:
        return 'ℹ️';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'lowStock':
        return 'yellow';
      case 'outOfStock':
        return 'red';
      case 'staleInventory':
        return 'orange';
      default:
        return 'blue';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading alerts data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Inventory Alerts</h2>
        <p className="text-gray-600">Monitor low stock, out of stock, and stale inventory alerts</p>
      </div>

      {/* Alert Summary */}
      {alerts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.summary?.lowStockCount || 0}
                </p>
                <p className="text-sm text-gray-600">Items below threshold</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-red-100">
                <span className="text-2xl">🚫</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.summary?.outOfStockCount || 0}
                </p>
                <p className="text-sm text-gray-600">Items with zero stock</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-orange-100">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Stale Inventory</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.summary?.staleInventoryCount || 0}
                </p>
                <p className="text-sm text-gray-600">Items not sold recently</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Products</h3>
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stock Threshold</label>
                <input
                  type="number"
                  placeholder="Threshold"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
                  className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRefresh}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {lowStock.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Restocked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sold
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStock.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.categoryName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-semibold ${
                        product.currentStock === 0 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.lowStockThreshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              product.stockPercentage <= 20 ? 'bg-red-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(product.stockPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{product.stockPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.lastRestocked ? new Date(product.lastRestocked).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.lastSold ? new Date(product.lastSold).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No low stock alerts</h3>
            <p className="mt-1 text-sm text-gray-500">All products have sufficient stock levels.</p>
          </div>
        )}
      </div>

      {/* Out of Stock Alerts */}
      {alerts && alerts.outOfStockAlerts && alerts.outOfStockAlerts.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h3 className="text-lg font-medium text-red-900 flex items-center">
              <span className="mr-2">🚫</span>
              Out of Stock Items
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.outOfStockAlerts.map((alert, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{alert.product.name}</h4>
                    <p className="text-sm text-gray-500">{alert.product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                    <p className="text-xs text-gray-500">
                      Last sold: {alert.lastSold ? new Date(alert.lastSold).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stale Inventory Alerts */}
      {alerts && alerts.staleInventory && alerts.staleInventory.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
            <h3 className="text-lg font-medium text-orange-900 flex items-center">
              <span className="mr-2">📅</span>
              Stale Inventory
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.staleInventory.map((item, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-500">{item.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-orange-600 font-medium">
                      Stock: {item.currentStock}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last sold: {item.lastSold ? new Date(item.lastSold).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination for Low Stock */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.currentPage - 1) * pagination.limit) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalItems}</span>{' '}
                results
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
