import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from './proxy.mjs';

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
