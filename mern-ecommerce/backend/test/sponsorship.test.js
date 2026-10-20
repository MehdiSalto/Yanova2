const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'local-sponsorship-tests-only-secret-0123456789';
const { createDatabase } = require('./helpers/database');
const createApp = require('../app');
const Admin = require('../models/Admin');
const Sponsorship = require('../models/Sponsorship');
const { fields } = require('../config/sponsorshipForm');
const { sponsorshipLimiter } = require('../middleware/security');
const { generateAccessToken } = require('../utils/generateTokens');
let db, server, origin, owner;
const receive = (response, jar) => { for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(';')[0]; const at = pair.indexOf('='); jar[pair.slice(0, at)] = pair.slice(at + 1); } };
const cookies = jar => Object.entries(jar).map(([k,v]) => `${k}=${v}`).join('; ');
async function request(route, { method = 'GET', data, jar = {}, csrf = true, headers = {} } = {}) {
  if (!['GET', 'HEAD'].includes(method) && csrf) {
    const response = await fetch(origin + '/api/csrf-token', { headers: { Cookie: cookies(jar) } }); receive(response, jar);
    headers['X-CSRF-Token'] = (await response.json()).csrfToken;
  }
  const response = await fetch(origin + route, { method, headers: { Cookie: cookies(jar), ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
  receive(response, jar); const text = await response.text(); let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body, headers: response.headers };
}
const valid = overrides => ({ fullName: 'Campaign Manager', email: 'sponsor@example.invalid', promotedItem: 'A new collection of desk accessories.', campaignGoal: 'Introduce the collection to interested readers.', contactConsent: true, submissionId: 'a'.repeat(32), ...overrides });
describe('Advertising and sponsorship enquiries', () => {
  before(async () => { db = await createDatabase(); server = http.createServer(createApp()); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${server.address().port}`; });
  beforeEach(async () => { await db.reset(); sponsorshipLimiter.resetKey('127.0.0.1'); sponsorshipLimiter.resetKey('::ffff:127.0.0.1'); const admin = await Admin.create({ email: 'sponsorship-owner@example.invalid', password: 'Local-test-password-2781', role: 'superadmin' }); owner = { accessToken: generateAccessToken(admin) }; });
  after(async () => { if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } await db?.close(); });
  it('provides question labels above open answer fields without exposing private fields', async () => {
    const response = await request('/api/sponsorships/form');
    assert.equal(response.status, 200); assert.equal(response.body.groups.length, 6);
    const questions = response.body.groups.flatMap(group => group.fields);
    assert.equal(questions.length, 27); assert.equal(questions.filter(field => field.required).length, 4);
    for (const question of questions) { assert(question.label.endsWith('?')); assert(['text', 'textarea', 'email', 'tel', 'url'].includes(question.type)); }
    assert(!questions.some(field => ['internalNotes', 'status', 'submissionId'].includes(field.key)));
  });
  it('accepts the four essential answers and preserves open multilingual campaign details', async () => {
    const payload = valid({ companyName: 'New Brand', budget: '500 MAD, or please send me a quote', targetAudience: 'طلبة ومهنيين مهتمين بالتكنولوجيا', questions: 'What placements are available?\nCan you provide a quote?', duration: 'Flexible, perhaps two weeks', website: 'https://example.invalid' });
    const response = await request('/api/sponsorships', { method: 'POST', data: payload });
    assert.equal(response.status, 201); assert.deepEqual(Object.keys(response.body), ['message']);
    const stored = await Sponsorship.findOne();
    for (const key of ['budget', 'targetAudience', 'questions', 'duration']) assert.equal(stored[key], payload[key]);
    assert.equal(stored.status, 'new'); assert.equal(stored.contactConsent, true);
    const stats = await request('/api/dashboard/stats', { jar: owner }); assert.equal(stats.body.newSponsorships, 1);
  });
  it('requires valid essentials, contact permission and signed CSRF; rejects unsafe URLs and oversize answers', async () => {
    const invalid = [valid({ email: 'bad' }), valid({ fullName: '' }), valid({ campaignGoal: '' }), valid({ contactConsent: false }), valid({ website: 'javascript:alert(1)' }), valid({ questions: 'x'.repeat(6001) }), valid({ promotedItem: { $gt: '' } })];
    for (const data of invalid) assert.equal((await request('/api/sponsorships', { method: 'POST', data })).status, 400);
    assert.equal((await request('/api/sponsorships', { method: 'POST', data: valid(), csrf: false })).status, 403);
    assert.equal(await Sponsorship.countDocuments(), 0);
  });
  it('deduplicates a retried submission and ignores injected workflow or private fields', async () => {
    const data = valid({ status: 'approved', internalNotes: 'injected', createdAt: '2000-01-01', rogue: 'injected' });
    assert.equal((await request('/api/sponsorships', { method: 'POST', data })).status, 201);
    assert.equal((await request('/api/sponsorships', { method: 'POST', data })).status, 200);
    assert.equal(await Sponsorship.countDocuments(), 1);
    const item = await Sponsorship.findOne(); assert.equal(item.status, 'new'); assert.equal(item.internalNotes, ''); assert.equal(item.rogue, undefined); assert(item.createdAt.getFullYear() > 2000);
  });
  it('keeps saved enquiries private and requires authentication and CSRF for management', async () => {
    const item = await Sponsorship.create(valid());
    assert.equal((await request('/api/sponsorships')).status, 401);
    assert.equal((await request(`/api/sponsorships/${item._id}`, { method: 'PATCH', data: { status: 'reviewing' } })).status, 401);
    assert.equal((await request(`/api/sponsorships/${item._id}`, { method: 'PATCH', jar: owner, csrf: false, data: { status: 'reviewing' } })).status, 403);
    assert.equal((await request(`/api/sponsorships/${item._id}`, { method: 'DELETE' })).status, 401);
    const list = await request('/api/sponsorships', { jar: owner }); assert.equal(list.body.items.length, 1); assert.match(list.headers.get('cache-control'), /private.*no-store/);
  });
  it('supports review status, private notes, filters, dashboard counts and deletion', async () => {
    const item = await Sponsorship.create(valid({ companyName: 'Specific [brand]' }));
    const update = await request(`/api/sponsorships/${item._id}`, { method: 'PATCH', jar: owner, data: { status: 'reviewing', internalNotes: 'Discuss a two-week placement.', email: 'changed@example.invalid' } });
    assert.equal(update.status, 200); assert.equal(update.body.email, 'sponsor@example.invalid'); assert.equal(update.body.internalNotes, 'Discuss a two-week placement.');
    const list = await request('/api/sponsorships?status=reviewing&search=%5Bbrand%5D', { jar: owner }); assert.equal(list.body.pagination.total, 1);
    assert.equal((await request('/api/dashboard/stats', { jar: owner })).body.newSponsorships, 0);
    assert.equal((await request(`/api/sponsorships/${item._id}`, { method: 'PATCH', jar: owner, data: { status: 'invalid' } })).status, 400);
    assert.equal((await request(`/api/sponsorships/${item._id}`, { method: 'DELETE', jar: owner })).status, 200); assert.equal(await Sponsorship.countDocuments(), 0);
  });
  it('paginates enquiries and returns clear errors for invalid management identifiers', async () => {
    for (let i=0; i<23; i++) await Sponsorship.create(valid({ submissionId: i.toString(16).padStart(32, '0') }));
    const response = await request('/api/sponsorships?page=2&limit=20', { jar: owner }); assert.equal(response.body.items.length, 3); assert.equal(response.body.pagination.total, 23);
    assert.equal((await request('/api/sponsorships?status=invalid', { jar: owner })).status, 400);
    assert.equal((await request('/api/sponsorships/bad', { method: 'PATCH', jar: owner, data: { status: 'new' } })).status, 400);
    assert.equal((await request('/api/sponsorships/012345678901234567890123', { method: 'PATCH', jar: owner, data: { status: 'new' } })).status, 404);
  });
});
