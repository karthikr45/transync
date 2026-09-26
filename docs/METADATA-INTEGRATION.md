# Metadata integration review

Source: teammate's app-portal-transcend-ui-2.zip. Only the metadata feature and its admin navigation were ported. Old framework/dependency files, environment files, device flows and unrelated changes were not imported.

## Delivered behavior

Super Admin → Metadata supports viewing reference lists and app configuration, creating a record, editing all supported settings or one section, refreshing, and deleting after typing DELETE. Editable lists are occupation, CPAP experience, device usage and purchase source. Settings include clinical-mode enable/delay, app-update flags/version/message, app-store links and the popup flag. Additional server fields and lists remain read-only. Record IDs are not displayed.

The Next route composes the feature screen. Endpoint calls live in api.ts; schemas validate unknown responses; model.ts owns transformations and validation; hooks.ts owns lifecycle and mutations; editor/components/screen own rendering. MetadataEditor is registered in UI-STANDARDS.json and composes approved controls. Inline editing and native checkboxes avoid introducing unapproved dialogs or switches.

## Review corrections

- Existing option identities are retained; labels can change without renumbering every option. New numeric values avoid existing and removed values within the current edit.
- Unedited settings keep their original representation, including extra nested fields. Missing optional fields are not silently created during unrelated edits. Server-owned/read-only fields are omitted from PATCH; backend PATCH must preserve omitted fields.
- Malformed data fails closed. A record without an ID is view-only. Only successful null/empty-object reads enable creation; a generic 404 is an error, not proof that no record exists.
- Duplicate/blank option labels and duplicate IDs are rejected on edited lists. Delay must be a safe non-negative integer. Update prompts require a version. New store links require HTTPS without credentials; unsafe links are never clickable.
- Reads are cancellable. Mutations have a synchronous in-flight guard. Uncertain network/server failures keep the form and require cancellation/refresh before another attempt.
- A fresh read before mutation detects stale snapshots and duplicate create attempts. This reduces accidental overwrites but is NOT atomic concurrency protection.
- Deletion has an explicit typed confirmation. Failure preserves the confirmation view and provides a recoverable error.

## Backend contract inherited from source

| Operation | Endpoint                    |
| --------- | --------------------------- |
| Read      | GET /metadata               |
| Create    | POST /metadata/save         |
| Update    | PATCH /metadata/update/:id  |
| Delete    | DELETE /metadata/delete/:id |

Admin calls use the current bearer session and shared transport. Public patient signup retains its existing service and fallback behavior. Payloads carry the four option lists, verbiage and editable settings, preserving existing data. Legacy string/name/code options remain intact rather than being destructively converted; the backend must accept its returned representations or provide an explicit migration contract.

Backend release requirements: enforce super-admin mutation authorization, unique records, stable option identities and referential integrity; preserve omitted fields on PATCH; implement atomic version/ETag checks and idempotency for concurrent writes. The frontend preflight cannot close the race between its GET and PATCH/DELETE. Prevent recycling retired IDs on the server. Verify the contract in staging: browser tests use mocks and no production metadata was changed during development.

## Validation

Unit coverage includes schema rejection, identity preservation, untouched fields, legacy option representations, URL/delay/version validation, stale snapshots and endpoint encoding. Browser coverage exercises create, section update, typed delete, stale edits, malformed/missing-ID data, uncertain failures and non-admin route protection. Existing architecture and UI standards gates remain enabled without new exceptions or dependencies.
