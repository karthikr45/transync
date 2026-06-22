# Deployment

## Environment

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Upstream backend. Must include scheme + host; trailing slash trimmed. The client calls this directly, so it ends up in browser bundles. |
| `API_BASE_URL` | optional | Honoured as a fallback for legacy `.env` files only. Migrate to `NEXT_PUBLIC_API_BASE_URL`. |
| `NODE_ENV` | yes | `production` for deployed builds. Controls `console.*` stripping and CSP `'unsafe-eval'`. |
| `CSP_REPORT_FORWARD_URL` | optional | If set, `/api/csp-report` forwards reports to this URL too. |
| `SECURITY_CONTACT_EMAIL` | optional | Shown in `/.well-known/security.txt`. |
| `SENTRY_DSN` | optional | Activates the `instrumentation.ts` / `lib/observability.ts` Sentry hook once you uncomment the SDK init. |

## Backend requirements

The backend at `NEXT_PUBLIC_API_BASE_URL` must:

- **Allow CORS** from your web origin(s). Concretely:
  - `Access-Control-Allow-Origin: https://<your-web-origin>`
  - `Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning`
  - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
  - `Access-Control-Allow-Credentials: false` (we send tokens via `Authorization`, not cookies)
- **Accept** `Authorization: Bearer <jwt>` on protected endpoints.
- **Tolerate** the `ngrok-skip-browser-warning: true` header (needed only while serving through an ngrok tunnel).

## Build and run

```bash
npm ci
npm run check
NODE_ENV=production npm run start
```

`npm run check` is the recommended CI gate (typecheck + lint + build).

## Behind a reverse proxy

- Forward `Host` and `X-Forwarded-Proto: https` so `Strict-Transport-Security` behaves correctly.
- TLS termination is the proxy's job; we serve plain HTTP behind it.

## Tests

```bash
npm run test:install   # one-time: pulls chromium for Playwright
npm run test
```

Smoke tests don't depend on a live backend; they verify the marketing
page, the login form, the multi-step registration, and that
unauthenticated visits to portal routes redirect to `/login?next=…`.

## Common operational issues

- **CSP blocks the API call** — Verify `NEXT_PUBLIC_API_BASE_URL` is set
  *at build time*; the URL is baked into `connect-src` in
  `next.config.mjs`.
- **CORS error in the browser** — The backend isn't returning the
  required headers for your web origin. Add it to the allow-list.
- **Login succeeds but `/provider/dashboard` redirects to `/login`** —
  `localStorage` was cleared between login and navigation (e.g.
  cross-tab logout from `lib/auth.ts`). Sign in again.
- **`API_BASE_URL is not set`** in the dev console — `.env.local` is
  missing or the variable name is wrong. Use
  `NEXT_PUBLIC_API_BASE_URL`.
