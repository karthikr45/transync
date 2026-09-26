# Production readiness review

This refactor provides a production-oriented frontend foundation, not a certification that the integrated medical-data system is ready to release.

## Addressed in this change

- Thin App Router route components; feature-owned presentation, controllers, domain rules and endpoint services.
- Supported Next.js major upgrade, React upgrade, deterministic lockfile and Node 22 runtime.
- HTTP timeout/cancellation, refresh coordination and logout-race protection, runtime device-response validation.
- Sample-only routes made unavailable; removal of mock patient fallback and unsupported compliance marketing claim.
- Sanitized error events without patient payloads, tokens or arbitrary exception text.
- Non-root standalone container, liveness endpoint, explicit build-time public configuration.
- Local type checks, lint, architecture/domain/transport unit tests, format check, dependency audit, production build and browser-test tooling. Existing CI covers type checks, lint, build and browser tests. The expanded Node 22 workflow requires workflow-write permission before it can be applied.

## Release gates owned by backend and operations

1. Implement and integration-test DEVICE-WORKFLOW-API.md. Enforce tenant scope, role permissions, registry existence, allocation ownership, valid transitions and duplicate protection on every endpoint. Claim validation and mutation must be atomic; UI validation is insufficient.
2. Replace browser-persisted access/refresh tokens with a reviewed HttpOnly, Secure session design (backend cookie or Next BFF). Include CSRF defense, refresh rotation/revocation, expiry, multi-tab logout and server-side authorization. Current localStorage tokens remain exposed to successful XSS and the client guard is not a security boundary.
3. Verify live backend response contracts, CORS, pagination, errors, audit trails and race conditions in staging. Browser fixtures verify the frontend only. Device endpoints are proposed, not assumed deployed.
4. Configure TLS, secrets management, deployment access, image scanning, backups/recovery, monitoring/alerts and privacy-preserving telemetry. The health endpoint reports process liveness, not backend readiness. The telemetry helper is not an installed monitoring service.
5. Complete clinical/privacy/security review appropriate to deployment jurisdiction and organization. This repository does not establish HIPAA or other regulatory compliance.
6. Implement real services for unavailable sample-only screens before enabling those product features. Adopt runtime schemas for remaining legacy APIs and add their regression coverage incrementally.
7. Validate the Docker image in the deployment environment and perform accessibility, load and penetration testing before a production release. The existing CSP still permits inline scripts for Next rendering; evaluate nonce-based CSP with the session/server-rendering migration.

## Review findings and tradeoffs

The original pages mixed API calls, mutable state, validation and JSX. The extraction establishes enforceable module boundaries while preserving the existing direct-browser API contract. It does not invent backend authorization or silently convert bearer authentication into a cookie protocol the backend does not support. Some legacy controllers remain large; future changes should split them by behavior rather than moving logic back into route components.

ESLint 9 is a temporary development-only compatibility pin; ESLint 10 failed with the current Next parser and plugins. Audit the lockfile continuously and remove the pin when compatible upstream versions are available.
