import type { Permission, WorkflowArea, WorkflowRow } from "./types";
export type Mode = "admin" | "provider";
export type FormKind =
  | "import"
  | "allocate"
  | "request"
  | "transfer"
  | "approve"
  | "reject"
  | "release"
  | "accept"
  | "assign"
  | "return"
  | "restrict"
  | "retire";
export type Column = { label: string; key: keyof WorkflowRow; date?: boolean };
export const columns: Record<WorkflowArea, Column[]> = {
  registry: [
    { label: "Serial", key: "serial" },
    { label: "Model", key: "model" },
    { label: "Status", key: "status" },
    { label: "Organization", key: "organizationName" },
    { label: "Updated", key: "updatedAt", date: true },
  ],
  allocations: [
    { label: "Serial", key: "serial" },
    { label: "Organization", key: "organizationName" },
    { label: "Reference", key: "reference" },
    { label: "Status", key: "status" },
    { label: "Updated", key: "updatedAt", date: true },
  ],
  inventory: [
    { label: "Serial", key: "serial" },
    { label: "Model", key: "model" },
    { label: "Inventory status", key: "status" },
    { label: "Patient", key: "patientName" },
    { label: "Updated", key: "updatedAt", date: true },
  ],
  "claim-requests": [
    { label: "Serials", key: "serials" },
    { label: "Organization", key: "organizationName" },
    { label: "Reference", key: "reference" },
    { label: "Status", key: "status" },
    { label: "Requested", key: "requestedAt", date: true },
  ],
  transfers: [
    { label: "Serial", key: "serial" },
    { label: "From", key: "sourceOrganizationName" },
    { label: "To", key: "targetOrganizationName" },
    { label: "Status", key: "status" },
    { label: "Requested", key: "requestedAt", date: true },
  ],
  audit: [
    { label: "When", key: "effectiveAt", date: true },
    { label: "Actor", key: "actorName" },
    { label: "Organization", key: "organizationName" },
    { label: "Serial", key: "serial" },
    { label: "Action", key: "action" },
    { label: "From", key: "previousStatus" },
    { label: "To", key: "newStatus" },
    { label: "Reason", key: "reason" },
  ],
};
export const titles: Record<WorkflowArea, string> = {
  registry: "Device Registry",
  allocations: "Allocations",
  inventory: "Devices",
  "claim-requests": "Claim Requests",
  transfers: "Device Transfers",
  audit: "Device Audit",
};
export const descriptions: Record<WorkflowArea, string> = {
  registry: "Registered Transcend devices and their lifecycle status.",
  allocations: "Allocate registered devices to approved homecare providers.",
  inventory: "Allocated devices, verified claims, and patient assignments for your organization.",
  "claim-requests": "Track and review requests for devices without an existing allocation.",
  transfers: "Move devices between organizations through an approved transfer.",
  audit: "History of device registrations, allocations, claims, assignments, and transfers.",
};
export const statuses: Record<WorkflowArea, string[]> = {
  registry: ["available", "allocated", "claimed", "assigned", "returned", "restricted", "retired"],
  allocations: ["active", "released"],
  inventory: ["allocated", "claimed", "assigned", "returned", "restricted"],
  "claim-requests": ["pending", "approved", "rejected"],
  transfers: ["pending_release", "pending_acceptance", "pending_review", "completed", "rejected"],
  audit: [],
};

export function permissionFor(action: FormKind, area: WorkflowArea): Permission {
  if (["import", "restrict", "retire"].includes(action)) return "registry:write";
  if (action === "allocate") return "allocations:write";
  if (action === "assign" || action === "return") return "assignments:write";
  if (action === "request") return "claims:write";
  if (action === "approve" || action === "reject")
    return area === "claim-requests" ? "claims:review" : "transfers:review";
  return "transfers:write";
}
