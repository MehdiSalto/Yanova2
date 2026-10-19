# Repair record — 19 October 2026

Version 1.1.0 implements the repair roadmap from the source audit. The preceding
file version preserves the original archive.

## Work completed

| Roadmap step | Changes |
| --- | --- |
| Complete source tree | Restored missing storefront src/public from the archive's Git snapshot; kept newer backend/admin files from the archive |
| Align admin/API | Canonical product/offer/banner forms; protected management lists; draft/date/active rules; contact PATCH routes; settings sections; pagination/search |
| Repair sessions | Expiring HttpOnly JWT cookies, password/session-version revocation, signed session-bound CSRF, 401 handling and removal of the nonexistent refresh flow |
| Validate requests/errors/images | Field allowlists, bounded fields/bodies/pagination, async error propagation, exact origins, rate limits, Multer 2, updated Sharp/Express/Engine.IO dependencies and image re-encoding |
| Repair analytics | Event-ID deduplication, visit/product/offer distinctions, admin exclusion, authenticated Socket.IO admin events and browser-tab presence |
| Repair storefront | Actual catalog/offers, editable content, all banner positions, working contact form, mobile admin navigation and functional links |
| Remove misleading placeholders | Removed fake testimonials/counts, fixed product prices, unsupported delivery/product promises, dead cart and fake newsletter/social actions |
| Reproducible operation | Four lockfiles, Node watch mode in place of nodemon, complete install/dev/build scripts, private generated configuration, safe examples, dual-frontend production serving and documentation |

Black/white/gold storefront and dark admin styling remain. Stock/colors/sizes
persist; stock does not reserve inventory. Offer codes are displayed for use
with the external seller. Contact replied status is manual, not email delivery.

## Contract changes

- Public lists show published products, currently valid published offers and
  active banners. Protected `/manage` lists include drafts/inactive records.
- Lists use `{ items, pagination }` with bounded page/limit/search; both clients
  were updated. External consumers of raw-array lists must adapt.
- Product fields include imageUrl/gallery/buyLink. Offers use
  imageUrl/offerLink/discountPercentage/ctaText and optional code/dates. Banners
  use imageUrl/linkUrl/position/active/order.
- Contacts use fullName/subject/status; read/status changes use PATCH.
- Site/About/policy sections save independently. Password changes verify the
  current password and revoke earlier sessions.
- There is no refresh endpoint. Expired sessions require sign-in.

No production data was migrated or edited. Back up and review existing records
before launch. Legacy contacts without status may need a status backfill; the
editor can update them. Review publication states rather than bulk-publishing.

## Verification scope

The 14 backend regression scenarios cover HTTP cookies/login, authentication,
CSRF, publication/date filters, CRUD/validation, contacts/settings/dashboard,
deduplicated tracking, real image decoding, password-session revocation, async
errors and authenticated socket privacy.

Real Express routes and Mongoose queries, casting, validation and password hooks
execute. Native collection storage is replaced by an in-memory fixture; this
does not validate actual MongoDB indexes, storage, query execution or networking.

The optional `npm run test:integration --prefix backend` runs the same suite
with a temporary MongoDB process. It was attempted here, but the environment
rejected the binary's open operation. No production database was contacted.

Both frontend production builds pass. Chromium checks the compiled UIs over
HTTPS with real routes and the collection fixture: login; draft creation with
image upload; edit/publication and public catalog; live visitor count and purchase-click tracking; offers; hero banners; site,
About and policy settings; contact submission/status; mobile overflow; logout.
External images/fonts/seller pages are isolated. No real credentials or hosting
service are used. The review caught and fixed a duplicate editor label ID.

## Dependency review

Runtime dependencies were updated, including Express 4.22.3, proxy-addr 2.0.8,
Engine.IO 6.6.11, Sharp 0.35.5, Multer 2.4.0, Axios 1.20.0 and React Router
7.18.4. All four lockfiles match their package manifests. Node's built-in watch
mode replaces nodemon. The storefront and admin development servers default
to loopback.

On 19 October 2026, `npm audit --omit=dev` reported zero findings separately for
backend, storefront and admin. This is a dependency-database check, not proof
that the application is secure. The legacy CRA 5 / Vite 5 / Tailwind 3 build and
development trees still have advisory findings. React Scripts is correctly a
development dependency; moving it there does not fix those advisories. A
separate build-tool migration is still needed. Production serves compiled static
files through the updated Express backend, and should not expose dev servers.
Do not apply npm's suggested react-scripts 0.0.0 downgrade as a repair.

Primary references for the runtime updates:

- https://github.com/advisories/GHSA-jqcg-44mw-7w3h
- https://github.com/advisories/GHSA-2gc4-cqfq-p2gv
- https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
- https://github.com/remix-run/react-router/releases/tag/react-router@7.18.4

## Deployment and next product work

- Verify the intended MongoDB connection, indexes, old records and full browser
  flow there. Back up before data migrations.
- Configure HTTPS, exact origins, trusted proxy hops, WebSocket upgrades,
  permanent image storage and backups on the selected host.
- Rotate any credentials exposed in older archives/history on their owning
  services. This work did not change remote credentials.
- Review About/Contact/policy content. Add final-domain canonical metadata,
  sitemap and business SEO. Basic robots/noindex is not a complete SEO setup.
- Decide separately on checkout/orders/payments, email, password recovery,
  inventory reservations and coupon redemption.
- Multiple processes require shared Socket.IO/presence/rate-limit storage.
- Plan analytics retention, privacy/consent text and upload cleanup. Counts are
  browser-tab activity, not verified unique people or sales.

Private `.env` files, dependencies, old Git history and test uploads are excluded.
Install from lockfiles rather than copying node_modules across operating systems.
