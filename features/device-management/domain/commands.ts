import { parseSerials } from "./serials";
import type { WorkflowRow, WorkflowArea } from "./types";
import type { FormKind } from "./directory-config";
export interface WorkflowActionInput {
  kind: FormKind;
  row?: WorkflowRow;
  area: WorkflowArea;
  serials: string;
  model: string;
  organizationId: string;
  patientId: string;
  reference: string;
  reason: string;
  date: string;
  confirmed: boolean;
}
export function buildWorkflowCommand({
  kind,
  row,
  area,
  serials,
  model,
  organizationId,
  patientId,
  reference,
  reason,
  date,
  confirmed,
}: WorkflowActionInput) {
  const needsSerials = ["import", "allocate", "request", "transfer"].includes(kind);
  const needsOrg = kind === "allocate" || kind === "transfer";
  const needsReference = needsSerials;
  let path = "";
  let payload: Record<string, unknown> = {};
  const parsed = needsSerials ? parseSerials(serials).serials : [];
  if (needsOrg && !organizationId) throw new Error("Select an eligible organization.");
  if (needsReference && !reference.trim())
    throw new Error("Enter an order, shipment, or manufacturing reference.");
  if (!reason.trim()) throw new Error("Enter a reason for the audit history.");
  if (!confirmed) throw new Error("Confirm the details before continuing.");
  if (kind === "import") {
    if (!model.trim()) throw new Error("Enter the model for this batch.");
    path = "registry/import";
    payload = {
      devices: parsed.map((serial) => ({ serial, model: model.trim() })),
      reference: reference.trim(),
    };
  } else if (kind === "allocate") {
    path = "allocations";
    payload = { serials: parsed, organizationId, reference: reference.trim() };
  } else if (kind === "request") {
    path = "claim-requests";
    payload = { serials: parsed, reference: reference.trim() };
  } else if (kind === "transfer") {
    if (parsed.length !== 1) throw new Error("Request a transfer for one device at a time.");
    path = "transfers";
    payload = {
      serial: parsed[0],
      targetOrganizationId: organizationId,
      reference: reference.trim(),
    };
  } else {
    if (!row) throw new Error("Select a record first.");
    const id = encodeURIComponent(row.id);
    if (kind === "approve" || kind === "reject") {
      path = `${area}/${id}/review`;
      payload = { decision: kind === "approve" ? "approved" : "rejected" };
    } else if (kind === "release" || kind === "accept") path = `transfers/${id}/${kind}`;
    else if (kind === "restrict" || kind === "retire") {
      path = `registry/${id}/status`;
      payload = { status: kind === "restrict" ? "restricted" : "retired" };
    } else {
      if (!date || !Number.isFinite(new Date(date).getTime()))
        throw new Error("Enter a valid effective date and time.");
      path = `inventory/${id}/${kind === "assign" ? "assignment" : "return"}`;
      payload = { effectiveAt: new Date(date).toISOString() };
      if (kind === "assign") {
        if (!patientId) throw new Error("Select an eligible patient.");
        payload.patientId = patientId;
      }
    }
  }
  return { path, payload: { ...payload, reason: reason.trim() } };
}
