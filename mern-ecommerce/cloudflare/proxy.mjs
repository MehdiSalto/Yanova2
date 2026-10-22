const unavailable = (status, code) => Response.json({
  message: 'The service is not available yet. Please try again later.', code,
}, { status, headers: { 'Cache-Control': 'no-store' } });

// Only these API/media/socket paths invoke a Pages Function. UI files remain
// static. Configure BACKEND_URL as an HTTPS origin after deploying Express.
export async function onRequest({ request, env, waitUntil }) {
  if (!env.BACKEND_URL) return unavailable(503, 'BACKEND_NOT_CONFIGURED');
  const incoming = new URL(request.url);
  let backend;
  try { backend = new URL(env.BACKEND_URL); }
  catch { return unavailable(503, 'BACKEND_CONFIGURATION_INVALID'); }
  if (backend.protocol !== 'https:' || backend.username || backend.password ||
      backend.pathname !== '/' || backend.search || backend.hash || backend.origin === incoming.origin) {
    return unavailable(503, 'BACKEND_CONFIGURATION_INVALID');
  }
  // An allowlist, never a blanket /api cache. Cookies and auth always bypass it.
  const publicPath = /^\/api\/(products(?:\/[a-f0-9]{24})?|offers|banners|settings)$/.test(incoming.pathname);
  const origin = request.headers.get('Origin');
  const eligible = request.method === 'GET' && publicPath && (!origin || origin === incoming.origin) && !request.headers.has('Cookie') && !request.headers.has('Authorization') && !request.headers.has('Range');
  const cache = eligible ? globalThis.caches?.default : null;
  const cacheUrl = new URL(incoming);
  cacheUrl.searchParams.sort();
  // Separate deployments/upstreams and schema versions without a global purge.
  cacheUrl.searchParams.set('__cache', `v1:${backend.host}:${env.CATALOG_CACHE_VERSION || ''}`);
  const cacheKey = new Request(cacheUrl, { method: 'GET' });
  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const result = new Response(cached.body, cached);
        result.headers.set('X-Edge-Cache', 'HIT');
        result.headers.set('Cache-Control', 'no-store');
        return result;
      }
    } catch { /* Cache outages must not break the catalog. */ }
  }
  const target = new URL(backend.origin);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  const forwarded = new Request(target, request);
  forwarded.headers.delete('host');
  forwarded.headers.delete('forwarded');
  forwarded.headers.delete('x-forwarded-host');
  forwarded.headers.delete('x-forwarded-for');
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) forwarded.headers.set('X-Forwarded-For', clientIp);
  // Derive geography at the edge. Discard any country supplied by the client.
  forwarded.headers.delete('x-yanoben-country');
  const country = request.cf?.country;
  if (typeof country === 'string' && /^[A-Z]{2}$/.test(country)) forwarded.headers.set('X-Yanoben-Country', country);
  try {
    const response = await fetch(forwarded, { redirect: 'manual' });
    // Preserve the native WebSocket upgrade response without reconstructing it.
    if (response.status === 101) return response;
    const result = new Response(response.body, response);
    const control = result.headers.get('Cache-Control') || '';
    const ttl = Number(control.match(/(?:^|,)\s*s-maxage=(\d+)/i)?.[1] || 0);
    const publicResponse = eligible && response.status === 200 && /\bpublic\b/i.test(control) && ttl > 0 && !response.headers.has('Set-Cookie') && /application\/json/i.test(response.headers.get('Content-Type') || '') && !/\*/.test(response.headers.get('Vary') || '');
    // Cross-origin CORS headers must never be reused for a different origin.
    if (publicResponse) {
      result.headers.delete('Access-Control-Allow-Origin');
      result.headers.delete('Access-Control-Allow-Credentials');
      result.headers.delete('Vary');
      result.headers.set('X-Edge-Cache', cache ? 'MISS' : 'BYPASS');
      if (cache) {
        const stored = result.clone();
        stored.headers.set('Cache-Control', `public, max-age=${Math.min(ttl, 60)}`);
        const put = cache.put(cacheKey, stored).catch(() => {});
        if (waitUntil) waitUntil(put); else await put;
      }
      // The browser cache is managed by the catalog service, not shared HTTP.
      result.headers.set('Cache-Control', 'no-store');
    } else if (incoming.pathname.startsWith('/api') || incoming.pathname.startsWith('/socket.io')) {
      result.headers.set('Cache-Control', 'private, no-store');
    }
    return result;
  } catch { return unavailable(502, 'BACKEND_UNREACHABLE'); }
}

