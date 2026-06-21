# Transcend Web

Cloud compliance portal for the Transcend miniCPAP. A single Next.js
application that serves four user portals:

| Portal | Audience | Auth API |
|---|---|---|
| `/patient/*` | Individual User (the patient) | `/auth/login`, `/users/create-user` |
| `/provider/*` | Homecare Provider staff | `/home-care/login` |
| `/monitor/*` | Authorized Monitor (clinician / insurer) | `/home-care/login` |
| `/admin/*` | Transcend Super Admin / Operations | `/home-care/login` |

## Architecture

- **Same-origin API.** The browser never calls the upstream backend
  directly. All traffic flows through Next.js Route Handlers under
  `/api/*`. The upstream Bearer tokens are stored in **httpOnly cookies**
  set by the server. This eliminates the XSS-token-stealing class of
  bugs.
- **Auth middleware.** `middleware.ts` is the real gate — unauthenticated
  requests to `/provider`, `/monitor`, `/admin`, `/patient` are
  redirected to `/login?next=…`. Wrong-role requests are sent back to
  `/login`.
- **Transparent token refresh.** The proxy at
  `app/api/proxy/[...path]/route.ts` calls `/auth/refresh` on a 401 and
  retries once. If refresh fails it clears cookies and surfaces a 401 to
  the client, which redirects to `/login`.
- **Security headers.** Set in `next.config.mjs`: HSTS, X-Frame-Options
  DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and
  a tight Content-Security-Policy.
- **No client tokens.** `lib/auth.ts` reads only the non-httpOnly
  `tc_user` and `tc_kind` cookies for display / routing. There is no
  `localStorage`-resident credential material.

## Getting started

```bash
npm install
cp .env.example .env.local            # then edit API_BASE_URL
npm run dev                            # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server, bound to `0.0.0.0:3000` |
| `npm run dev:local` | Dev server, loopback only |
| `npm run build` | Production build |
| `npm run start` | Production server, `0.0.0.0:3000` |
| `npm run lint` | ESLint (Next config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | Typecheck + lint + build (CI gate) |
| `npm run test:install` | Install Playwright browsers (chromium) |
| `npm run test` | Playwright UI smoke tests |

## Project layout

```
app/
  api/                  # Server-only Route Handlers (proxy + auth)
  admin/                # Super Admin portal
  provider/             # Homecare Provider portal
  monitor/              # Authorized Monitor portal
  patient/              # Individual User portal
  login/                # Login (Patient / Staff toggle)
  register/             # Provider + Monitor registration
  register/patient/     # End-user (OTP) registration
  error.tsx loading.tsx not-found.tsx
components/
  PortalShell.tsx       # Sidebar + nav, includes logout
  MobileReport.tsx      # Compliance report (Standard / Advanced / FAA)
  AuthGuard.tsx         # Optional client-side guard
  Logo.tsx PageHeader.tsx StatCard.tsx ...
lib/
  api.ts                # Client-side, talks to /api/*
  auth.ts               # Client cookie helpers + logout
  env.ts                # Env validation
  server-auth.ts        # httpOnly cookie management (server)
  server-upstream.ts    # Server-side fetch to upstream
  types.api.ts          # DTOs from the API documentation
  report-vm.ts          # Adapters to the shared report view model
  mock-data.ts          # Mock data for screens not yet on the API
middleware.ts           # Auth gate
next.config.mjs         # Security headers, build flags
tests/                  # Playwright smoke tests
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Observability

`lib/observability.ts` exposes `captureException(err, ctx)` /
`captureMessage(msg, ctx)`. By default it logs to the console (so logs
from `app/error.tsx` and CSP violations are visible in any log shipper).
When `SENTRY_DSN` is set the wiring inside `instrumentation.ts` and
`captureException` can be uncommented to forward events to Sentry — no
other code changes required.

CSP violation reports are POSTed to `/api/csp-report`. If
`CSP_REPORT_FORWARD_URL` is set, reports are also forwarded to that URL
(e.g. a Sentry, Datadog or report-uri collector).

## i18n

A minimal in-process i18n is provided by `lib/i18n.ts`. Strings live in
`messages/<lang>.json` (only `en.json` ships today). Components import
`t()` and call `t("login.title")`. Add a new locale by writing
`messages/<lang>.json` with the same shape and registering it in
`lib/i18n.ts`. We can swap in `next-intl` later for RTL / formatting if
the catalogue grows.

The login screen is wired as the canonical example. Roll the same
pattern out to the rest of the screens as you go.

## CI

`.github/workflows/ci.yml` runs two jobs on every push / PR:

1. **check** — `typecheck`, `lint`, `build` (the same as
   `npm run check` locally).
2. **test** — installs Playwright + chromium and runs the smoke suite.
   The Playwright HTML report is uploaded as an artifact on every run.

## Security notes

- All access tokens are in **httpOnly + SameSite=Lax + Secure (prod)**
  cookies. They never reach JavaScript.
- The user profile cookie (`tc_user`) is *not* httpOnly so the client
  can render the portal shell; it does not contain credentials.
- Same-origin API proxy means there are no CORS exceptions on the
  client and the upstream URL is not present in client bundles.
- Content-Security-Policy is set with `frame-ancestors 'none'`,
  `default-src 'self'`, and a same-origin `connect-src`. The Transcend
  marketing logo URL is the only externally allowed `img-src` host.
- Robots: the root metadata sets `noindex, nofollow` to keep portals
  out of search.
