"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import type {
  ComplianceWindow, ProviderReportsResult,
} from "@/lib/types.api";

const PAGE_SIZE = 50;

const WINDOWS: { id: ComplianceWindow; label: string }[] = [
  { id: "24h", label: "Past 24 hours" },
  { id: "7d", label: "Past 7 days" },
  { id: "30d", label: "Past 30 days" },
  { id: "90d", label: "Past 90 days" },
];

export default function GroupReports() {
  const [window, setWindow] = useState<ComplianceWindow>("30d");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ProviderReportsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(w = window, o = offset) {
    setLoading(true); setError(null);
    try {
      setData(await homeCareApi.providerReports({ window: w, limit: PAGE_SIZE, offset: o }));
    } catch (err) {
      setError((err as ApiError).message || "Could not load report.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(window, 0); setOffset(0); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [window]);

  function exportCsv() {
    if (!data?.rows?.length) return;
    const header = ["patientId", "name", "deviceId", "totalDays", "therapyHours", "sessionsOver4h", "ahi", "pctCompliant", "compliant"];
    const rows = data.rows.map((r) => [
      r.patientId, r.name, r.deviceId, r.totalDays, r.therapyHours, r.sessionsOver4h,
      r.ahi.toFixed(2), r.pctCompliant, r.compliant ? "Yes" : "No",
    ].map(csvEscape).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${data.window}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Group Compliance Reports"
        subtitle="Management-by-exception view across your patient population."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => load(window, offset)} disabled={loading} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <button className="btn-secondary disabled:opacity-50" onClick={exportCsv} disabled={!data?.rows?.length}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        }
      />

      {error && (
        <div role="alert" className="card p-3 mb-4 bg-red-50 border-red-100 text-red-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}

      <div className="card p-3 mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-500 px-2">Window:</span>
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            onClick={() => setWindow(w.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${window === w.id ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {w.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-600 px-2">
          {data ? `${data.pageSummary.compliant}/${data.pageSummary.total} compliant (${data.pageSummary.pct}%) on this page` : "—"}
        </span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient ID</th>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Device</th>
              <th className="text-right font-medium px-5 py-2">Days</th>
              <th className="text-right font-medium px-5 py-2">Therapy hours</th>
              <th className="text-right font-medium px-5 py-2">4+ hr nights</th>
              <th className="text-right font-medium px-5 py-2">AHI</th>
              <th className="text-right font-medium px-5 py-2">% compliant</th>
              <th className="text-right font-medium px-5 py-2">Compliant</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-500 text-sm">Loading…</td></tr>
            )}
            {!loading && data && data.rows.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-500 text-sm">No consented patients in this window.</td></tr>
            )}
            {data?.rows.map((r) => (
              <tr key={`${r.patientId}-${r.deviceId}`} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.patientId}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">{r.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.deviceId}</td>
                <td className="px-5 py-3 text-right">{r.totalDays}</td>
                <td className="px-5 py-3 text-right">{r.therapyHours}h</td>
                <td className="px-5 py-3 text-right">{r.sessionsOver4h}</td>
                <td className="px-5 py-3 text-right">{r.ahi.toFixed(1)}</td>
                <td className="px-5 py-3 text-right">{r.pctCompliant}%</td>
                <td className="px-5 py-3 text-right">
                  <span className={`badge ${r.compliant ? "badge-green" : "badge-red"}`}>{r.compliant ? "Yes" : "No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>Showing {data.offset + 1}–{Math.min(data.offset + data.rows.length, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset === 0 || loading}
              onClick={() => { const n = Math.max(0, offset - PAGE_SIZE); setOffset(n); load(window, n); }}
            >
              Previous
            </button>
            <button
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset + PAGE_SIZE >= data.total || loading}
              onClick={() => { const n = offset + PAGE_SIZE; setOffset(n); load(window, n); }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3">
        Compliant = ≥ 70% of nights with ≥ 4 hours therapy in the selected window. Pending-consent patients are excluded.
      </p>
    </>
  );
}

function csvEscape(v: string | number | boolean): string {
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
