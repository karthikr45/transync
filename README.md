# Transcend Web

Next.js 16 / React 19 frontend for Transcend patient, homecare provider, authorized monitor and super-admin portals.

## Development

```sh
nvm use
npm ci
cp .env.example .env.local
npm run dev:local
```

Set `NEXT_PUBLIC_API_BASE_URL` before starting or building. Use HTTPS except for loopback development. The value is public and baked into the browser bundle; never put secrets in it.

## Structure

```text
app/                       Route composition, layouts, boundaries, health
features/
  admin/ provider/         Feature screens, state controllers and models
  monitor/ patient/        Feature screens, state controllers and models
  login/ register/         Authentication presentation and controllers
  home-care/ end-user/     Endpoint services
  device-management/      Domain, API schemas, hooks and UI
components/                Shared presentation and portal shells
lib/http/                  Bounded transport, refresh, errors and envelopes
lib/auth.ts                Existing browser session storage
lib/types.api.ts           Shared legacy API DTOs
```

Routes compose feature screens; business rules, requests and JSX have separate modules. See [architecture](docs/ARCHITECTURE.md) for boundaries and [device API contract](docs/DEVICE-WORKFLOW-API.md) for backend integration.

Sample-only screens show an unavailable state until real services are implemented. Their old feature modules remain reference implementations, not active product routes.

## Checks

- `npm run check`: type generation/checking, lint, unit tests and production build.
- `npm run format:check`: formatting gate (`npm run format` to apply).
- `npm audit --audit-level=high`: dependency vulnerability gate.
- `npm run test:install` then `npm test`: Playwright against production output with mocked upstream APIs.

The existing CI runs type checks, lint, build and browser tests. The proposed workflow adds unit, format and audit gates and upgrades the runner to Node 22; applying it requires GitHub workflow-write permission. Run all checks above locally until it is applied. Node 22 is the supported deployment runtime. Dependencies are installed from the committed lockfile.

## Authentication and release readiness

The current browser client sends bearer tokens directly to the configured backend. Tokens remain in localStorage; UI route guards are not authorization. The backend must scope and authorize every request. A reviewed HttpOnly session migration remains a release gate for sensitive production deployment.

CSP and security headers are configured in `next.config.mjs`; the current CSP permits inline scripts for Next rendering and is not a substitute for XSS prevention. Error telemetry emits sanitized metadata only; a production collector is not configured. No regulatory compliance is implied by this codebase.

Read [production release gates](docs/PRODUCTION-READINESS.md) and [deployment instructions](DEPLOYMENT.md) before release.
