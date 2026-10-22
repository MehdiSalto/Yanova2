import { enqueueView } from './viewQueue';
import { publicGet } from './publicCatalog';
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
const sendLegacyViews = async events => {
  // Keep rolling deployments compatible while an older API is still serving.
  for (let start = 0; start < events.length; start += 5) {
    await Promise.all(events.slice(start, start + 5).map(({ productId, eventId }) =>
      api.post(`/products/${productId}/view`, { ...trackingInfo(), eventId }).catch(error => { if (error.response?.status !== 404) throw error; })));
  }
};
let legacyViews = false;
const sendViews = async (events, retry = true) => {
  if (legacyViews) return sendLegacyViews(events);
  const csrf = await fetchCsrfToken();
  const response = await fetch(`${API_ROOT}/api/clicks/views`, {
    method: 'POST', credentials: 'include', keepalive: true,
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify({ ...trackingInfo(), events }),
  });
  if ([404,405].includes(response.status)) { legacyViews = true; return sendLegacyViews(events); }
  if (!response.ok) {
    const data = await response.json();
    if (retry && data.code === 'INVALID_CSRF') { clearCsrfToken(); return sendViews(events, false); }
    throw new Error(data.message || 'Unable to record views.');
  }
};
export const productAPI = {
  getAll: (params, config = {}) => publicGet('/products', params, config), getOne: id => publicGet(`/products/${id}`),
  click: (id, device) => api.post(`/products/${id}/click`, { ...trackingInfo(), device }),
  view: (id, eventId) => enqueueView(id, eventId, sendViews),
};
export const offerAPI = {
  getAll: (params, config = {}) => publicGet('/offers', params, config, 10000),
  click: id => api.post(`/offers/${id}/click`, trackingInfo()),
};
export const bannerAPI = { getAll: config => publicGet('/banners', { limit: 100 }, config) };
export const contactAPI = { submit: data => api.post('/contacts', data) };
export const sponsorshipAPI = {
  getForm: config => api.get('/sponsorships/form', config),
  submit: data => api.post('/sponsorships', data),
};
export const settingsAPI = {
  get: config => publicGet('/settings', {}, config), updateAbout: data => api.put('/settings/about', data), updatePolicies: data => api.put('/settings/policies', data),
};
export const clickAPI = {
  registerVisit: (device, path, eventId) => api.post('/clicks/visit', { ...trackingInfo(), device, path, eventId }),
  heartbeat: path => api.post('/clicks/heartbeat', { ...trackingInfo(), path }),
};
export default api;

