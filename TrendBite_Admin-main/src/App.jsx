import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout/Layout';
import DeliveryLayout from './components/Layout/DeliveryLayout';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import UserManagement from './components/Users/UserManagement';
import ProductManagement from './components/Products/ProductManagement';
import InventoryManagement from './components/Inventory/InventoryManagement';
import OrderManagement from './components/Orders/OrderManagement';
import CategoryManagement from './components/Categories/CategoryManagement';
import ReviewManagement from './components/Reviews/ReviewManagement';
import DiscountManagement from './components/Discounts/DiscountManagement';
import AdminDeliveryManagement from './components/Delivery/AdminDeliveryManagement';
import PaymentManagement from './components/Payments/PaymentManagement';

import DeliveryOrders from './components/Delivery/DeliveryOrders';
import DeliveryPayments from './components/Delivery/DeliveryPayments';
import DeliveryProfile from './components/Delivery/DeliveryProfile';
import DeliveryStatistics from './components/Delivery/DeliveryStatistics';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Role-based Protected Route Component
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

// Main App Routes
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to={user?.role === 'deliveryperson' ? '/delivery/orders' : '/dashboard'} replace /> : <Login />}
      />
      
      {/* Admin Routes */}
      <Route
        path="/"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="delivery-management" element={<AdminDeliveryManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="reviews" element={<ReviewManagement />} />
        <Route path="discounts" element={<DiscountManagement />} />
        <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
        <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
      </Route>

      {/* Delivery Person Routes */}
      <Route
        path="/delivery"
        element={
          <RoleProtectedRoute allowedRoles={['deliveryperson']}>
            <DeliveryLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/delivery/orders" replace />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="payments" element={<DeliveryPayments />} />
        <Route path="profile" element={<DeliveryProfile />} />
        <Route path="statistics" element={<DeliveryStatistics />} />
      </Route>


      {/* Unauthorized Route */}
      <Route 
        path="/unauthorized" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
              <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        } 
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
