import { onRequest } from './proxy.mjs';

// Direct Upload entry; Git-based Pages builds use the equivalent functions/ routes.
export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (/^\/(api|uploads|socket\.io)(\/|$)/.test(path)) return onRequest({ request, env });
    return env.ASSETS.fetch(request);
  },
};
