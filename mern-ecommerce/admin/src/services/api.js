import axios from 'axios';
const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
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
  if (error.response?.status === 401 && !request?.url?.includes('/auth/')) {
    clearCsrfToken(); window.dispatchEvent(new Event('yanoben:session-expired'));
  }
  return Promise.reject(error);
});
export const mediaUrl = value => value?.startsWith('/uploads/') ? `${API_ROOT}${value}` : value;
export const authAPI = {
  password: async data => { const result = await api.post('/auth/password', data); clearCsrfToken(); return result; },
  me: () => api.get('/auth/me'),
  login: async (email, password) => { const result = await api.post('/auth/login', { email, password }); clearCsrfToken(); return result; },
  logout: async () => { const result = await api.post('/auth/logout'); clearCsrfToken(); return result; },
};
const resource = name => ({
  getAll: (params, config = {}) => api.get(`/${name}/manage`, { ...config, params }),
  create: data => api.post(`/${name}`, data), update: (id, data) => api.put(`/${name}/${id}`, data), delete: id => api.delete(`/${name}/${id}`),
});
export const productsAPI = resource('products');
export const offersAPI = resource('offers');
export const bannersAPI = resource('banners');
export const contactsAPI = {
  getAll: (params, config = {}) => api.get('/contacts', { ...config, params }),
  update: (id, data) => api.patch(`/contacts/${id}/status`, data),
  markAsRead: id => api.patch(`/contacts/${id}/read`), delete: id => api.delete(`/contacts/${id}`),
};
export const dashboardAPI = { getStats: config => api.get('/dashboard/stats', config) };
export const settingsAPI = {
  get: config => api.get('/settings', config), updateAbout: data => api.put('/settings/about', data),
  updatePolicies: data => api.put('/settings/policies', data), updateSite: data => api.put('/settings/site', data),
};
export const uploadAPI = { upload: file => { const form = new FormData(); form.append('image', file); return api.post('/upload', form); } };
export default api;
