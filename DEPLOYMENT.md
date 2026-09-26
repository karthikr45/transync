# Deployment

Use Node 22.13 or newer within the Node 22 LTS line (`.nvmrc`). Install with `npm ci`.

`NEXT_PUBLIC_API_BASE_URL` is required at build time and is public. Use an HTTPS upstream URL without credentials, query or fragment. HTTP is allowed only for loopback development. The former `API_BASE_URL` fallback is removed. Changing the upstream requires rebuilding the client bundle and CSP.

```sh
npm ci
NEXT_PUBLIC_API_BASE_URL=https://apijapan.mytranscend.com npm run check
npm run format:check
npm audit --audit-level=high
npm run test:install
npm test
npm start
```

The browser sends bearer authorization directly to the upstream. Configure CORS for the exact web origins, required methods and Content-Type/Authorization headers. Cookies are not sent by the current transport. Enforce all authorization on the backend.

## Container

```sh
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://apijapan.mytranscend.com -t transync-web .
docker run --rm -p 3000:3000 transync-web
```

The multi-stage image runs Next standalone output as a non-root user. `/api/health` is a no-store liveness endpoint; it does not probe the backend. Terminate TLS at a trusted ingress and configure resource limits, health probes, restart policy and central monitoring in the deployment platform. Environment files and local build artifacts are excluded from the Docker context.

## Validation and rollback

Run type generation/checking, lint, unit/architecture tests, formatting, dependency audit, production build and Playwright against production output. The existing CI runs type checks, lint, build and Playwright; the proposed expanded workflow requires workflow-write permission to apply. Browser tests mock API responses. Also run staging integration tests against the real backend before promotion. Retain the prior image and deployment configuration for rollback; coordinate API contract changes with backend releases.

Read [production release gates](docs/PRODUCTION-READINESS.md) before deployment. Current bearer-token storage and proposed device APIs are unresolved integration/security dependencies.
