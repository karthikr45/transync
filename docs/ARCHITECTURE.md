# Frontend architecture

## Responsibilities

| Layer                | Location                                                                | Responsibility                                                                          |
| -------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Next.js App Router   | `app/`                                                                  | Route composition, layouts, loading/error boundaries, metadata and health endpoint      |
| Feature presentation | `features/*/screen.tsx`, `components.tsx`, device-management/components | Render state, bind user events, accessible interaction                                  |
| Feature controllers  | `features/*/hooks.ts`, device-management/hooks                          | Request lifecycle, form state, pagination, mutations and orchestration                  |
| Domain               | Feature `model.ts`, device-management/domain                            | Pure transformations, validation, workflow commands and contracts                       |
| Endpoint services    | home-care/api, end-user/api, device-management/api                      | Endpoint paths, DTOs and runtime validation                                             |
| Transport            | `lib/http/`                                                             | Headers, cancellation, bounded requests, response normalization and coordinated refresh |
| Shared UI            | `components/`                                                           | Portal shells and reusable presentation                                                 |

Routes remain server components and compose client feature boundaries. Browser session storage currently requires authenticated data fetching on the client. Merely changing a file to a Server Component would not make its data authorized. Server-side authenticated fetching requires the session migration described in PRODUCTION-READINESS.md.

`lib/api.ts` and `lib/device-workflow.ts` are compatibility exports; new code should use the owning feature service or domain module. Legacy shared DTOs remain in `lib/types.api.ts`. Feature hooks may orchestrate services; presentation must not directly import the HTTP client. Keep JSX outside controllers and pure domain rules outside React.

## Device management

Context supplies server permissions. Serial checking precedes claim submission; the server-issued validation token expires. Registry registration, allocation, claim review, transfer, assignment and return build explicit commands with required reasons/references. Mutations use idempotency keys. Runtime schemas reject unsupported context versions, malformed lists and incomplete validation batches. See DEVICE-WORKFLOW-API.md for the proposed backend contract.

UI permissions are presentation only. Ownership, tenant scope, transitions, validation-token binding and idempotency must be enforced transactionally by the backend.

## HTTP behavior

Requests have a 30-second bound including body consumption; callers can cancel. Auth refresh is shared between simultaneous unauthorized requests and retries only once. An old refresh cannot overwrite logout or a newer session. HTTP status is authoritative, envelope decoding preserves ordinary domain status fields, and field errors are normalized. Authenticated requests disable caching and redirects. Device APIs validate unknown JSON before rendering; legacy APIs still use typed DTOs and require further schema adoption.

## Incomplete features

Routes backed only by sample data render an unavailable state instead of fabricated operational records or successful actions. Historical feature implementations remain as reference but are not imported by those routes. Do not re-enable them until their services, authorization and failure behavior are implemented. The monitor detail route requires its API mode and no longer falls back to mock patients.

## Enforcement

ESLint enforces hook dependencies and key import boundaries. Architecture tests keep route pages small, disallow direct presentation API imports and prevent the legacy device upload endpoint returning. Unit tests exercise domain validation, API schemas and transport races. Playwright exercises production output with mocked upstream responses; it does not certify the real backend.

Compiler-only React hook recommendations are disabled while explicit lifecycle hooks are used. ESLint 9.39.5 is pinned because the installed Next parser/plugins are incompatible with ESLint 10; revisit this development-tool compatibility pin when upstream support is available.
