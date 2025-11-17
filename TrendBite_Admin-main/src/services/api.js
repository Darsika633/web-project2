import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  // baseURL: "https://trendbite-api.onrender.com/api",
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/users/login", credentials),
  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  uploadAvatar: (formData) =>
    api.post("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAvatar: () => api.delete("/users/avatar"),
  changePassword: (data) => api.put("/users/change-password", data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users/register", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  activate: (id) => api.put(`/users/${id}/activate`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  delete: (id) => api.delete(`/users/${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, formData) =>
    api.post(`/products/${id}/upload-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteImage: (id, imageId) => api.delete(`/products/${id}/images/${imageId}`),
  updateImageOrder: (id, data) => api.put(`/products/${id}/images/order`, data),
  getLowStock: (params) => api.get("/products/low-stock", { params }),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updateShipping: (id, data) => api.put(`/orders/${id}/shipping`, data),
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),
  getStats: () => api.get("/orders/stats/overview"),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get("/categories", { params }),
  getTree: () => api.get("/categories/tree"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  uploadImage: (id, formData) =>
    api.post(`/categories/${id}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params) => api.get("/reviews", { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  getPending: (params) => api.get("/reviews/admin/pending", { params }),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  reject: (id, reason) => api.patch(`/reviews/${id}/reject`, { reason }),
  addReply: (id, data) => api.post(`/reviews/${id}/reply`, data),
};

// Discounts API
export const discountsAPI = {
  getAll: (params) => api.get("/discounts", { params }),
  getById: (id) => api.get(`/discounts/${id}`),
  create: (data) => api.post("/discounts", data),
  update: (id, data) => api.put(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
  toggleStatus: (id) => api.patch(`/discounts/${id}/toggle-status`),
  getStats: () => api.get("/discounts/stats"),
  getActive: (params) => api.get("/discounts/active", { params }),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get("/admin/dashboard/overview"),
  getRevenueOverview: () => api.get("/admin/dashboard/revenue-overview"),
  getRecentActivity: (params) =>
    api.get("/admin/dashboard/recent-activity", { params }),
  getOrderStatistics: () => api.get("/admin/dashboard/order-statistics"),
  getTopSellingProducts: (params) =>
    api.get("/admin/dashboard/top-selling-products", { params }),
  getCustomerAnalytics: () => api.get("/admin/dashboard/customer-analytics"),
};

// Delivery API
export const deliveryAPI = {
  // Admin endpoints
  assignOrder: (orderId, deliveryPersonId) =>
    api.post(`/delivery/orders/${orderId}/assign`, { deliveryPersonId }),
  getDeliveryPersons: (params) =>
    api.get("/delivery/delivery-persons", { params }),
  reassignOrder: (orderId, deliveryPersonId) =>
    api.put(`/delivery/orders/${orderId}/reassign`, { deliveryPersonId }),
  getDeliveryStats: (params) => api.get("/delivery/stats", { params }),
  deleteDeliveredOrders: (params) =>
    api.delete("/delivery/orders/delivered", { params }),
  getDeliveryPersonsWithRatings: (params) =>
    api.get("/orders/delivery-persons/ratings", { params }),
  getDeliveryPersonRatings: (deliveryPersonId, params) =>
    api.get(`/orders/delivery-ratings/${deliveryPersonId}`, { params }),

  // Delivery person endpoints
  getMyOrders: (params) => api.get("/delivery/my-orders", { params }),
  updateOrderStatus: (orderId, data) =>
    api.put(`/delivery/orders/${orderId}/status`, data),
  getOrderDetails: (orderId) => api.get(`/delivery/orders/${orderId}`),
};

// Inventory API
export const inventoryAPI = {
  // Dashboard and overview
  getDashboard: () => api.get("/admin/dashboard/inventory"),
  getOverview: (params) => api.get("/inventory/overview", { params }),
  getStatistics: () => api.get("/inventory/statistics"),
  getSummary: (params) => api.get("/inventory/summary", { params }),

  // Low stock and alerts
  getLowStock: (params) => api.get("/inventory/low-stock", { params }),
  getAlerts: (params) => api.get("/admin/inventory/alerts", { params }),

  // Reports
  getReports: (params) => api.get("/admin/inventory/reports", { params }),

  // Stock movements
  getProductMovements: (productId, params) =>
    api.get(`/inventory/products/${productId}/movements`, { params }),
  getVariantMovements: (variantId, params) =>
    api.get(`/inventory/variants/${variantId}/movements`, { params }),

  // Stock management
  updateStock: (productId, variantId, data) =>
    api.put(
      `/inventory/products/${productId}/variants/${variantId}/stock`,
      data
    ),
  transferStock: (fromVariantId, toVariantId, data) =>
    api.post(`/inventory/transfer/${fromVariantId}/${toVariantId}`, data),
  bulkUpdate: (data) => api.post("/inventory/bulk-update", data),

  // Stock reservations
  reserveStock: (productId, variantId, data) =>
    api.post(
      `/inventory/products/${productId}/variants/${variantId}/reserve`,
      data
    ),
  restoreStock: (productId, variantId, data) =>
    api.post(
      `/inventory/products/${productId}/variants/${variantId}/restore`,
      data
    ),
};

// Payments API
export const paymentsAPI = {
  // Admin endpoints
  getAll: (params) => api.get("/payments/admin/all", { params }),
  getStatistics: (params) => api.get("/payments/admin/statistics", { params }),
  getReports: (params) => api.get("/payments/admin/reports", { params }),
  getById: (paymentId) => api.get(`/payments/admin/${paymentId}`),
  markAsReceived: (paymentId, data) =>
    api.put(`/payments/admin/${paymentId}/mark-received`, data),
  updatePayment: (paymentId, data) =>
    api.put(`/payments/admin/${paymentId}/update`, data),

  // Delivery person endpoints
  getMyPayments: (params) =>
    api.get("/payments/delivery/my-payments", { params }),
  collectPayment: (paymentId, data) =>
    api.post(`/payments/delivery/${paymentId}/collect`, data),
  reportIssue: (paymentId, data) =>
    api.post(`/payments/delivery/${paymentId}/report-issue`, data),

  // General endpoints
  getOutstanding: () => api.get("/payments/outstanding"),
};

export default api;
