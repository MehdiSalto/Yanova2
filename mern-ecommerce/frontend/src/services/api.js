import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach CSRF token to mutating requests
let csrfToken = null;
export const fetchCsrfToken = async () => {
  const { data } = await api.get('/csrf-token');
  csrfToken = data.csrfToken;
  return csrfToken;
};

api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method) && csrfToken) {
    config.headers['CSRF-Token'] = csrfToken;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const productAPI = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  click: (id, device) => api.post(`/products/${id}/click`, { device }),
};

export const offerAPI = {
  getAll: () => api.get('/offers'),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

export const bannerAPI = {
  getAll: () => api.get('/banners'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

export const contactAPI = {
  submit: (data) => api.post('/contacts', data),
  getAll: () => api.get('/contacts'),
  markAsRead: (id) => api.patch(`/contacts/${id}/read`),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  updateAbout: (data) => api.put('/settings/about', data),
  updatePolicies: (data) => api.put('/settings/policies', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const clickAPI = {
  registerVisit: (device, path) => api.post('/clicks/visit', { device, path }),
};

export const uploadAPI = {
  upload: (formData) =>
    api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;
