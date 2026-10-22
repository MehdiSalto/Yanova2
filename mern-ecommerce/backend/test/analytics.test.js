const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'isolated-analytics-test-secret-only-0123456789';
const { createDatabase } = require('./helpers/database');
const createApp = require('../app');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Click = require('../models/Click');
const VisitorSession = require('../models/VisitorSession');
const { generateAccessToken } = require('../utils/generateTokens');
let db, server, origin, adminJar;
const jarHeader = jar => Object.entries(jar).map(([k,v]) => `${k}=${v}`).join('; ');
const receive = (response, jar) => { for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(';')[0]; const i = pair.indexOf('='); jar[pair.slice(0,i)] = pair.slice(i+1); } };
async function request(route, { method = 'GET', data, jar = adminJar, country, csrf = true, userAgent = 'AnalyticsTest/1.0' } = {}) {
  const headers = { 'User-Agent': userAgent };
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (country) headers['X-Yanoben-Country'] = country;
  if (method === 'POST' && csrf) {
    const response = await fetch(origin + '/api/csrf-token', { headers: { Cookie: jarHeader(jar) } }); receive(response, jar);
    headers['X-CSRF-Token'] = (await response.json()).csrfToken;
  }
  headers.Cookie = jarHeader(jar);
  const response = await fetch(origin + route, { method, headers, ...(data ? { body: JSON.stringify(data) } : {}) }); receive(response, jar);
  const text = await response.text(); let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body, headers: response.headers };
}
let sequence = 0;
const tracking = (visitor = 'a', session = visitor) => ({ device: 'desktop', visitorId: visitor.repeat(32), sessionId: session.repeat(32), eventId: String(++sequence).padStart(32, '0'), path: '/products' });
const product = (name = 'Analytics product', status = 'published') => Product.create({ name, description: 'A test product', price: 20, imageUrl: 'https://example.invalid/product.png', buyLink: 'https://example.invalid/buy', status });
describe('Visitor and product analytics with isolated MongoDB', { skip: process.env.YANOBEN_INTEGRATION !== 'true' }, () => {
  before(async () => { db = await createDatabase(); server = http.createServer(createApp()); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${server.address().port}`; });
  beforeEach(async () => { await db.reset(); sequence = 0; const admin = await Admin.create({ email: 'analytics@example.invalid', password: 'Local-only-password-7319', role: 'superadmin' }); adminJar = { accessToken: generateAccessToken(admin) }; });
  after(async () => { if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } await db?.close(); });
  it('protects private analytics and validates periods and product filters', async () => {
    for (const path of ['/api/dashboard/active', '/api/dashboard/analytics']) assert.equal((await request(path, { jar: {} })).status, 401);
    assert.equal((await request('/api/dashboard/analytics?range=invalid')).status, 400);
    assert.equal((await request('/api/dashboard/analytics?productId=bad')).status, 400);
    assert.equal((await request('/api/dashboard/analytics?productId=012345678901234567890123')).status, 404);
    const response = await request('/api/dashboard/analytics?range=7d');
    assert.equal(response.status, 200); assert.equal(response.body.totals.visitors, 0); assert.equal(response.body.series.length, 7);
    assert.match(response.headers.get('cache-control'), /no-store/);
  });
  it('counts a browser once across tabs and expires inactive presence without changing visits', async () => {
    assert.equal((await request('/api/clicks/heartbeat', { method: 'POST', jar: {}, data: tracking('a', 'x'), country: 'MA' })).status, 204);
    await request('/api/clicks/heartbeat', { method: 'POST', jar: {}, data: tracking('a', 'y'), country: 'MA' });
    await request('/api/clicks/heartbeat', { method: 'POST', jar: {}, data: tracking('b'), country: 'FR' });
    const active = (await request('/api/dashboard/active')).body;
    assert.equal(active.total, 2); assert.deepEqual(active.countries.map(row => row.percentage), [50, 50]);
    assert.equal(await Click.countDocuments(), 0);
    await VisitorSession.updateOne({ visitorId: 'a'.repeat(32) }, { $set: { lastSeen: new Date(Date.now() - 121000) } });
    assert.equal((await request('/api/dashboard/active')).body.total, 1);
  });
  it('deduplicates visible impressions and outbound clicks; excludes admin, drafts and bots', async () => {
    const published = await product(); const draft = await product('Draft product', 'draft'); const event = tracking();
    const path = `/api/products/${published._id}/view`;
    assert.equal((await request(path, { method: 'POST', jar: {}, data: event, country: 'MA' })).status, 201);
    assert.equal((await request(path, { method: 'POST', jar: {}, data: event, country: 'MA' })).body.duplicate, true);
    const click = tracking(); const clickPath = `/api/products/${published._id}/click`;
    assert.equal((await request(clickPath, { method: 'POST', jar: {}, data: click })).body.clickCount, 1);
    assert.equal((await request(clickPath, { method: 'POST', jar: {}, data: click })).body.duplicate, true);
    assert.equal((await request(path, { method: 'POST', data: tracking() })).status, 204);
    assert.equal((await request(path, { method: 'POST', jar: {}, data: tracking(), userAgent: 'Googlebot' })).status, 204);
    assert.equal((await request(`/api/products/${draft._id}/view`, { method: 'POST', jar: {}, data: tracking() })).status, 404);
    assert.equal((await request(path, { method: 'POST', jar: {}, data: tracking(), csrf: false })).status, 403);
    assert.equal(await Click.countDocuments({ type: 'product_view' }), 1);
    assert.equal((await Product.findById(published._id)).clickCount, 1);
  });
  it('batches published product impressions, deduplicates mixed retries, and validates bounds', async () => {
    const p = await product(); const draft = await product('Private draft', 'draft');
    const first = tracking(), second = tracking();
    const post = (events, extra = {}) => request('/api/clicks/views', { method: 'POST', jar: {}, country: 'MA', data: { ...tracking(), events }, ...extra });
    const events = [{ productId: String(p._id), eventId: first.eventId }, { productId: String(draft._id), eventId: tracking().eventId }];
    assert.equal((await post(events)).status, 201);
    assert.equal((await post([...events, { productId: String(p._id), eventId: second.eventId }])).status, 201);
    assert.equal(await Click.countDocuments({ type: 'product_view' }), 2);
    assert.equal(await Click.countDocuments({ refId: draft._id }), 0);
    assert.equal(await Click.countDocuments({ country: 'MA' }), 2);
    assert.equal((await post(Array.from({ length: 26 }, () => events[0]))).status, 400);
    assert.equal((await post([{ productId: 'invalid', eventId: first.eventId }])).status, 400);
    assert.equal((await post(events, { csrf: false })).status, 403);
    assert.equal((await post(events, { jar: adminJar })).status, 204);
    assert.equal((await post(events, { userAgent: 'Googlebot' })).status, 204);
  });
  it('calculates unique visitors, latest-country attribution, percentages and filtered product views', async () => {
    const p = await product(); const other = await product('Zero traffic product');
    const event = async (type, visitor, country, age = 0, refId = null) => Click.create({ ...tracking(visitor), type, country, ...(refId ? { refId } : {}), createdAt: new Date(Date.now() - age) });
    await event('visit', 'a', 'MA', 2000); await event('visit', 'a', 'FR', 1000); await event('visit', 'b', 'MA', 1000);
    await event('visit', 'c', 'US', 200 * 86400000);
    await event('product_view', 'a', 'FR', 1000, p._id); await event('product_view', 'a', 'FR', 500, p._id);
    await event('product_click', 'a', 'FR', 500, p._id); await event('offer_click', 'b', 'MA', 500, other._id);
    const result = (await request('/api/dashboard/analytics?range=7d')).body;
    assert.equal(result.totals.visitors, 2); assert.equal(result.totals.pageViews, 3); assert.equal(result.totals.productViews, 2); assert.equal(result.totals.uniqueProductViewers, 1); assert.equal(result.totals.outboundClicks, 2);
    assert.deepEqual(Object.fromEntries(result.countries.map(row => [row.code, row.visitors])), { FR: 1, MA: 1 });
    assert.equal(result.countries.reduce((sum, row) => sum + row.percentage, 0), 100);
    const row = result.products.items.find(item => item._id === String(p._id)); assert.equal(row.views, 2); assert.equal(row.uniqueViewers, 1); assert.equal(row.outboundClicks, 1);
    const empty = result.products.items.find(item => item._id === String(other._id)); assert.equal(empty.views, 0); assert.equal(empty.outboundClicks, 0);
    const detail = (await request(`/api/dashboard/analytics?range=7d&productId=${p._id}`)).body;
    assert.equal(detail.totals.visitors, 1); assert.equal(detail.totals.outboundClicks, 1); assert.equal(detail.countries[0].code, 'FR'); assert.equal(detail.products.items.length, 1);
    assert.equal((await request('/api/dashboard/analytics?range=all')).body.totals.visitors, 3);
  });
  it('keeps legacy sessions and missing countries visible and validates tracking input', async () => {
    const legacy = tracking(); delete legacy.visitorId;
    await Click.create({ ...legacy, type: 'visit' });
    await request('/api/clicks/visit', { method: 'POST', jar: {}, data: tracking('b'), country: 'not-a-country' });
    const result = (await request('/api/dashboard/analytics?range=today')).body;
    assert.equal(result.totals.visitors, 2); assert.equal(result.countries[0].code, 'ZZ'); assert.equal(result.countries[0].percentage, 100);
    assert.equal((await request('/api/clicks/heartbeat', { method: 'POST', jar: {}, data: { ...tracking(), visitorId: '$bad' } })).status, 400);
    assert.equal((await request('/api/clicks/heartbeat', { method: 'POST', jar: {}, data: { ...tracking(), path: '//external.invalid' } })).status, 400);
  });
  it('paginates all products including drafts and escapes product-name searches', async () => {
    for (let i = 0; i < 23; i++) await product(`Product ${i}`, 'draft');
    await product('Specific [product]');
    const first = (await request('/api/dashboard/analytics')).body; const second = (await request('/api/dashboard/analytics?page=2')).body;
    assert.equal(first.products.items.length, 20); assert.equal(second.products.items.length, 4); assert.equal(first.products.pagination.total, 24);
    const filtered = (await request('/api/dashboard/analytics?search=%5Bproduct%5D')).body;
    assert.equal(filtered.products.items.length, 1); assert.equal(filtered.products.items[0].name, 'Specific [product]');
  });
});
