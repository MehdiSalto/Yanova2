import { trackingInfo } from './tracking';
import axios from 'axios';
const API_ROOT = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
const options = { baseURL: `${API_ROOT}/api`, withCredentials: true };
const api = axios.create(options);
const tokenClient = axios.create(options);
let token = null;
let tokenRequest = null;
export const clearCsrfToken = () => { token = null; tokenRequest = null; };
export const fetchCsrfToken = async () => {
  if (token) return token;
  if (!tokenRequest) tokenRequest = tokenClient.get('/csrf-token').then(({ data }) => { token = data.csrfToken; return token; }).finally(() => { tokenRequest = null; });
  return tokenRequest;
};
api.interceptors.request.use(async (config) => {
  if (['post','put','patch','delete'].includes(config.method)) config.headers['X-CSRF-Token'] = await fetchCsrfToken();
  return config;
});
api.interceptors.response.use(response => response, async (error) => {
  const request = error.config;
  if (request && error.response?.data?.code === 'INVALID_CSRF' && !request._csrfRetry) {
    request._csrfRetry = true; clearCsrfToken(); return api(request);
  }
  return Promise.reject(error);
});
export const mediaUrl = value => value?.startsWith('/uploads/') ? `${API_ROOT}${value}` : value;
export const productAPI = {
  getAll: (params, config = {}) => api.get('/products', { ...config, params }), getOne: id => api.get(`/products/${id}`),
  click: (id, device) => api.post(`/products/${id}/click`, { ...trackingInfo(), device }),
};
export const offerAPI = {
  getAll: (params, config = {}) => api.get('/offers', { ...config, params }),
  click: id => api.post(`/offers/${id}/click`, trackingInfo()),
};
export const bannerAPI = { getAll: config => api.get('/banners', { ...config, params: { limit: 100 } }) };
export const contactAPI = { submit: data => api.post('/contacts', data) };
export const settingsAPI = {
  get: config => api.get('/settings', config), updateAbout: data => api.put('/settings/about', data), updatePolicies: data => api.put('/settings/policies', data),
};
export const clickAPI = { registerVisit: (device, path, eventId) => api.post('/clicks/visit', { ...trackingInfo(), device, path, eventId }) };
export default api;
