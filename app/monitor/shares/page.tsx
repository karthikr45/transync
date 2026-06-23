"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { IncomingShare, ShareStatus } from "@/lib/types.api";

export default function MonitorShares() {
  const [pending, setPending] = useState<IncomingShare[]>([]);
  const [decided, setDecided] = useState<IncomingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { pending, shares } = await homeCareApi.listIncomingShares();
      setPending(pending);
      setDecided(shares);
    } catch (err) {
      setError((err as ApiError).message || "Could not load incoming shares.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, action: "accept" | "decline") {
    setBusyId(id);
    try {
      if (action === "accept") await homeCareApi.acceptShare(id);
      else await homeCareApi.declineShare(id);
      const row = pending.find((p) => p.id === id);
      if (row) {
        const next: IncomingShare = { ...row, status: action === "accept" ? "accepted" : "declined" };
        setPending((p) => p.filter((x) => x.id !== id));
        setDecided((d) => [next, ...d]);
      }
    } catch (err) {
      alert((err as ApiError).message || `Could not ${action} share.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Shares"
        subtitle="Patients that Homecare Providers have shared with your monitoring account."
        actions={
          <button onClick={load} disabled={loading} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
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
          <table className="w-full text-sm">
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
                  <td className="px-5 py-3 text-slate-600">{formatDateTime(s.requestedAt) || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(s.validTill) || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="btn-secondary disabled:opacity-50"
                        disabled={busyId === s.id}
                        onClick={() => decide(s.id, "decline")}
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                      <button
                        className="btn-primary disabled:opacity-50"
                        disabled={busyId === s.id}
                        onClick={() => decide(s.id, "accept")}
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Active & past shares</h2>
        </div>
        <table className="w-full text-sm">
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
              <tr><td colSpan={5} className="px-5 py-6 text-sm text-slate-500 text-center">No active or past shares yet.</td></tr>
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
        </table>
      </div>
    </>
  );
}

function badgeFor(status: ShareStatus): string {
  switch (status) {
    case "accepted": return "badge-green";
    case "pending": return "badge-amber";
    case "declined": return "badge-red";
    case "revoked": return "badge-slate";
  }
}
