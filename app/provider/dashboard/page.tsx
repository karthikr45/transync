"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import ComplianceBadge from "@/components/ComplianceBadge";
import {
  Users, AlertTriangle, ShieldCheck, HardDrive, Clock, RefreshCw,
} from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { ProviderDashboardResult, ComplianceStatus } from "@/lib/types.api";

const STATUS_UI: Record<ComplianceStatus, "compliant" | "at-risk" | "non-compliant"> = {
  compliant: "compliant",
  at_risk: "at-risk",
  non_compliant: "non-compliant",
};

export default function ProviderDashboard() {
  const [data, setData] = useState<ProviderDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      setData(await homeCareApi.providerDashboard());
    } catch (err) {
      setError((err as ApiError).message || "Could not load dashboard.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const m = data?.metrics;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Compliance overview across your patient population."
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total patients" value={m?.totalPatients ?? "—"} icon={<Users className="w-5 h-5" />} />
        <StatCard
          label="Compliant"
          value={m?.compliant ?? "—"}
          hint={m ? `${m.compliantPct}%` : undefined}
          tone="good"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <StatCard
          label="At risk / non-compliant"
          value={m?.atRiskOrNonCompliant ?? "—"}
          tone="bad"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard label="Unassigned devices" value={m?.unassignedDevices ?? "—"} icon={<HardDrive className="w-5 h-5" />} />
      </div>

      {m && m.awaitingConsent > 0 && (
        <div className="card p-4 mt-6 flex items-start gap-3 bg-amber-50 border-amber-100">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>{m.awaitingConsent} patient{m.awaitingConsent === 1 ? "" : "s"} awaiting consent.</strong>{" "}
            Their compliance data is hidden until the patient approves monitoring.
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Patients needing attention</h2>
          {loading && !data ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : !data || data.patientsNeedingAttention.length === 0 ? (
            <p className="text-sm text-slate-500">Nobody needs attention right now.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium py-1">Patient</th>
                  <th className="text-right font-medium py-1">Usage 7d</th>
                  <th className="text-right font-medium py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.patientsNeedingAttention.map((p, i) => (
                  <tr key={`${p.name}-${i}`} className="border-t border-slate-100">
                    <td className="py-2 text-slate-800 font-medium">{p.name}</td>
                    <td className="py-2 text-right">{p.usage7d.toFixed(1)}h</td>
                    <td className="py-2 text-right"><ComplianceBadge status={STATUS_UI[p.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Recent alerts</h2>
          {loading && !data ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : !data || data.recentAlerts.length === 0 ? (
            <p className="text-sm text-slate-500">No recent alerts.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentAlerts.map((a, i) => (
                <li key={`${a.patientName}-${i}`} className="py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${a.severity === "high" ? "bg-red-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{a.patientName}</div>
                    <div className="text-xs text-slate-600">{a.message}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(a.date)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
