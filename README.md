# Transcend Web

Cloud compliance portal for the Transcend miniCPAP. A Next.js
application that serves four user portals:

| Portal | Audience |
|---|---|
| `/patient/*` | Individual User (the patient) |
| `/provider/*` | Homecare Provider staff |
| `/monitor/*` | Authorized Monitor (clinician / insurer) |
| `/admin/*` | Transcend Super Admin / Operations |

## Architecture

- **Frontend-only consumer.** The browser calls the upstream backend
  (set via `NEXT_PUBLIC_API_BASE_URL`) directly. No server-side proxy.
- **Tokens in `localStorage`.** `lib/auth.ts` writes the JWT + refresh
  token after login; `lib/api.ts` reads them and sets the
  `Authorization: Bearer …` header on every API call.
- **Transparent refresh.** On any `401`, the client calls
  `/auth/refresh` once and retries. If that fails the session is cleared
  and the user is sent to `/login`.
- **Client-side auth guard.** Each portal layout wraps its tree in
  `<AuthGuard>` (see `components/AuthGuard.tsx`). It renders a Loading
  state while it confirms the right kind / role / userType is present
  in `localStorage`, then renders the portal — or redirects to
  `/login?next=…` if not.
- **Security headers** in `next.config.mjs`: HSTS, X-Frame-Options DENY,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
  COOP same-origin, X-DNS-Prefetch-Control off and a CSP that limits
  `connect-src` to the app origin plus the API origin (read from env).

## Getting started

```bash
npm install
cp .env.example .env.local           # edit NEXT_PUBLIC_API_BASE_URL
npm run dev                           # http://localhost:3000
```

The backend at `NEXT_PUBLIC_API_BASE_URL` **must allow CORS** from your
web origin and must accept `Authorization: Bearer …` plus the
`ngrok-skip-browser-warning` header (the latter only matters while
serving from an ngrok tunnel).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server, bound to `0.0.0.0:3000` |
| `npm run dev:local` | Dev server, loopback only |
| `npm run build` | Production build |
| `npm run start` | Production server, `0.0.0.0:3000` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | typecheck + lint + build (CI gate) |
| `npm run test:install` | Install Playwright browsers (chromium) |
| `npm run test` | Playwright smoke tests |

## Project layout

```
app/
  admin/ provider/ monitor/ patient/    # portals
  login/ register/                      # auth screens
  api/csp-report/                       # CSP violation collector
  error.tsx loading.tsx not-found.tsx
components/
  AuthGuard.tsx PortalShell.tsx
  MobileReport.tsx PageHeader.tsx StatCard.tsx ...
lib/
  api.ts                # client → backend, refresh handling
  auth.ts               # localStorage session helpers, logout
  env.ts                # NEXT_PUBLIC_API_BASE_URL resolver
  types.api.ts          # DTOs
  i18n.ts               # tiny key dictionary
  observability.ts      # captureException stub (Sentry-ready)
  report-vm.ts          # compliance report view-model
  mock-data.ts          # mock data for non-API screens
messages/en.json        # i18n strings
next.config.mjs         # security headers + CSP
instrumentation.ts      # Next.js server-boot hook
tests/                  # Playwright smoke tests
```

## Security notes

- Tokens live in `localStorage`, which means **any XSS bug in the page
  steals the session**. Keep the CSP tight and never inject untrusted
  HTML. We deliberately disallow inline scripts apart from the Next.js
  hydration shims (CSP `script-src 'self' 'unsafe-inline'`).
- CSP `connect-src` is set to `'self'` plus the API origin from
  `NEXT_PUBLIC_API_BASE_URL`. If you change the backend URL, restart
  the dev server.
- `frame-ancestors 'none'` blocks the app from being embedded.
- The `/login` `?next=` parameter only honours paths inside the four
  known protected portals — open-redirect attempts are dropped.
- CSP violations POST to `/api/csp-report`. If `CSP_REPORT_FORWARD_URL`
  is set, reports are forwarded to that collector.
- HTTPS at the edge is required: HSTS is `max-age=63072000;
  includeSubDomains; preload`.

## Observability

`lib/observability.ts` exposes `captureException(err, ctx)` /
`captureMessage(msg, ctx)`. By default it logs to the console. When
`SENTRY_DSN` is set the wiring inside `instrumentation.ts` and
`captureException` can be uncommented to forward events to Sentry — no
other code changes required.

## i18n

`lib/i18n.ts` is a dependency-free dictionary lookup with dotted keys.
Strings live in `messages/<lang>.json` (only `en.json` ships today).
Add a new locale by writing `messages/<lang>.json` with the same shape
and registering it in `lib/i18n.ts`. We can swap in `next-intl` later
for RTL / formatting if the catalogue grows.

## CI

`.github/workflows/ci.yml` runs `typecheck` / `lint` / `build` and a
Playwright smoke job on every push and PR.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).
