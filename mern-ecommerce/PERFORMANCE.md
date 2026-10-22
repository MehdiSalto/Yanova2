# Catalog performance and image delivery

Implemented baseline: public origin cache, anonymous edge caching, browser request
coalescing, responsive Cloudinary delivery, batched impressions, and WebSocket
presence with an HTTP fallback. Existing authentication and private analytics
remain protected. No historical analytics or original image files are deleted.

## Cloudinary setup

Set these **backend-only Railway variables** together:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Do not put API secrets in React/Vite variables or commit them. With all three
unset, existing local uploads continue working. Partial configuration fails
closed. Configured uploads are validated by Sharp, stripped of input metadata,
rotated, bounded to 2560 × 2560 without upscaling, and encoded as WebP. Signed
uploads use unique public IDs and `overwrite=false`. MongoDB stores URLs and
small MediaAsset metadata documents; visitors fetch images directly from the CDN.

The storefront requests a small fixed set of responsive widths using `f_auto`,
`q_auto` and `c_limit`. The hero image is eager/high priority; other images are lazy.
External image URLs and existing local URLs continue working without transforms.

To migrate old images, first take a MongoDB backup and retain the upload volume.
Run **on the backend with access to that volume**:

```sh
npm run images:check
# Review missing files and counts before applying:
npm run images:migrate
```

The default is a read-only dry run. Apply uploads one image at a time, verifies
CDN delivery, saves a resumable mapping, and compares original fields before
updating references so concurrent admin edits are preserved. Originals remain
on disk. Absolute legacy upload URLs are accepted only for the configured
`API_PUBLIC_URL` origin; no arbitrary remote URLs are fetched. Public caches can
retain old URLs for up to one minute after this offline migration; originals
must stay available during that period. Restart the backend after migration.

## Cache rules and freshness

| Layer | Policy |
| --- | --- |
| Backend catalog | Products, settings and banners up to 60 seconds; offers up to 10 seconds and capped by returned offer expiry |
| Backend memory | At most 200 entries / 8 MiB; identical concurrent reads share one DB request pair |
| Browser | At most 100 catalog entries; identical pending reads share a request; cancellation is isolated per consumer |
| Cloudflare | Only allowlisted anonymous GET JSON, with explicit public origin headers; cookies, auth, errors, redirects, Set-Cookie and management bypass caching |
| Publishing | Relevant backend entries are cleared immediately; connected storefronts receive only a revision and refetch with a new cache key |

A new visitor can see the previous public revision until its edge TTL expires
(up to 60 seconds; offers up to 10). HTTP browser caching is disabled on proxy
responses; frontend entries honor the original catalog expiry. Never cache
CSRF, authentication, contacts, sponsorship enquiries, dashboards, mutations,
or Socket.IO. Caches are process/data-center local, not a distributed database.
Changing `CATALOG_CACHE_VERSION` on a Pages deployment rotates the edge namespace.

Edge cache hits still count as Pages Function/Worker requests. This change
reduces Railway/MongoDB load; it does **not** make the Workers request quota
unlimited. A future static catalog publication flow needs automatic snapshot
updates on every publish before it can safely replace live API reads. No static
snapshot with permanently stale products has been enabled.

## Analytics

Visible product impressions are deduplicated per navigation and batched (up to
25 per request) using keepalive fetch. The server validates the entire batch,
checks published product IDs once and uses unordered inserts so mixed retries
keep new events and ignore duplicate IDs. Signed CSRF and existing admin/bot
exclusion still apply. Outbound clicks retain immediate recording.

Visible visitors send presence over the existing Socket.IO connection every
60 seconds, throttled on the server. HTTP heartbeats are a fallback if the
socket is disconnected or its acknowledgement fails. The active window remains
120 seconds, and country attribution uses the trusted edge header. Private
admin refreshes are throttled to five seconds and paused in hidden tabs.

Raw historical events have **not** been deleted or converted to approximate
rollups. A retention period and unique-visitor requirements must be agreed
before changing that data lifecycle.

## Verification

```sh
npm run test:integration --prefix backend
CI=true npm test --prefix frontend -- --watch=false --runInBand
node --test cloudflare/proxy.test.mjs
npm run build --prefix frontend
npm run build --prefix admin
BASE_URL=http://127.0.0.1:5000 k6 run performance/catalog.k6.js
```

Run load tests first against a separate local/staging database. The checked-in
k6 scenario ramps from 5 to 20 virtual users over 25 seconds and checks published
JSON responses, failure rate, and p95 latency. It does not represent a measured
production capacity or a guarantee for 1,000 simultaneous shoppers.

Strix has not been run: it requires its own configured provider or signed-in
account. Existing contract/security tests cover auth, CSRF, private events,
draft isolation, image validation and cache exclusions; they are not a Strix
penetration-test result.

### Local k6 comparison (2026-10-22)

Same 25-second scenario, real isolated MongoDB 7.0.14, 40 seeded products
(30 published / 10 drafts), same machine and response payload. No production
traffic or Atlas credentials were used. Edge caching was not part of this test.

| Metric | Before | After |
| --- | ---: | ---: |
| Requests | 3,121 | 3,195 |
| Failed requests | 0 | 0 |
| p95 HTTP duration | 7.51 ms | 2.27 ms |
| Product find queries | 3,121 | 1 |
| Product count queries | 3,121 | 1 |

These timings are local measurements, not internet latency or hosting capacity.
The query reduction demonstrates reuse for one repeated catalog query during
one TTL. Different searches/pages create separate bounded cache entries.
