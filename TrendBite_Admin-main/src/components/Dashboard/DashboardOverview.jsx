import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalReviews: 0,
  });
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: [],
    totalRevenue: 0,
    totalOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState({
    recentOrders: [],
    recentCustomers: [],
    recentReviews: [],
  });
  const [topProducts, setTopProducts] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    customersWithOrders: 0,
    averageOrdersPerCustomer: 0,
    customerTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [
        overviewResponse,
        revenueResponse,
        activityResponse,
        topProductsResponse,
        customerResponse
      ] = await Promise.allSettled([
        dashboardAPI.getOverview(),
        dashboardAPI.getRevenueOverview(),
        dashboardAPI.getRecentActivity({ limit: 5 }),
        dashboardAPI.getTopSellingProducts({ limit: 5 }),
        dashboardAPI.getCustomerAnalytics()
      ]);

      // Handle overview data
      if (overviewResponse.status === 'fulfilled' && overviewResponse.value.data?.data) {
        setStats(overviewResponse.value.data.data);
      } else {
        throw new Error('Failed to fetch overview data');
      }

      // Handle revenue data
      if (revenueResponse.status === 'fulfilled' && revenueResponse.value.data?.data) {
        setRevenueData(revenueResponse.value.data.data);
      }

      // Handle recent activity data
      if (activityResponse.status === 'fulfilled' && activityResponse.value.data?.data) {
        console.log('Recent Activity API Response:', activityResponse.value.data.data);
        setRecentActivity(activityResponse.value.data.data);
      }

      // Handle top products data
      if (topProductsResponse.status === 'fulfilled' && topProductsResponse.value.data?.data) {
        setTopProducts(topProductsResponse.value.data.data.topSellingProducts || []);
      }

      // Handle customer analytics data
      if (customerResponse.status === 'fulfilled' && customerResponse.value.data?.data) {
        setCustomerAnalytics(customerResponse.value.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data from API, using mock data:', error);
      // Use mock data when API fails
      try {
        const [
          mockOverview,
          mockRevenue,
          mockActivity,
          mockTopProducts,
          mockCustomer
        ] = await Promise.all([
          mockApi.getDashboardOverview(),
          mockApi.getRevenueOverview(),
          mockApi.getRecentActivity({ limit: 5 }),
          mockApi.getTopSellingProducts({ limit: 5 }),
          mockApi.getCustomerAnalytics()
        ]);

        setStats(mockOverview.data.data);
        setRevenueData(mockRevenue.data.data);
        setRecentActivity(mockActivity.data.data);
        setTopProducts(mockTopProducts.data.data.topSellingProducts || []);
        setCustomerAnalytics(mockCustomer.data.data);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        // Set default stats as final fallback
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalReviews: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'primary',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Total Revenue',
      value: `LKR ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'success',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'info',
      change: '+15%',
      changeType: 'positive',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Eye,
      color: 'warning',
      change: '-3%',
      changeType: 'negative',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'secondary',
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Average Order Value',
      value: `LKR ${(stats?.averageOrderValue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'accent',
      change: '+5%',
      changeType: 'positive',
    },
  ];

  // Combine recent activities from different sources
  const getRecentActivities = () => {
    console.log('Recent Activity State:', recentActivity);
    const activities = [];
    
    // Add recent orders
    recentActivity.recentOrders?.forEach(order => {
      const timeAgo = order.createdAt ? getTimeAgo(new Date(order.createdAt)) : 'Just now';
      activities.push({
        id: `order_${order.id}`,
        type: 'order',
        message: `New order ${order.orderNumber} received from ${order.customer?.name || 'Unknown'}`,
        time: timeAgo,
        status: order.status || 'pending',
        createdAt: order.createdAt,
      });
    });
    
    // Add recent customers
    recentActivity.recentCustomers?.forEach(customer => {
      const timeAgo = customer.joinedAt ? getTimeAgo(new Date(customer.joinedAt)) : 'Just now';
      activities.push({
        id: `customer_${customer.id}`,
        type: 'user',
        message: `New user registration: ${customer.email || 'Unknown'}`,
        time: timeAgo,
        status: 'success',
        createdAt: customer.joinedAt,
      });
    });
    
    // Add recent reviews
    recentActivity.recentReviews?.forEach(review => {
      const timeAgo = review.createdAt ? getTimeAgo(new Date(review.createdAt)) : 'Just now';
      activities.push({
        id: `review_${review.id}`,
        type: 'review',
        message: `New ${review.rating}-star review for ${review.product?.name || 'product'}`,
        time: timeAgo,
        status: 'pending',
        createdAt: review.createdAt,
      });
    });
    
    // Sort by time (most recent first) and limit to 4 items
    return activities
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const recentActivities = getRecentActivities();

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'delivered':
      case 'confirmed':
        return 'text-success-600 bg-success-50';
      case 'warning':
      case 'assigned':
        return 'text-warning-600 bg-warning-50';
      case 'pending':
        return 'text-primary-600 bg-primary-50';
      case 'cancelled':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeIcon = (changeType) => {
    return changeType === 'positive' ? (
      <TrendingUp className="h-4 w-4 text-success-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-danger-600" />
    );
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-content mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {getChangeIcon(stat.changeType)}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Overview</h3>
            <p className="card-description">Monthly revenue for the past 6 months</p>
          </div>
          <div className="card-content">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center w-full">
                {revenueData.monthlyRevenue && revenueData.monthlyRevenue.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success-600">
                          LKR {revenueData.totalRevenue?.toLocaleString() || 0}
                        </p>
                        <p className="text-gray-500">Total Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">
                          {revenueData.totalOrders || 0}
                        </p>
                        <p className="text-gray-500">Total Orders</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Latest: {revenueData.monthlyRevenue[revenueData.monthlyRevenue.length - 1]?.month} - 
                      LKR {revenueData.monthlyRevenue[revenueData.monthlyRevenue.length - 1]?.revenue?.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue data will be displayed here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <p className="card-description">Latest updates from your store</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getStatusColor(
                      activity.status
                    )}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products and Customer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Selling Products</h3>
            <p className="card-description">Best performing products this month</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image.url}
                        alt={product.productName}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.totalQuantity} sold
                      </p>
                      <p className="text-xs text-gray-500">
                        LKR {product.totalRevenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Customer Analytics</h3>
            <p className="card-description">Customer insights and trends</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {customerAnalytics.totalCustomers || 0}
                  </p>
                  <p className="text-xs text-gray-500">Total Customers</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-success-600">
                    {customerAnalytics.newCustomersThisMonth || 0}
                  </p>
                  <p className="text-xs text-gray-500">New This Month</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-warning-600">
                    {customerAnalytics.customersWithOrders || 0}
                  </p>
                  <p className="text-xs text-gray-500">With Orders</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-info-600">
                    {customerAnalytics.averageOrdersPerCustomer?.toFixed(1) || 0}
                  </p>
                  <p className="text-xs text-gray-500">Avg Orders/Customer</p>
                </div>
              </div>
              {customerAnalytics.customerTrend && customerAnalytics.customerTrend.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Recent Trend</p>
                  <div className="text-xs text-gray-500">
                    Last 6 months: {customerAnalytics.customerTrend
                      .slice(-3)
                      .map(trend => trend.count)
                      .join(', ')} new customers
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-description">Common administrative tasks</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Package className="h-8 w-8 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-500">Create a new product</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/users')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 text-success-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and edit users</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/reviews')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Star className="h-8 w-8 text-warning-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Review Moderation</p>
                <p className="text-sm text-gray-500">Approve pending reviews</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
