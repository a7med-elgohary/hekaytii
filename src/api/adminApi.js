import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5267') + '/api/v1';
const ADMIN_API = `${API_BASE_URL}/admin/Admin`;
const AUTH_API = `${API_BASE_URL}/common/Auth`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🍪 This is CRITICAL for HttpOnly Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle Token Refresh and Security Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛡️ Security: Handle 401 Unauthorized (Expired Session)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log("Session expired, attempting silent refresh...");
        await axios.post(`${AUTH_API}/refresh-token`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        localStorage.removeItem('admin_user');
        window.location.href = '/admin?session=expired';
      }
    }

    // 🛡️ Security: Handle 403 Forbidden (Unauthorized Action)
    if (error.response?.status === 403) {
        console.error('Access denied: Unauthorized action.');
        // Optional: Redirect to a "Forbidden" page or logout
        localStorage.removeItem('admin_user');
        window.location.href = '/admin?error=unauthorized';
    }
    
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: (credentials) => api.post(`${AUTH_API}/login`, credentials).then(res => res.data),
  logout: () => api.post(`${AUTH_API}/logout`).then(res => {
    localStorage.removeItem('admin_user');
    window.location.href = '/admin';
    return res.data;
  }),

  // Users
  getUsers:   () => api.get(`${ADMIN_API}/users`).then(res => res.data),
  deleteUser: (id) => api.delete(`${ADMIN_API}/users/${id}`).then(res => res.data),

  // Stats & Dashboard
  getStats:    () => api.get(`${ADMIN_API}/stats`).then(res => res.data),
  getOrders:   () => api.get(`${ADMIN_API}/all-orders`).then(res => res.data),
  getHealth:   () => api.get(`${ADMIN_API}/health`).then(res => res.data),
  getActivity: () => api.get(`${ADMIN_API}/activity`).then(res => res.data),
  getAnalytics:() => api.get(`${ADMIN_API}/analytics`).then(res => res.data),
  getWeekStats:() => api.get(`${ADMIN_API}/week-stats`).then(res => res.data),

  // Settings
  getSettings:    ()         => api.get(`${ADMIN_API}/settings`).then(res => res.data),
  updateSettings: (settings) => api.post(`${ADMIN_API}/update-settings`, settings).then(res => res.data),

  // Orders Management
  updateOrderStatus: (id, status) => api.post(`${ADMIN_API}/update-order-status/${id}?status=${encodeURIComponent(status)}`).then(res => res.data),

  // Vault (Financials)
  getVaultData: () => api.get(`${ADMIN_API}/vault-data`).then(res => res.data),
  addManualCheck: (check) => api.post(`${ADMIN_API}/add-manual-check`, check).then(res => res.data),
  updatePaymentStatus: (id, status) => api.post(`${ADMIN_API}/update-payment-status/${id}?status=${encodeURIComponent(status)}`).then(res => res.data),
  seedData: () => api.post(`${ADMIN_API}/seed-data`).then(res => res.data),
};

export default adminApi;
