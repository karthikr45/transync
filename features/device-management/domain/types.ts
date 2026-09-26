export type WorkflowArea =
  "registry" | "allocations" | "inventory" | "claim-requests" | "transfers" | "audit";
export type Permission =
  | "registry:write"
  | "allocations:write"
  | "claims:write"
  | "claims:review"
  | "transfers:write"
  | "transfers:review"
  | "assignments:write";
export interface WorkflowContext {
  contractVersion: 1;
  organizationId: string | null;
  permissions: Permission[];
}
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
export interface Choice {
  id: string;
  name: string;
  detail?: string;
}
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
  allowedActions?: (
    "approve" | "reject" | "release" | "accept" | "assign" | "return" | "restrict" | "retire"
  )[];
}
export type ClaimOutcome =
  | "eligible"
  | "claimed"
  | "already_added"
  | "approval_required"
  | "transfer_required"
  | "invalid"
  | "restricted"
  | "registered"
  | "already_registered"
  | "allocated"
  | "rejected";
export interface SerialResult {
  serial: string;
  outcome: ClaimOutcome;
  message: string;
}
export interface ClaimCheck {
  validationId: string;
  expiresAt: string;
  results: SerialResult[];
}
export interface MutationResult {
  message: string;
  results?: SerialResult[];
}
