const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { sendPublic, invalidatePublic, clearPublicCache } = require('../utils/publicCache');
beforeEach(clearPublicCache);
const request = (query = {}) => ({ path: '/', query });
const response = () => ({ headers: {}, set(key, value) { this.headers[key] = value; return this; }, json(value) { this.value = value; return this; } });
test('collapses concurrent public reads and isolates query variants and management', async () => {
  let queries = 0;
  const load = async () => { queries++; await new Promise(resolve => setTimeout(resolve, 10)); return { items: [{ name: 'Public' }] }; };
  await Promise.all(Array.from({ length: 20 }, () => sendPublic(request({ page: '1' }), response(), 'products', load)));
  assert.equal(queries, 1);
  await sendPublic(request({ page: '2' }), response(), 'products', load); assert.equal(queries, 2);
  const privateResult = response();
  await sendPublic({ ...request(), management: true }, privateResult, 'products', async () => ({ items: [{ name: 'Draft' }] }));
  assert.match(privateResult.headers['Cache-Control'], /private, no-store/);
  const publicResult = response(); await sendPublic(request({ page: '1' }), publicResult, 'products', load);
  assert.equal(publicResult.value.items[0].name, 'Public'); assert.equal(queries, 2);
});
test('invalidating a scope prevents in-flight stale data being cached', async () => {
  let release;
  const pending = sendPublic(request(), response(), 'products', () => new Promise(resolve => { release = resolve; }));
  await Promise.resolve(); invalidatePublic('products'); release({ items: ['old'] }); await pending;
  const fresh = response(); await sendPublic(request(), fresh, 'products', async () => ({ items: ['new'] }));
  assert.deepEqual(fresh.value.items, ['new']);
});
test('errors are not cached and offer cache cannot outlive expiry', async () => {
  await assert.rejects(sendPublic(request(), response(), 'products', async () => { throw Error('temporary'); }));
  const fresh = response(); await sendPublic(request(), fresh, 'products', async () => ({ items: ['recovered'] }));
  assert.deepEqual(fresh.value.items, ['recovered']);
  const offer = response(); await sendPublic(request(), offer, 'offers', async () => ({ items: [{ expiresAt: new Date(Date.now() + 1800) }] }), 10);
  assert(Number(offer.headers['X-Catalog-Expires']) <= Date.now() + 1800);
  assert(!/s-maxage=(?:[2-9]|\d{2,})/.test(offer.headers['Cache-Control']));
});
