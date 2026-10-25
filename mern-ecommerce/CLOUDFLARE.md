# Independent Cloudflare Pages frontends

Both frontends are published as separate Direct Upload Pages projects. Their
source is kept in the same GitHub repository on `main`. The Cloudflare Git
installation rejected the initial repository connection, so Git auto-deploy is
not enabled. A Git push alone does not redeploy these two projects.

- Client: https://yanova-client-mehdisalto.pages.dev
- Admin login: https://yanova-admin-mehdisalto.pages.dev/login

The table below also records settings for a future Git connection.

| Setting | Client | Admin |
| --- | --- | --- |
| Repository root directory | `mern-ecommerce/frontend` | `mern-ecommerce/admin` |
| Build command | `npm run build` | `npm run build` |
| Build output | `build` | `dist` |
| `NODE_VERSION` | `22` | `22` |
| `VITE_BASE_PATH` | n/a | `/` |

Leave `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL` and `VITE_API_URL` empty for
the same-origin proxy. Admin login on its independent origin is `/login`.
The default Vite base is `/` for independent hosting. The root integrated build
explicitly sets `/admin/` when it builds the admin bundle for Node hosting.
For a manual integrated admin build, set `VITE_BASE_PATH=/admin/`.
Before uploading, verify every script and stylesheet referenced by `dist/index.html`
exists at its corresponding public path; a successful build alone does not prove
that the bundle will load on a separately hosted origin.

Pages Functions route only `/api`, `/uploads` and `/socket.io` to Express.
Until `BACKEND_URL` is configured, these paths return JSON 503 instead of SPA
HTML, keeping the static UI usable without claiming the service is connected.
The deployed API origin is https://yanova2-production.up.railway.app.
The display brand is YANOBEN. Existing project hostnames and the configured
production database name are kept to retain their connections.

After the backend is online, set `BACKEND_URL` to its HTTPS origin, without an
API path, in both Pages projects' production and preview environments. Redeploy
to apply it. It is a Pages Function environment variable, not a browser bundle
secret. Do not put database URIs or signing keys in any frontend variable.

The backend must allow both Pages origins in `CLIENT_URLS`, use secure cookies,
and configure the actual trusted proxy hop count and persistent uploads. The
proxy forwards HTTP bodies/cookies and WebSocket upgrade responses. Full login,
CSRF, uploads and Socket.IO must be verified against the deployed backend.
Separate frontend hostnames have separate browser cookie jars; shared admin
traffic exclusion across both origins needs a deliberate authentication/domain
design when integrating the backend. No domain-wide cookies are added here.

If deploying by Direct Upload, build from the above roots and bundle the
Functions with Wrangler before uploading. Keep all source/config changes in
GitHub; generated `build` and `dist` outputs stay untracked.

Deployment checks (20 October 2026): both production frontend builds, 14
backend contract/security tests (including saved-brand migration), and six proxy
tests pass. Browser checks cover the default light theme, dark-theme persistence,
search requests/clearing, absent client admin links, and phone-only scaling.
Local browser checks use fixture product data; deployed checks use the real API.
Run `node --test cloudflare/proxy.test.mjs` from the application root.
