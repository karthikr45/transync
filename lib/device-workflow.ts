import { apiFetch, ApiError } from "./api";

// Proposed v1 contract; see docs/DEVICE-WORKFLOW-API.md. No legacy claim fallback.
const ROOT = "/home-care/device-management";
export type WorkflowArea = "registry" | "allocations" | "inventory" | "claim-requests" | "transfers" | "audit";
export type Permission = "registry:write" | "allocations:write" | "claims:write" | "claims:review" | "transfers:write" | "transfers:review" | "assignments:write";
export interface WorkflowContext { contractVersion: 1; organizationId: string | null; permissions: Permission[] }
export interface PageResult<T> { items: T[]; total: number; page: number; limit: number }
export interface Choice { id: string; name: string; detail?: string }
export interface WorkflowRow {
  id: string;
  serial?: string;
  serials?: string[];
  model?: string;
  status?: string;
  organizationName?: string;
  sourceOrganizationName?: string;
  targetOrganizationName?: string;
  patientName?: string;
  reference?: string;
  reason?: string;
  reviewReason?: string;
  requestedAt?: string;
  updatedAt?: string;
  effectiveAt?: string;
  actorName?: string;
  action?: string;
  previousStatus?: string;
  newStatus?: string;
  allowedActions?: ("approve" | "reject" | "release" | "accept" | "assign" | "return" | "restrict" | "retire")[];
}
export type ClaimOutcome = "eligible" | "claimed" | "already_added" | "approval_required" | "transfer_required" | "invalid" | "restricted" | "registered" | "already_registered" | "allocated" | "rejected";
export interface SerialResult { serial: string; outcome: ClaimOutcome; message: string }
export interface ClaimCheck { validationId: string; expiresAt: string; results: SerialResult[] }
export interface MutationResult { message: string; results?: SerialResult[] }

function query(params: Record<string, string | number | undefined>) {
  const result = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") result.set(key, String(value)); });
  return `?${result}`;
}
export const deviceWorkflowApi = {
  context: () => apiFetch<WorkflowContext>(`${ROOT}/context`),
  list: (area: WorkflowArea, params: { page: number; limit: number; search?: string; status?: string }) =>
    apiFetch<PageResult<WorkflowRow>>(`${ROOT}/${area}${query(params)}`),
  choices: (kind: "organizations" | "patients", search: string) =>
    apiFetch<PageResult<Choice>>(`${ROOT}/${kind}${query({ search, page: 1, limit: 25 })}`),
  check: (serials: string[]) => apiFetch<ClaimCheck>(`${ROOT}/claim-checks`, { method: "POST", body: JSON.stringify({ serials }) }),
  mutate: (path: string, payload: Record<string, unknown>, idempotencyKey: string) =>
    apiFetch<MutationResult>(`${ROOT}/${path}`, { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(payload) }),
};

export function workflowError(error: unknown): string {
  if (error instanceof ApiError && [404, 501].includes(error.statusCode)) {
    return "Device management is not available yet. Please contact Transcend support or try again later.";
  }
  if (error instanceof ApiError && error.statusCode === 403) return "You do not have permission to perform this action. Contact your organization administrator.";
  if (error instanceof ApiError && error.statusCode === 409) return "This device or request has changed. Refresh the list and verify its current status before trying again.";
  return error instanceof Error ? error.message : "Could not complete the request. Please try again.";
}

export function parseSerials(input: string): { serials: string[]; duplicates: number } {
  const entries = input.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  if (!entries.length) throw new Error("Enter at least one device serial number.");
  if (entries.length > 100) throw new Error("Enter no more than 100 serial numbers at a time.");
  // Do not invent a manufacturer format or change case; the registry is authoritative.
  if (entries.some((s) => s.length > 128 || /[\x00-\x1f\x7f]/.test(s))) throw new Error("One or more serial numbers contain invalid characters or exceed 128 characters.");
  const serials = [...new Set(entries)];
  return { serials, duplicates: entries.length - serials.length };
}
export const outcomeLabel = (value: string) => value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
