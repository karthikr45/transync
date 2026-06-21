# Deployment

## Environment

| Var | Required | Notes |
|---|---|---|
| `API_BASE_URL` | yes | Upstream Home Care / End User backend. **Server-only** — keeps the URL out of client bundles. |
| `NEXT_PUBLIC_API_BASE_URL` | deprecated | Honoured as a fallback for legacy `.env` files. Migrate to `API_BASE_URL`. |
| `NODE_ENV` | yes | `production` for deployed builds. Controls cookie `Secure` flag and `console.*` stripping. |
| `PORT` | optional | Defaults to 3000 in dev/start scripts. |

## Build and run

```bash
npm ci                       # reproducible install
npm run check                # typecheck + lint + build
NODE_ENV=production npm run start
```

`npm run check` is the recommended CI gate.

## Behind a reverse proxy

The app trusts standard `X-Forwarded-*` headers via Next.js defaults. If
you terminate TLS upstream:

- Forward the original `Host` and `X-Forwarded-Proto: https` so cookies
  with `Secure` and the HSTS header behave correctly.
- Make sure the proxy preserves the `Set-Cookie` header from `/api/auth/*`.
- The site listens on plain HTTP internally; TLS termination is the
  proxy's job.

## Health checks

- `GET /` returns 200 with the marketing page once the build is up.
- `GET /api/auth/logout` is idempotent and safe to use as a synthetic
  cookie-reset check (it returns 200 even when there is no session).

## Cookies set by the app

| Name | httpOnly | Lifetime | Purpose |
|---|---|---|---|
| `tc_at` | ✅ | 1 h | Access token forwarded by the proxy |
| `tc_rt` | ✅ | 7 d | Refresh token used by the proxy |
| `tc_user` | ❌ | 7 d | Profile JSON the client renders |
| `tc_kind` | ❌ | 7 d | `home-care` / `end-user` |

The httpOnly cookies are how we keep access tokens out of JavaScript.

## Tests

```bash
npm run test:install   # one-time: pulls chromium for Playwright
npm run test
```

The Playwright suite spins up `npm run build && next start` on port
`3100`, hits the UI smoke flows, and verifies that protected routes
redirect when unauthenticated and that security headers are set.

## Common operational issues

- **`API_BASE_URL is not set`** — Set `API_BASE_URL` in the environment
  before starting the server. The app refuses to make upstream calls.
- **Login succeeds but `/provider/dashboard` redirects to `/login`** —
  Cookies are not flowing through your proxy; check `Set-Cookie` is
  propagated and that you are not stripping the `Secure` cookies on a
  plain-HTTP origin.
- **`SameSite=Lax` cookies dropped on cross-site redirects** — Expected;
  we set `Lax` to keep sign-in flows working from email links. Do not
  embed the portal in an iframe (we set `frame-ancestors 'none'`).
