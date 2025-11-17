import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';

const InventoryStats = () => {
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [statsResponse, dashboardResponse] = await Promise.all([
        inventoryAPI.getStatistics(),
        inventoryAPI.getDashboard()
      ]);

      setStats(statsResponse.data.data);
      setDashboard(dashboardResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory data');
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
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
              <h3 className="text-sm font-medium text-red-800">Error loading inventory data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Inventory Statistics</h2>
        <p className="text-gray-600">Overview of your current inventory status</p>
      </div>

      {/* Main Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts?.toLocaleString() || '0'}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="Total Stock"
            value={stats.totalStock?.toLocaleString() || '0'}
            subtitle={`${stats.totalAvailable?.toLocaleString() || '0'} available`}
            icon="📊"
            color="green"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockCount?.toLocaleString() || '0'}
            subtitle={`${stats.outOfStockCount?.toLocaleString() || '0'} out of stock`}
            icon="⚠️"
            color="yellow"
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue?.toLocaleString() || '0'}`}
            icon="💰"
            color="purple"
          />
        </div>
      )}

      {/* Dashboard Data */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Products */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Products</h3>
            {dashboard.lowStockProducts && dashboard.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {dashboard.lowStockProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-600">
                        {product.brand} • {product.categoryName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-700">
                        {product.currentStock} / {product.lowStockThreshold}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.stockPercentage}% remaining
                      </p>
                    </div>
                  </div>
                ))}
                {dashboard.lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{dashboard.lowStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No low stock items</p>
            )}
          </div>

          {/* Recent Movements */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Movements</h3>
            {dashboard.recentMovements && dashboard.recentMovements.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentMovements.slice(0, 5).map((movement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{movement.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">{movement.reason || 'No reason provided'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent movements</p>
            )}
          </div>
        </div>
      )}

      {/* Movement Summary */}
      {dashboard && dashboard.movementSummary && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movement Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard.movementSummary.map((summary, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    summary._id === 'in' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-gray-900 capitalize">
                    {summary._id === 'in' ? 'Stock In' : 'Stock Out'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {summary.totalQuantity > 0 ? '+' : ''}{summary.totalQuantity}
                  </p>
                  <p className="text-sm text-gray-600">{summary.count} movements</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryStats;
