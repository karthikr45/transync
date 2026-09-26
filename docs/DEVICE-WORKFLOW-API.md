# Device management frontend API contract (v1)

These are **new proposed endpoints**, not endpoints already available in the Japan API. The web UI is implemented against this contract. The backend must implement and enforce it before device management becomes operational. No browser mock data, localStorage ownership store, or fallback to `/home-care/devices/upload` is used.

Base URL: existing `NEXT_PUBLIC_API_BASE_URL`. Path prefix: `/home-care/device-management`.
All requests use the existing bearer session and refresh behavior. Responses may be the existing `{ status: "Success", result: ... }` envelope or the bare result. Errors use appropriate HTTP status and `{ message: "..." }`. Avoid 200 error-shaped responses.

## Authentication and permissions

`GET /context` returns:

```json
{
  "contractVersion": 1,
  "organizationId": "org-123",
  "permissions": ["claims:write", "transfers:write", "assignments:write"]
}
```

Super Admin context may have `organizationId: null` and permissions `registry:write`, `allocations:write`, `claims:review`, `transfers:write`, `transfers:review`. HCP Admin may have the three permissions above; read-only staff get an empty array. Grant based on authenticated backend permissions, never a client-provided role. The frontend hides unavailable actions, but every endpoint must independently authorize the operation and organization.

403 = not permitted; 404 or 501 = not implemented; 409 = current-state conflict; 422 = validation failure. The UI shows errors and does not report success. Unavailable context prevents all workflow actions.

## Lists

`GET /{area}?page=1&limit=25&search=...&status=...`

Areas: `registry`, `allocations`, `inventory`, `claim-requests`, `transfers`, `audit`.

- Registry and allocations: Super Admin only.
- Inventory: authenticated HCP organization only; includes allocated but unclaimed devices.
- Requests, transfers, audit: Super Admin sees authorized platform-wide records; HCP sees only its own records. Do not expose other organizations' patient data.
- Search is server-side; page is 1-based; limit is 10, 25, or 50. Respond with the requested page/limit even for an empty page.

```json
{
  "items": [
    {
      "id": "device-record-id",
      "serial": "EXAMPLE-001",
      "model": "Transcend model",
      "status": "claimed",
      "organizationName": "Example HCP",
      "patientName": null,
      "updatedAt": "2026-09-24T08:00:00Z",
      "allowedActions": ["assign"]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 25
}
```

Optional display fields are omitted rather than null where possible. Types are in `lib/device-workflow.ts`.

| Area           | Display fields besides id                                                                         | Status filters                                                           |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| registry       | serial, model, organizationName, status, updatedAt                                                | available, allocated, claimed, assigned, returned, restricted, retired   |
| allocations    | serial, organizationName, reference, status, updatedAt                                            | active, released                                                         |
| inventory      | serial, model, patientName, status, updatedAt                                                     | allocated, claimed, assigned, returned, restricted                       |
| claim-requests | serials (array), organizationName, reference, status, reason, reviewReason, requestedAt           | pending, approved, rejected                                              |
| transfers      | serial, sourceOrganizationName, targetOrganizationName, status, reason, reviewReason, requestedAt | pending_release, pending_acceptance, pending_review, completed, rejected |
| audit          | serial, actorName, organizationName, action, previousStatus, newStatus, reason, effectiveAt       | none                                                                     |

`allowedActions` is computed server-side per record and actor:

- Registry: `restrict`, `retire` when eligible.
- Inventory: `assign`, `return` when eligible.
- Pending claim requests: `approve`, `reject` for authorized Super Admin reviewers.
- Transfers: `release` for source HCP, `accept` for destination HCP, `approve`/`reject` for Super Admin at the appropriate stage.
- Audit and allocation rows currently have no mutation actions.

## Eligible choices

`GET /organizations?search=...&page=1&limit=25`
`GET /patients?search=...&page=1&limit=25`

Return the same paginated shape with items `{ id, name, detail? }`.
Organizations must be approved/active HCPs; expose only the minimal permitted directory fields to HCP callers, excluding the caller's own organization for transfers. Patients must be eligible for the caller's organization and care relationship. Patients endpoint is used for assignment, not public platform-wide discovery.

## Mutations

All persisted mutations below use `POST` and an `Idempotency-Key` UUID header. The UI preserves the key when retrying an identical failed submission. Scope deduplication by actor and operation; reject a reused key with a different payload. Responses include a human-readable `message` and optionally per-serial `results`. Do not report blanket success for partial batch failures.

| Path                          | Request body                                          |
| ----------------------------- | ----------------------------------------------------- |
| `/registry/import`            | `{ devices: [{ serial, model }], reference, reason }` |
| `/allocations`                | `{ serials, organizationId, reference, reason }`      |
| `/claims`                     | `{ serials, validationId }`                           |
| `/claim-requests`             | `{ serials, reference, reason, validationId? }`       |
| `/claim-requests/{id}/review` | `{ decision: "approved" \| "rejected", reason }`      |
| `/transfers`                  | `{ serial, targetOrganizationId, reference, reason }` |
| `/transfers/{id}/release`     | `{ reason }`                                          |
| `/transfers/{id}/accept`      | `{ reason }`                                          |
| `/transfers/{id}/review`      | `{ decision: "approved" \| "rejected", reason }`      |
| `/registry/{id}/status`       | `{ status: "restricted" \| "retired", reason }`       |
| `/inventory/{id}/assignment`  | `{ patientId, effectiveAt, reason }`                  |
| `/inventory/{id}/return`      | `{ effectiveAt, reason }`                             |

`effectiveAt` is UTC ISO timestamp, converted from the user's selected local time. Validate allowable dates on the server. Models are entered once per import batch. Batches accept up to 100 serials; UI trims and deduplicates exact values but does not invent manufacturer serial patterns or case normalization. Validate the manufacturer's actual serial/model rules on the backend.

Assignments require eligible device, verified patient identity/care relationship, and authorization. The UI asks staff to confirm those details. Returning ends the current assignment and must not automatically authorize reuse or expose historical patient records.

## Two-step verification and claim

`POST /claim-checks` with `{ serials: ["EXAMPLE-001"] }` performs no ownership mutation:

```json
{
  "validationId": "short-lived-server-reference",
  "expiresAt": "2026-09-24T08:10:00Z",
  "results": [
    { "serial": "EXAMPLE-001", "outcome": "eligible", "message": "Allocated to your organization." }
  ]
}
```

Return exactly one result for every distinct input serial. Valid verification outcomes:

- `eligible`: may submit claim.
- `already_added`: idempotent informational result; no new claim needed.
- `approval_required`: may submit request with supporting reference/reason.
- `transfer_required`: cannot claim; ask current provider or Transcend to initiate transfer.
- `invalid`: serial is not in manufacturer registry or invalid format.
- `restricted`: not eligible for claiming.

The verification reference must be bound to actor/organization/serials with a finite expiry. Claim must recheck everything atomically; verification is not a reservation or a substitute for authorization. The UI clears verification on input changes and checks expiry before submission.

`POST /claims` returns exactly one result per submitted serial:

```json
{
  "message": "Processed 2 device claims.",
  "results": [
    { "serial": "EXAMPLE-001", "outcome": "claimed", "message": "Added to inventory." },
    {
      "serial": "EXAMPLE-002",
      "outcome": "transfer_required",
      "message": "Allocation changed. Contact Transcend."
    }
  ]
}
```

Import/allocation batch results use the same `{ serial, outcome, message }` shape, with outcomes such as `registered`, `already_registered`, `allocated`, `invalid`, or `rejected`. Claim-request creation returns a message confirming pending review and may include per-serial results. It must not grant device or patient-data access.

## Backend enforcement and rollout

1. Store registry, allocation, claim, patient assignment, request, transfer, and audit records separately. Support historical assignments with start/end boundaries.
2. Validate organization approval and staff permissions on every mutation. Derive source/caller organization from session. Super Admin transfers derive source organization from the device.
3. Enforce one active owning allocation/claim per device with database constraints and transactions. Recheck status during review, transfer, and assignment; reject stale state with 409.
4. Approval of a claim request validates the registry and creates the allocation and claim atomically. An already allocated device requires transfer instead.
5. Transfer flow: source HCP/Super Admin initiates -> source release -> destination acceptance -> Super Admin review -> atomic completion. Return the appropriate allowed actions at each stage. Define supervised exception handling on the backend; the UI does not bypass steps.
6. Preserve previous-patient history boundaries; inventory ownership is not a grant to all historical therapy data. Audit every mutation in the same transaction.
7. Retire/restrict rules must reject unsafe transitions with active assignment/transfer unless the backend explicitly handles them. Returning does not silently put a device into reusable stock.
8. The old `/home-care/devices/upload` must be disabled or enforce identical validation. Removing its UI does not secure an unchanged backend endpoint. Existing legacy claims need reconciliation.
9. Deploy the new endpoints before enabling production use of these pages. Until then the pages show unavailable/error states; no claims are simulated.
