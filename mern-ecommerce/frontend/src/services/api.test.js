import api, { productAPI } from './api';
jest.mock('axios', () => {
  const client = { get: jest.fn(), post: jest.fn(), interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } };
  return { create: () => client };
});
jest.mock('./tracking', () => ({ trackingInfo: () => ({ visitorId: 'v'.repeat(32), sessionId: 's'.repeat(32), eventId: 'e'.repeat(32), device: 'mobile' }) }));
jest.mock('./viewQueue', () => ({ enqueueView: (productId, eventId, send) => send([{ productId, eventId }]) }));
beforeEach(() => { global.fetch = jest.fn(); api.get.mockResolvedValue({ data: { csrfToken: 'fixture-token' } }); api.post.mockResolvedValue({ data: {} }); });
test('batches views using signed CSRF and keepalive delivery', async () => {
  fetch.mockResolvedValue({ ok: true, status: 201 });
  await productAPI.view('012345678901234567890123', 'event-012345678901234');
  const [url, config] = fetch.mock.calls[0];
  expect(url).toBe('/api/clicks/views'); expect(config.keepalive).toBe(true); expect(config.credentials).toBe('include');
  expect(config.headers['X-CSRF-Token']).toBe('fixture-token');
  expect(JSON.parse(config.body).events).toEqual([{ productId: '012345678901234567890123', eventId: 'event-012345678901234' }]);
});
test('uses existing per-product tracking when the deployed API is older', async () => {
  fetch.mockResolvedValue({ ok: false, status: 404 });
  await productAPI.view('012345678901234567890123', 'event-012345678901235');
  expect(api.post).toHaveBeenCalledWith('/products/012345678901234567890123/view', expect.objectContaining({ eventId: 'event-012345678901235' }));
  await productAPI.view('012345678901234567890123', 'event-012345678901236');
  expect(fetch).toHaveBeenCalledTimes(1);
});
