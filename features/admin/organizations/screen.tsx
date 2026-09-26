// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiButton from "@/components/ui/Button";
import UiInput from "@/components/ui/Input";
import UiTable from "@/components/ui/Table";
import UiTextarea from "@/components/ui/Textarea";

import PageHeader from "@/components/PageHeader";
import { AlertTriangle, Ban, RefreshCw, RotateCcw, Search, X } from "lucide-react";

import { formatDate } from "@/lib/format";

import {
  TypeFilter,
  StatusFilter,
  PAGE_SIZE,
  TYPE_LABEL,
  STATUS_LABEL,
  STATUS_BADGE,
} from "./model";

import { useAdminOrganizationsModel } from "./hooks";
export default function AdminOrganizations() {
  const {
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    offset,
    setOffset,
    loading,
    error,
    confirm,
    setConfirm,
    reason,
    setReason,
    busy,
    busyId,
    load,
    applyAction,
    rows,
    total,
  } = useAdminOrganizationsModel();
  return (
    <>
      <PageHeader
        title="Organizations"
        subtitle="All registered organizations on the platform."
        actions={
          <UiButton
            variant="secondary"
            type="submit"
            onClick={() => load(offset)}
            disabled={loading}
            className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </UiButton>
        }
      />

      {error && (
        <div
          role="alert"
          className="card p-3 mb-4 bg-red-50 border-red-100 text-red-800 text-xs flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <UiInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search company, institution, name, email or username…"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "home_care_provider", "authorized_monitor"] as TypeFilter[]).map((t) => (
            <UiButton
              variant="plain"
              type="submit"
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${type === t ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
            >
              {t === "all" ? "All types" : TYPE_LABEL[t]}
            </UiButton>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "suspended", "rejected"] as StatusFilter[]).map((s) => (
            <UiButton
              variant="plain"
              type="submit"
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${status === s ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
            >
              {s === "all" ? "All statuses" : STATUS_LABEL[s]}
            </UiButton>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <UiTable className="w-full text-sm">
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
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No organizations match these filters.
                </td>
              </tr>
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
                  <td className="px-5 py-3">
                    <span className="badge badge-slate">{TYPE_LABEL[o.userType]}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{o.country || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(o.joinedAt) || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${badgeCls}`}>{label}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {o.status === "approved" && (
                      <UiButton
                        variant="secondary"
                        type="submit"
                        className="btn-secondary disabled:opacity-50"
                        onClick={() => {
                          setConfirm({ row: o, action: "suspend" });
                          setReason("");
                        }}
                        disabled={busyId === o.id}
                      >
                        <Ban className="w-4 h-4" /> Suspend
                      </UiButton>
                    )}
                    {o.status === "suspended" && (
                      <UiButton
                        variant="secondary"
                        type="submit"
                        className="btn-secondary disabled:opacity-50"
                        onClick={() => setConfirm({ row: o, action: "reinstate" })}
                        disabled={busyId === o.id}
                      >
                        <RotateCcw className="w-4 h-4" /> Reinstate
                      </UiButton>
                    )}
                    {(o.status === "pending" || o.status === "rejected") && (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </UiTable>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>
            Showing {offset + 1}–{Math.min(offset + rows.length, total)} of {total}
          </span>
          <div className="flex gap-2">
            <UiButton
              variant="secondary"
              type="submit"
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset === 0 || loading}
              onClick={() => {
                const n = Math.max(0, offset - PAGE_SIZE);
                setOffset(n);
              }}
            >
              Previous
            </UiButton>
            <UiButton
              variant="secondary"
              type="submit"
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => {
                const n = offset + PAGE_SIZE;
                setOffset(n);
              }}
            >
              Next
            </UiButton>
          </div>
        </div>
      )}

      {confirm && (
        <div
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirm(null);
          }}
        >
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {confirm.action === "suspend" ? "Suspend organization" : "Reinstate organization"}
              </h2>
              <UiButton
                variant="plain"
                type="submit"
                onClick={() => setConfirm(null)}
                className="text-slate-400 hover:text-slate-700"
                disabled={busy}
              >
                <X className="w-4 h-4" />
              </UiButton>
            </div>
            {confirm.action === "suspend" ? (
              <>
                <p className="text-sm text-red-700 mt-2 bg-red-50 rounded-lg p-3">
                  Suspending <strong>{confirm.row.name}</strong> blocks all their logins and data
                  access immediately. This is reversible.
                </p>
                <div className="mt-3">
                  <label className="label" htmlFor="suspend-reason">
                    Reason (optional)
                  </label>
                  <UiTextarea
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
                Reinstating <strong>{confirm.row.name}</strong> restores login and data access for
                their users.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <UiButton
                variant="secondary"
                type="submit"
                className="btn-secondary"
                onClick={() => setConfirm(null)}
                disabled={busy}
              >
                Cancel
              </UiButton>
              <UiButton
                variant="primary"
                type="submit"
                className={`${confirm.action === "suspend" ? "btn-danger" : "btn-primary"} disabled:opacity-50`}
                onClick={applyAction}
                disabled={busy}
              >
                {busy ? "Working…" : confirm.action === "suspend" ? "Suspend" : "Reinstate"}
              </UiButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
