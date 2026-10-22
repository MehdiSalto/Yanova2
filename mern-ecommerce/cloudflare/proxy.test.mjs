import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from './proxy.mjs';

const mockCache = context => {
  const entries = new Map();
  const previous = globalThis.caches;
  globalThis.caches = { default: { match: async request => entries.get(request.url)?.clone(), put: async (request, response) => { entries.set(request.url, response.clone()); } } };
  context.after(() => { if (previous) globalThis.caches = previous; else delete globalThis.caches; });
  return entries;
};
test('caches only anonymous public JSON and keeps distinct queries isolated', async context => {
  const entries = mockCache(context); let upstream = 0;
  context.mock.method(globalThis, 'fetch', async () => {
    upstream++;
    return Response.json({ items: [upstream] }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60', 'Access-Control-Allow-Origin': 'https://shop.pages.dev', Vary: 'Origin' } });
  });
  const read = (query, headers) => onRequest({ request: new Request(`https://shop.pages.dev/api/products?${query}`, { headers }), env: { BACKEND_URL: 'https://api.example.invalid' } });
  assert.equal((await read('page=1&limit=12')).headers.get('X-Edge-Cache'), 'MISS');
  const hit = await read('limit=12&page=1'); assert.equal(hit.headers.get('X-Edge-Cache'), 'HIT');
  assert.equal(upstream, 1); assert.equal(hit.headers.get('Cache-Control'), 'no-store'); assert(!hit.headers.has('Access-Control-Allow-Origin'));
  await read('page=2&limit=12'); assert.equal(upstream, 2); assert.equal(entries.size, 2);
  await read('page=1&limit=12', { Cookie: 'accessToken=private' });
  await read('page=1&limit=12', { Authorization: 'Bearer private' });
  assert.equal(upstream, 4); assert.equal(entries.size, 2);
});
test('never caches management, auth, cookies, errors, or unmarked JSON', async context => {
  const entries = mockCache(context);
  for (const route of ['/api/products/manage','/api/auth/me','/api/csrf-token','/api/dashboard/analytics']) {
    context.mock.method(globalThis, 'fetch', async () => Response.json({ private: true }, { headers: { 'Cache-Control': 'public, s-maxage=60' } }));
    const response = await onRequest({ request: new Request(`https://shop.pages.dev${route}`), env: { BACKEND_URL: 'https://api.example.invalid' } });
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  }
  for (const [status, headers] of [[200, { 'Set-Cookie': 'private=1', 'Cache-Control': 'public, s-maxage=60' }], [500, { 'Cache-Control': 'public, s-maxage=60' }], [200, {}]]) {
    context.mock.method(globalThis, 'fetch', async () => Response.json({}, { status, headers }));
    await onRequest({ request: new Request('https://shop.pages.dev/api/products'), env: { BACKEND_URL: 'https://api.example.invalid' } });
  }
  assert.equal(entries.size, 0);
});

test('unconnected API returns uncached JSON rather than the SPA shell', async () => {
  const result = await onRequest({ request: new Request('https://shop.pages.dev/api/products'), env: {} });
  assert.equal(result.status, 503);
  assert.match(result.headers.get('content-type'), /application\/json/);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal((await result.json()).code, 'BACKEND_NOT_CONFIGURED');
});

test('rejects insecure, credential-bearing, path-based and recursive origins', async () => {
  for (const BACKEND_URL of ['not a url', 'http://api.example.invalid', 'https://user:password@api.example.invalid', 'https://api.example.invalid/api', 'https://shop.pages.dev']) {
    const result = await onRequest({ request: new Request('https://shop.pages.dev/api/auth/me'), env: { BACKEND_URL } });
    assert.equal(result.status, 503);
    assert.equal((await result.json()).code, 'BACKEND_CONFIGURATION_INVALID');
  }
});

test('forwards POST body, CSRF and cookies while keeping the configured upstream', async (context) => {
  let forwarded;
  context.mock.method(globalThis, 'fetch', async request => {
    forwarded = request;
    return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'accessToken=test; HttpOnly; Secure; SameSite=Lax' } });
  });
  const request = new Request('https://shop.pages.dev/api/contacts?next=https://other.invalid', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'yanobenCsrfSeed=fixture', 'X-CSRF-Token': 'signed-fixture', Origin: 'https://shop.pages.dev', 'X-Forwarded-For': 'spoofed', 'CF-Connecting-IP': '192.0.2.10' }, body: '{"message":"fixture message"}',
  });
  const result = await onRequest({ request, env: { BACKEND_URL: 'https://api.example.invalid' } });
  assert.equal(forwarded.url, 'https://api.example.invalid/api/contacts?next=https://other.invalid');
  assert.equal(forwarded.headers.get('Cookie'), 'yanobenCsrfSeed=fixture');
  assert.equal(forwarded.headers.get('X-CSRF-Token'), 'signed-fixture');
  assert.equal(forwarded.headers.get('Origin'), 'https://shop.pages.dev');
  assert.equal(forwarded.headers.get('X-Forwarded-For'), '192.0.2.10');
  assert.equal(await forwarded.text(), '{"message":"fixture message"}');
  assert.match(result.headers.get('set-cookie'), /HttpOnly; Secure/);
  assert.equal(result.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(await result.json(), { ok: true });
});

test('keeps uploaded-image bytes and upstream image caching', async (context) => {
  const bytes = new Uint8Array([82, 73, 70, 70, 0, 1, 2]);
  context.mock.method(globalThis, 'fetch', async () => new Response(bytes, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } }));
  const result = await onRequest({ request: new Request('https://shop.pages.dev/uploads/image.webp'), env: { BACKEND_URL: 'https://api.example.invalid/' } });
  assert.deepEqual(new Uint8Array(await result.arrayBuffer()), bytes);
  assert.match(result.headers.get('cache-control'), /immutable/);
});

test('preserves native WebSocket upgrade responses', async (context) => {
  const upgrade = { status: 101, webSocket: { marker: true } };
  context.mock.method(globalThis, 'fetch', async () => upgrade);
  assert.equal(await onRequest({ request: new Request('https://shop.pages.dev/socket.io/?transport=websocket'), env: { BACKEND_URL: 'https://api.example.invalid' } }), upgrade);
});

test('upstream failures become generic uncached JSON', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => { throw new Error('private upstream detail'); });
  const result = await onRequest({ request: new Request('https://shop.pages.dev/api/products'), env: { BACKEND_URL: 'https://api.example.invalid' } });
  assert.equal(result.status, 502);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  const text = await result.text();
  assert.match(text, /BACKEND_UNREACHABLE/);
  assert(!text.includes('private upstream detail'));
});


test('overwrites browser-supplied geography with trusted edge country', async context => {
  let forwarded;
  context.mock.method(globalThis, 'fetch', async request => { forwarded = request; return new Response('{}'); });
  const request = new Request('https://shop.pages.dev/api/clicks/heartbeat', { headers: { 'X-Yanoben-Country': 'US' } });
  Object.defineProperty(request, 'cf', { value: { country: 'MA' } });
  await onRequest({ request, env: { BACKEND_URL: 'https://api.example.invalid' } });
  assert.equal(forwarded.headers.get('X-Yanoben-Country'), 'MA');
  await onRequest({ request: new Request('https://shop.pages.dev/api/products', { headers: { 'X-Yanoben-Country': 'US' } }), env: { BACKEND_URL: 'https://api.example.invalid' } });
  assert.equal(forwarded.headers.has('X-Yanoben-Country'), false);
});
