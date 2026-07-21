import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // send admin auth cookies to the same backend server
});

// Attach CSRF token when present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('csrfToken');
  if (token) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

export const authAPI = {
  me: () => api.get('/auth/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const offersAPI = {
  getAll: () => api.get('/offers'),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

export const bannersAPI = {
  getAll: () => api.get('/banners'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  updateAbout: (data) => api.put('/settings/about', data),
  updatePolicies: (data) => api.put('/settings/policies', data),
};

export const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get('/csrf-token');
    if (data.csrfToken) localStorage.setItem('csrfToken', data.csrfToken);
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

export default api;
