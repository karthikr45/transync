// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiButton from "@/components/ui/Button";
import UiTable from "@/components/ui/Table";

import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";

import { formatDate, formatDateTime } from "@/lib/format";

import { badgeFor } from "./model";

import { useMonitorSharesModel } from "./hooks";
export default function MonitorShares() {
  const { pending, decided, loading, error, busyId, load, decide } = useMonitorSharesModel();
  return (
    <>
      <PageHeader
        title="Shares"
        subtitle="Patients that Homecare Providers have shared with your monitoring account."
        actions={
          <UiButton
            variant="secondary"
            type="submit"
            onClick={load}
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

      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Pending requests</h2>
          <span className="badge badge-amber">{pending.length}</span>
        </div>
        {loading && pending.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No pending share requests.</p>
        ) : (
          <UiTable className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-2">Patient</th>
                <th className="text-left font-medium px-5 py-2">Devices</th>
                <th className="text-left font-medium px-5 py-2">Requested</th>
                <th className="text-left font-medium px-5 py-2">Valid till</th>
                <th className="text-right font-medium px-5 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-900 font-medium">{s.patientName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    {s.devices.length ? s.devices.join(", ") : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatDateTime(s.requestedAt) || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(s.validTill) || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <UiButton
                        variant="secondary"
                        type="submit"
                        className="btn-secondary disabled:opacity-50"
                        disabled={busyId === s.id}
                        onClick={() => decide(s.id, "decline")}
                      >
                        <X className="w-4 h-4" /> Decline
                      </UiButton>
                      <UiButton
                        variant="primary"
                        type="submit"
                        className="btn-primary disabled:opacity-50"
                        disabled={busyId === s.id}
                        onClick={() => decide(s.id, "accept")}
                      >
                        <Check className="w-4 h-4" /> Accept
                      </UiButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </UiTable>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Active & past shares</h2>
        </div>
        <UiTable className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient</th>
              <th className="text-left font-medium px-5 py-2">Devices</th>
              <th className="text-left font-medium px-5 py-2">Granted</th>
              <th className="text-left font-medium px-5 py-2">Valid till</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {decided.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-sm text-slate-500 text-center">
                  No active or past shares yet.
                </td>
              </tr>
            )}
            {decided.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{s.patientName}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">
                  {s.devices.length ? s.devices.join(", ") : "—"}
                </td>
                <td className="px-5 py-3 text-slate-600">{formatDateTime(s.grantedAt) || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{formatDate(s.validTill) || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${badgeFor(s.status)}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </UiTable>
      </div>
    </>
  );
}
