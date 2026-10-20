# Yanoben admin analytics

The dashboard and each product report support **Numbers** and **Charts**. The
chosen display is remembered in this browser. Reports offer Today, 7, 30 and
90 days, and All time; period boundaries and chart dates use UTC. Product
reports are linked from Products and from the dashboard performance table.

## Image recommendations

| Image | Recommended dimensions | Aspect ratio |
| --- | --- | --- |
| Product main image and gallery | 1200 × 1200 px | 1:1 |
| Offer image | 1600 × 900 px | 16:9 |
| Hero banner beside the headline | 1200 × 1200 px | 1:1 |
| Top, middle and footer banner | 1600 × 500 px | 16:5 |

Hints appear inside the editor before uploading. The banner hint changes with
its selected position. Previews show actual dimensions and warn about different
ratios. These are recommendations, rather than mandatory upload dimensions.
The existing 5 MiB upload limit and server image normalization remain in effect.

## Metric definitions

- **Active visitors:** anonymous browser IDs seen in the preceding 120 seconds.
  Visible tabs send a heartbeat every 30 seconds. Tabs in one browser share a
  visitor ID, while retaining separate session IDs. Presence is stored in MongoDB
  and survives a process restart; stale presence expires independently of events.
- **Unique visitors:** distinct anonymous browser IDs in the selected period.
  Clearing storage or changing browsers can create another visitor. Legacy
  events fall back to their tab/session ID when a visitor ID is absent.
- **Country share:** unique visitors grouped by their latest recorded country in
  that period. Active and period country shares are separate. Country is derived
  at the Cloudflare edge; the proxy discards a client-supplied country header.
  Unknown includes historical events and requests without edge geolocation.
  No raw IP address is stored by the new analytics code.
- **Product view:** at least half the product card or featured-image area visible
  for one second in a visible tab. One event per product per page navigation,
  deduplicated across repeated instances of the same product on that page.
- **Unique product viewers:** distinct browser IDs that generated product views.
- **Buy Now outbound clicks:** clicks opening a product's external purchase link.
  The overview's outbound total also includes existing offer-link clicks. These
  events do not represent completed sales.

New product views and country data begin after deployment. Earlier product
views cannot be recovered. Authenticated administrators and recognizable bots
are excluded when their identity is available on the request. Separate frontend
origins do not share admin login cookies. No new identity/credential setup is
introduced by analytics. Tracking can be affected by blocked requests.

## API and deployment

- `POST /api/clicks/heartbeat`: validated, rate-limited, CSRF-protected presence.
- `POST /api/products/:id/view`: validated, rate-limited, CSRF-protected impression
  for an existing published product. Event IDs use the existing unique index.
- `GET /api/dashboard/active`: admin-only live snapshot with country shares.
- `GET /api/dashboard/analytics?range=30d&page=1&search=...`: admin-only overview.
- Add `productId=<id>` for an individual product's report.

Private responses are uncached. Reports refresh every 30 seconds while visible;
existing authenticated socket notifications can trigger earlier refreshes.
Deploy the backend, both frontend builds and their updated Pages Functions.
Existing database, API origins and project hostnames retain their connections.
No paid analytics service or extra API key is needed.

## Verification

`npm run test:integration` in backend runs the application/security and analytics
suites against disposable MongoDB, including deduplication, country attribution,
unknown/legacy data, expired presence, date filtering and product pagination.
`node --test cloudflare/proxy.test.mjs` verifies the proxy and trusted-country
forwarding. Both frontend production builds and local browser checks cover the
visitor-to-database-to-dashboard flow, view modes, period selection, individual
product reports, responsive layout and image hints.
