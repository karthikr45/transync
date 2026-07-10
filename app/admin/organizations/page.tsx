"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { AlertTriangle, Ban, RefreshCw, RotateCcw, Search, X } from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { AdminClientRow, AdminClientsResult, ClientStatus, UserType } from "@/lib/types.api";

type TypeFilter = "all" | UserType;
type StatusFilter = "all" | ClientStatus;

const PAGE_SIZE = 25;

const TYPE_LABEL: Record<UserType, string> = {
  home_care_provider: "Homecare Provider",
  authorized_monitor: "Authorized Monitor",
};

const STATUS_LABEL: Record<ClientStatus, string> = {
  pending: "Pending",
  approved: "Active",
  rejected: "Rejected",
  suspended: "Suspended",
};

const STATUS_BADGE: Record<ClientStatus, string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
  suspended: "badge-red",
};

export default function AdminOrganizations() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<AdminClientsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<
    | { row: AdminClientRow; action: "suspend" }
    | { row: AdminClientRow; action: "reinstate" }
    | null
  >(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (o = offset) => {
    setLoading(true); setError(null);
    try {
      const res = await homeCareApi.adminClients({
        userType: type === "all" ? undefined : type,
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: o,
      });
      setData(res);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load organizations.");
    } finally { setLoading(false); }
  }, [type, status, search, offset]);

  useEffect(() => { load(0); setOffset(0); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [type, status]);
  // Debounce search: 400 ms after the last keystroke.
  useEffect(() => {
    const t = setTimeout(() => { load(0); setOffset(0); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function applyAction() {
    if (!confirm) return;
    setBusy(true); setBusyId(confirm.row.id);
    try {
      if (confirm.action === "suspend") {
        await homeCareApi.adminSuspendClient(confirm.row.id, { reason: reason.trim() || undefined });
      } else {
        await homeCareApi.adminReinstateClient(confirm.row.id);
      }
      setConfirm(null);
      setReason("");
      await load(offset);
    } catch (e) {
      alert((e as ApiError).message || "Action failed.");
    } finally { setBusy(false); setBusyId(null); }
  }

  const rows = data?.clients ?? [];
  const total = data?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Organizations"
        subtitle="All registered organizations on the platform."
        actions={
          <button onClick={() => load(offset)} disabled={loading} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      {error && (
        <div role="alert" className="card p-3 mb-4 bg-red-50 border-red-100 text-red-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search company, institution, name, email or username…"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "home_care_provider", "authorized_monitor"] as TypeFilter[]).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${type === t ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}>
              {t === "all" ? "All types" : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "suspended", "rejected"] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${status === s ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}>
              {s === "all" ? "All statuses" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Organization</th>
              <th className="text-left font-medium px-5 py-2">Type</th>
              <th className="text-left font-medium px-5 py-2">Country</th>
              <th className="text-left font-medium px-5 py-2">Joined</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">Loading…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">No organizations match these filters.</td></tr>
            )}
            {rows.map((o) => {
              const badgeCls = STATUS_BADGE[o.status] ?? "badge-slate";
              const label = STATUS_LABEL[o.status] ?? o.status;
              return (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="text-slate-900 font-medium">{o.name}</div>
                    <div className="text-xs text-slate-500">{o.contactEmail}</div>
                  </td>
                  <td className="px-5 py-3"><span className="badge badge-slate">{TYPE_LABEL[o.userType]}</span></td>
                  <td className="px-5 py-3 text-slate-600">{o.country || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(o.joinedAt) || "—"}</td>
                  <td className="px-5 py-3"><span className={`badge ${badgeCls}`}>{label}</span></td>
                  <td className="px-5 py-3 text-right">
                    {o.status === "approved" && (
                      <button
                        className="btn-secondary disabled:opacity-50"
                        onClick={() => { setConfirm({ row: o, action: "suspend" }); setReason(""); }}
                        disabled={busyId === o.id}
                      >
                        <Ban className="w-4 h-4" /> Suspend
                      </button>
                    )}
                    {o.status === "suspended" && (
                      <button
                        className="btn-secondary disabled:opacity-50"
                        onClick={() => setConfirm({ row: o, action: "reinstate" })}
                        disabled={busyId === o.id}
                      >
                        <RotateCcw className="w-4 h-4" /> Reinstate
                      </button>
                    )}
                    {(o.status === "pending" || o.status === "rejected") && (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>
            Showing {offset + 1}–{Math.min(offset + rows.length, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset === 0 || loading}
              onClick={() => { const n = Math.max(0, offset - PAGE_SIZE); setOffset(n); load(n); }}
            >
              Previous
            </button>
            <button
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => { const n = offset + PAGE_SIZE; setOffset(n); load(n); }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {confirm && (
        <div
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirm(null); }}
        >
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {confirm.action === "suspend" ? "Suspend organization" : "Reinstate organization"}
              </h2>
              <button onClick={() => setConfirm(null)} className="text-slate-400 hover:text-slate-700" disabled={busy}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {confirm.action === "suspend" ? (
              <>
                <p className="text-sm text-red-700 mt-2 bg-red-50 rounded-lg p-3">
                  Suspending <strong>{confirm.row.name}</strong> blocks all their logins and data access immediately.
                  This is reversible.
                </p>
                <div className="mt-3">
                  <label className="label" htmlFor="suspend-reason">Reason (optional)</label>
                  <textarea
                    id="suspend-reason"
                    className="input min-h-[80px] text-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Recorded with the suspension for the audit log."
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600 mt-2">
                Reinstating <strong>{confirm.row.name}</strong> restores login and data access for their users.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirm(null)} disabled={busy}>Cancel</button>
              <button
                className={`${confirm.action === "suspend" ? "btn-danger" : "btn-primary"} disabled:opacity-50`}
                onClick={applyAction}
                disabled={busy}
              >
                {busy ? "Working…" : confirm.action === "suspend" ? "Suspend" : "Reinstate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
