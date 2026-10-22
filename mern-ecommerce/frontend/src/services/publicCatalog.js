const ROOT = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
const cache = new Map();
const inFlight = new Map();
const listeners = new Set();
let revision = '';
let generation = 0;
export const subscribeCatalog = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const catalogGeneration = () => generation;
export const invalidateCatalog = next => {
  revision = next || String(Date.now()); generation += 1; cache.clear();
  listeners.forEach(listener => listener());
};
const abortError = () => new DOMException('The request was cancelled.', 'AbortError');
const withSignal = (promise, signal) => {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  // Cancelling one component must not cancel a shared request used by another.
  return new Promise((resolve, reject) => {
    const abort = () => reject(abortError());
    signal.addEventListener('abort', abort, { once: true });
    promise.then(value => { if (!signal.aborted) resolve(value); }, reject).finally(() => signal.removeEventListener('abort', abort));
  });
};
export const publicGet = (path, params = {}, config = {}, ttl = 60000) => {
  const query = new URLSearchParams();
  Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') query.set(key, String(value)); });
  if (revision) query.set('_v', revision);
  const suffix = query.toString();
  const url = `${ROOT}/api${path}${suffix ? `?${suffix}` : ''}`;
  const current = generation;
  let promise;
  const entry = cache.get(url);
  if (entry?.expires > Date.now()) promise = Promise.resolve(entry.response);
  else {
    if (!inFlight.has(url)) {
      const request = fetch(url, { credentials: 'omit', headers: { Accept: 'application/json' } }).then(async response => {
        const data = await response.json();
        if (!response.ok) { const error = new Error(data.message || 'Unable to load catalog.'); error.response = { status: response.status, data }; throw error; }
        const result = { data, status: response.status };
        let lifetime = ttl;
        const expires = Number(response.headers.get('X-Catalog-Expires'));
        if (expires) lifetime = Math.min(lifetime, expires - Date.now());
        if (path === '/offers') for (const offer of data.items || []) if (offer.expiresAt) lifetime = Math.min(lifetime, new Date(offer.expiresAt).getTime() - Date.now());
        if (current === generation && lifetime > 0) {
          if (cache.size >= 100) cache.delete(cache.keys().next().value);
          cache.set(url, { response: result, expires: Date.now() + lifetime });
        }
        return result;
      }).finally(() => inFlight.delete(url));
      inFlight.set(url, request);
    }
    promise = inFlight.get(url);
  }
  return withSignal(promise, config.signal);
};
