"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatDateTime } from "@/lib/format";
import { deviceWorkflowApi, outcomeLabel, parseSerials, workflowError, type Permission, type WorkflowArea, type WorkflowRow, type PageResult } from "@/lib/device-workflow";
import { ChoicePicker, ErrorNotice, useMutation, useWorkflowContext } from "./shared";

type Mode = "admin" | "provider";
type FormKind = "import" | "allocate" | "request" | "transfer" | "approve" | "reject" | "release" | "accept" | "assign" | "return" | "restrict" | "retire";
type Column = { label: string; key: keyof WorkflowRow; date?: boolean };
const columns: Record<WorkflowArea, Column[]> = {
  registry: [{ label: "Serial", key: "serial" }, { label: "Model", key: "model" }, { label: "Status", key: "status" }, { label: "Organization", key: "organizationName" }, { label: "Updated", key: "updatedAt", date: true }],
  allocations: [{ label: "Serial", key: "serial" }, { label: "Organization", key: "organizationName" }, { label: "Reference", key: "reference" }, { label: "Status", key: "status" }, { label: "Updated", key: "updatedAt", date: true }],
  inventory: [{ label: "Serial", key: "serial" }, { label: "Model", key: "model" }, { label: "Inventory status", key: "status" }, { label: "Patient", key: "patientName" }, { label: "Updated", key: "updatedAt", date: true }],
  "claim-requests": [{ label: "Serials", key: "serials" }, { label: "Organization", key: "organizationName" }, { label: "Reference", key: "reference" }, { label: "Status", key: "status" }, { label: "Requested", key: "requestedAt", date: true }],
  transfers: [{ label: "Serial", key: "serial" }, { label: "From", key: "sourceOrganizationName" }, { label: "To", key: "targetOrganizationName" }, { label: "Status", key: "status" }, { label: "Requested", key: "requestedAt", date: true }],
  audit: [{ label: "When", key: "effectiveAt", date: true }, { label: "Actor", key: "actorName" }, { label: "Organization", key: "organizationName" }, { label: "Serial", key: "serial" }, { label: "Action", key: "action" }, { label: "From", key: "previousStatus" }, { label: "To", key: "newStatus" }, { label: "Reason", key: "reason" }],
};
const titles: Record<WorkflowArea, string> = { registry: "Device Registry", allocations: "Allocations", inventory: "Devices", "claim-requests": "Claim Requests", transfers: "Device Transfers", audit: "Device Audit" };
const descriptions: Record<WorkflowArea, string> = {
  registry: "Registered Transcend devices and their lifecycle status.",
  allocations: "Allocate registered devices to approved homecare providers.",
  inventory: "Allocated devices, verified claims, and patient assignments for your organization.",
  "claim-requests": "Track and review requests for devices without an existing allocation.",
  transfers: "Move devices between organizations through an approved transfer.",
  audit: "History of device registrations, allocations, claims, assignments, and transfers.",
};
const statuses: Record<WorkflowArea, string[]> = {
  registry: ["available", "allocated", "claimed", "assigned", "returned", "restricted", "retired"],
  allocations: ["active", "released"], inventory: ["allocated", "claimed", "assigned", "returned", "restricted"],
  "claim-requests": ["pending", "approved", "rejected"],
  transfers: ["pending_release", "pending_acceptance", "pending_review", "completed", "rejected"], audit: [],
};

function permissionFor(action: FormKind, area: WorkflowArea): Permission {
  if (["import", "restrict", "retire"].includes(action)) return "registry:write";
  if (action === "allocate") return "allocations:write";
  if (action === "assign" || action === "return") return "assignments:write";
  if (action === "request") return "claims:write";
  if (action === "approve" || action === "reject") return area === "claim-requests" ? "claims:review" : "transfers:review";
  return "transfers:write";
}

export default function WorkflowDirectory({ area, mode }: { area: WorkflowArea; mode: Mode }) {
  const { context, error: contextError, retry } = useWorkflowContext();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<PageResult<WorkflowRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<{ kind: FormKind; row?: WorkflowRow } | null>(null);
  const allowed = (kind: FormKind) => context?.permissions.includes(permissionFor(kind, area));
  const refresh = () => setRevision((n) => n + 1);
  useEffect(() => {
    if (!context) return;
    let active = true; setLoading(true); setError(null); setData(null);
    deviceWorkflowApi.list(area, { page, limit, search: query, status }).then((result) => {
      if (!Array.isArray(result.items) || !Number.isInteger(result.total) || result.total < 0 || result.page !== page || result.limit !== limit) throw new Error("Could not read the device list. Please contact Transcend support.");
      if (active) setData(result);
    }).catch((e) => { if (active) setError(workflowError(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [context, area, page, limit, query, status, revision]);
  const create: FormKind | null = mode === "admin" && area === "registry" ? "import"
    : mode === "admin" && area === "allocations" ? "allocate"
    : mode === "provider" && area === "claim-requests" ? "request"
    : area === "transfers" ? "transfer" : null;
  const open = (kind: FormKind, row?: WorkflowRow) => { setMessage(null); setForm({ kind, row }); };
  const createLabel = create === "import" ? "Register devices" : create === "allocate" ? "Allocate devices" : create === "request" ? "Request approval" : "Request transfer";

  return <>
    <PageHeader title={titles[area]} subtitle={descriptions[area]} actions={
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary disabled:opacity-50" onClick={refresh} disabled={!context || loading || !!form}><RefreshCw className="w-4 h-4" /> Refresh</button>
        {area === "inventory" && context?.permissions.includes("claims:write") && <Link href="/provider/devices/claim" className="btn-primary">Verify & claim</Link>}
        {create && allowed(create) && <button type="button" className="btn-primary" disabled={!!form} onClick={() => open(create)}><Plus className="w-4 h-4" /> {createLabel}</button>}
      </div>
    } />
    {contextError ? <ErrorNotice message={contextError} retry={retry} /> : !context ? <p role="status" className="card p-6">Loading device management…</p> : <>
      {message && <div role="status" className="card p-4 mb-4 border-green-200 bg-green-50 text-green-800">{message}</div>}
      {form && <ActionForm key={`${form.kind}:${form.row?.id ?? "new"}`} kind={form.kind} row={form.row} area={area}
        onCancel={() => setForm(null)} onDone={(msg) => { setForm(null); setMessage(msg); refresh(); }} />}
      <form className="card p-3 mb-4 flex flex-wrap gap-3 items-end" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}>
        <label className="text-sm flex-1 min-w-[180px]">Search
          <input className="input mt-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Serial or reference…" />
        </label>
        {!!statuses[area].length && <label className="text-sm">Status<select className="input mt-1" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>{statuses[area].map((s) => <option key={s} value={s}>{outcomeLabel(s)}</option>)}
        </select></label>}
        <button className="btn-secondary" type="submit">Search</button>
      </form>
      {error && <ErrorNotice message={error} retry={refresh} />}
      <div className="card overflow-x-auto" aria-busy={loading}>
        {loading ? <p role="status" className="p-8 text-center text-slate-500">Loading…</p> : !error && data && (data.items.length ? <table className="w-full text-sm">
          <caption className="sr-only">{titles[area]}, page {page}</caption>
          <thead className="bg-slate-50 text-xs text-slate-500"><tr>{columns[area].map((c) => <th scope="col" key={c.key} className="px-4 py-3 text-left font-medium whitespace-nowrap">{c.label}</th>)}{area !== "audit" && <th scope="col" className="px-4 py-3 text-left">Details / actions</th>}</tr></thead>
          <tbody>{data.items.map((row) => <tr key={row.id} className="border-t border-slate-100">
            {columns[area].map((c) => <td key={c.key} className="px-4 py-3 align-top max-w-xs break-words">{c.date ? formatDateTime(row[c.key] as string) || "—" : c.key === "status" ? <span className="badge badge-slate">{outcomeLabel(row.status ?? "Unknown")}</span> : Array.isArray(row[c.key]) ? (row[c.key] as string[]).join(", ") : row[c.key] || "—"}</td>)}
            {area !== "audit" && <td className="px-4 py-3 min-w-[180px]">
              {(row.reason || row.reviewReason) && <details className="mb-2"><summary className="cursor-pointer text-brand-600">Request details</summary><p className="mt-2 whitespace-pre-wrap">{row.reason}</p>{row.reviewReason && <p className="mt-2">Decision: {row.reviewReason}</p>}</details>}
              <div className="flex flex-wrap gap-2">{(row.allowedActions ?? []).filter((action) => allowed(action)).map((action) => <button key={action} type="button" className="btn-secondary text-xs" disabled={!!form} onClick={() => open(action, row)}>{outcomeLabel(action)}</button>)}</div>
              {!row.allowedActions?.length && !row.reason && !row.reviewReason && <span className="text-slate-400">—</span>}
            </td>}
          </tr>)}</tbody>
        </table> : <p className="p-8 text-center text-slate-500">No {titles[area].toLowerCase()} match these filters.</p>)}
      </div>
      <nav aria-label={`${titles[area]} pagination`} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>Page {page}{data ? ` of ${Math.max(1, Math.ceil(data.total / limit))} · ${data.total} records` : ""}</span>
        <label>Per page <select className="input !w-auto" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>{[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <div className="flex gap-2"><button className="btn-secondary" disabled={loading || page === 1} onClick={() => setPage((n) => n - 1)}>Previous</button><button className="btn-secondary" disabled={loading || !!error || !data || page * limit >= data.total} onClick={() => setPage((n) => n + 1)}>Next</button></div>
      </nav>
    </>}
  </>;
}

function ActionForm({ kind, row, area, onCancel, onDone }: {
  kind: FormKind; row?: WorkflowRow; area: WorkflowArea; onCancel: () => void; onDone: (message: string) => void;
}) {
  const [serials, setSerials] = useState(row?.serial ?? "");
  const [model, setModel] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { busy, run } = useMutation();
  const title = ({ import: "Register devices", allocate: "Allocate devices", request: "Request claim approval", transfer: "Request device transfer", assign: "Assign patient", return: "Return device", restrict: "Restrict device", retire: "Retire device", approve: "Approve request", reject: "Reject request", release: "Release for transfer", accept: "Accept transfer" })[kind];
  const needsSerials = ["import", "allocate", "request", "transfer"].includes(kind);
  const needsOrg = kind === "allocate" || kind === "transfer";
  const needsReference = ["import", "allocate", "request", "transfer"].includes(kind);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (busy) return;
    try {
      let path = ""; let payload: Record<string, unknown> = {};
      const parsed = needsSerials ? parseSerials(serials).serials : [];
      if (needsOrg && !organizationId) throw new Error("Select an eligible organization.");
      if (needsReference && !reference.trim()) throw new Error("Enter an order, shipment, or manufacturing reference.");
      if (!reason.trim()) throw new Error("Enter a reason for the audit history.");
      if (!confirmed) throw new Error("Confirm the details before continuing.");
      if (kind === "import") {
        if (!model.trim()) throw new Error("Enter the model for this batch.");
        path = "registry/import"; payload = { devices: parsed.map((serial) => ({ serial, model: model.trim() })), reference: reference.trim() };
      } else if (kind === "allocate") { path = "allocations"; payload = { serials: parsed, organizationId, reference: reference.trim() }; }
      else if (kind === "request") { path = "claim-requests"; payload = { serials: parsed, reference: reference.trim() }; }
      else if (kind === "transfer") {
        if (parsed.length !== 1) throw new Error("Request a transfer for one device at a time.");
        path = "transfers"; payload = { serial: parsed[0], targetOrganizationId: organizationId, reference: reference.trim() };
      } else {
        if (!row) throw new Error("Select a record first.");
        const id = encodeURIComponent(row.id);
        if (kind === "approve" || kind === "reject") { path = `${area}/${id}/review`; payload = { decision: kind === "approve" ? "approved" : "rejected" }; }
        else if (kind === "release" || kind === "accept") path = `transfers/${id}/${kind}`;
        else if (kind === "restrict" || kind === "retire") { path = `registry/${id}/status`; payload = { status: kind === "restrict" ? "restricted" : "retired" }; }
        else {
          if (!date || !Number.isFinite(new Date(date).getTime())) throw new Error("Enter a valid effective date and time.");
          path = `inventory/${id}/${kind === "assign" ? "assignment" : "return"}`;
          payload = { effectiveAt: new Date(date).toISOString() };
          if (kind === "assign") { if (!patientId) throw new Error("Select an eligible patient."); payload.patientId = patientId; }
        }
      }
      const result = await run(path, { ...payload, reason: reason.trim() });
      onDone(result.message + (result.results?.length ? " " + result.results.map((r) => `${r.serial}: ${r.message || outcomeLabel(r.outcome)}`).join("; ") : ""));
    } catch (e) { setError(workflowError(e)); }
  }
  return <form onSubmit={submit} className="card p-5 mb-6 border-brand-200 max-w-3xl" aria-label={title}>
    <h2 className="font-semibold text-lg mb-2">{title}</h2>
    {row && <p className="text-sm text-slate-600 mb-4">{row.serial || row.serials?.join(", ")}{row.organizationName ? ` · ${row.organizationName}` : ""}</p>}
    {error && <ErrorNotice message={error} />}
    <fieldset disabled={busy} className="space-y-4">
      {needsSerials && <label className="block text-sm">{kind === "transfer" ? "Device serial" : "Device serials"}<textarea required className="input mt-1 min-h-[90px] font-mono" value={serials} onChange={(e) => setSerials(e.target.value)} placeholder="One serial per line, up to 100" /><span className="text-xs text-slate-500">Exact serials from the device label or manufacturing record. Duplicates are removed.</span></label>}
      {kind === "import" && <label className="block text-sm">Model<input aria-label="Model" required maxLength={120} className="input mt-1" value={model} onChange={(e) => setModel(e.target.value)} /><span className="text-xs text-slate-500">Register one model per batch using verified manufacturing records.</span></label>}
      {needsOrg && <ChoicePicker kind="organizations" label={kind === "transfer" ? "Destination organization" : "Approved HCP"} value={organizationId} onChange={setOrganizationId} />}
      {kind === "assign" && <ChoicePicker kind="patients" label="Patient" value={patientId} onChange={setPatientId} />}
      {(kind === "assign" || kind === "return") && <label className="block text-sm">Effective date and time (your local time)<input required className="input mt-1" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></label>}
      {needsReference && <label className="block text-sm">{kind === "import" ? "Manufacturing reference" : "Order / shipment reference"}<input required maxLength={200} className="input mt-1" value={reference} onChange={(e) => setReference(e.target.value)} /></label>}
      <label className="block text-sm">Reason<textarea required maxLength={2000} className="input mt-1" value={reason} onChange={(e) => setReason(e.target.value)} /></label>
      {kind === "request" && <p className="text-sm text-slate-600">This submits a request for Transcend review. It does not claim the device or grant patient-data access.</p>}
      {kind === "transfer" && <p className="text-sm text-slate-600">The device remains with its current organization until the required release, acceptance, and review are complete.</p>}
      {kind === "return" && <p className="text-sm text-slate-600">This ends the current patient assignment. Previous patient history remains separate; the device must be cleared for reuse.</p>}
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />
        <span>{kind === "assign" ? "I have verified the patient, setup details, and authorization to provide care." : kind === "retire" ? "I understand that retiring this device prevents future allocations and claims." : "I have checked these details and am authorized to perform this action."}</span>
      </label>
      <div className="flex gap-2 justify-end"><button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button><button className="btn-primary" type="submit">{busy ? "Submitting…" : title}</button></div>
    </fieldset>
  </form>;
}
