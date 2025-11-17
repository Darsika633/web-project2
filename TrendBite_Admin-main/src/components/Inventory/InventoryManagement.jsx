import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import InventoryStats from './InventoryStats';
import InventoryOverview from './InventoryOverview';
import LowStockAlerts from './LowStockAlerts';
import InventoryReports from './InventoryReports';
import StockMovementHistory from './StockMovementHistory';
import BulkStockUpdate from './BulkStockUpdate';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📦' },
    { id: 'stats', name: 'Statistics', icon: '📊' },
    { id: 'alerts', name: 'Alerts', icon: '⚠️' },
    { id: 'reports', name: 'Reports', icon: '📋' },
    { id: 'movements', name: 'Movements', icon: '🔄' },
    { id: 'bulk-update', name: 'Bulk Update', icon: '⚡' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <InventoryOverview />;
      case 'stats':
        return <InventoryStats />;
      case 'alerts':
        return <LowStockAlerts />;
      case 'reports':
        return <InventoryReports />;
      case 'movements':
        return <StockMovementHistory />;
      case 'bulk-update':
        return <BulkStockUpdate />;
      default:
        return <InventoryOverview />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">
          Manage your inventory, track stock levels, and monitor product movements
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default InventoryManagement;
