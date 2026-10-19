const unavailable = (status, code) => Response.json({
  message: 'The service is not available yet. Please try again later.', code,
}, { status, headers: { 'Cache-Control': 'no-store' } });

// Only these API/media/socket paths invoke a Pages Function. UI files remain
// static. Configure BACKEND_URL as an HTTPS origin after deploying Express.
export async function onRequest({ request, env }) {
  if (!env.BACKEND_URL) return unavailable(503, 'BACKEND_NOT_CONFIGURED');
  const incoming = new URL(request.url);
  let backend;
  try { backend = new URL(env.BACKEND_URL); }
  catch { return unavailable(503, 'BACKEND_CONFIGURATION_INVALID'); }
  if (backend.protocol !== 'https:' || backend.username || backend.password ||
      backend.pathname !== '/' || backend.search || backend.hash || backend.origin === incoming.origin) {
    return unavailable(503, 'BACKEND_CONFIGURATION_INVALID');
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
  try {
    const response = await fetch(forwarded, { redirect: 'manual' });
    // Preserve the native WebSocket upgrade response without reconstructing it.
    if (response.status === 101) return response;
    const result = new Response(response.body, response);
    if (incoming.pathname.startsWith('/api') || incoming.pathname.startsWith('/socket.io')) {
      result.headers.set('Cache-Control', 'private, no-store');
    }
    return result;
  } catch { return unavailable(502, 'BACKEND_UNREACHABLE'); }
}
