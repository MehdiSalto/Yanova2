import { publicGet, invalidateCatalog } from './publicCatalog';
beforeEach(() => { invalidateCatalog('test'); global.fetch = jest.fn(); });
test('deduplicates catalog requests, omits cookies, and isolates searches', async () => {
  fetch.mockResolvedValue({ ok: true, status: 200, headers: new Headers(), json: async () => ({ items: ['result'] }) });
  const [a, b] = await Promise.all([publicGet('/products', { page: 1 }), publicGet('/products', { page: 1 })]);
  expect(fetch).toHaveBeenCalledTimes(1); expect(a).toEqual(b); expect(fetch.mock.calls[0][1].credentials).toBe('omit');
  await publicGet('/products', { page: 2 }); expect(fetch).toHaveBeenCalledTimes(2);
  invalidateCatalog('published'); await publicGet('/products', { page: 1 }); expect(fetch).toHaveBeenCalledTimes(3);
});
test('cancelling one consumer does not cancel another consumer or cache errors', async () => {
  let complete; fetch.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  const controller = new AbortController();
  const a = publicGet('/settings', {}, { signal: controller.signal });
  const b = publicGet('/settings');
  const failure = expect(a).rejects.toMatchObject({ name: 'AbortError' }); controller.abort();
  complete({ ok: true, status: 200, headers: new Headers(), json: async () => ({ siteInfo: {} }) });
  await failure; expect((await b).data).toEqual({ siteInfo: {} }); expect(fetch).toHaveBeenCalledTimes(1);
  fetch.mockRejectedValueOnce(new Error('offline')); await expect(publicGet('/banners')).rejects.toThrow('offline');
  fetch.mockResolvedValueOnce({ ok: true, status: 200, headers: new Headers(), json: async () => ({ items: [] }) });
  await expect(publicGet('/banners')).resolves.toMatchObject({ data: { items: [] } });
});
