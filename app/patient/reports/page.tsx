"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import MobileReport from "@/components/MobileReport";
import { Printer, RefreshCw, AlertTriangle } from "lucide-react";
import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser } from "@/lib/auth";
import type { ReportBySessionResult, SessionWindow, LastSyncResult } from "@/lib/types.api";
import { fromReportBySessionResult } from "@/lib/report-vm";

const RANGES: { label: string; session: SessionWindow }[] = [
  { label: "Last night", session: 0 },
  { label: "7 Days", session: 1 },
  { label: "30 Days", session: 2 },
  { label: "90 Days", session: 3 },
  { label: "365 Days", session: 4 },
];

export default function PatientReports() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentEndUser>>(null);
  const [rangeLabel, setRangeLabel] = useState("90 Days");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<ReportBySessionResult | null>(null);
  const [sync, setSync] = useState<LastSyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setUser(getCurrentEndUser()); }, []);

  const session = RANGES.find((r) => r.label === rangeLabel)?.session ?? 3;

  const load = useCallback(async () => {
    if (!user?.email || !user.deviceId) return;
    setLoading(true); setError(null);
    try {
      const [r, s] = await Promise.allSettled([
        endUserApi.reportBySession({
          email: user.email,
          deviceId: user.deviceId,
          session,
          timeZoneName: user.timeZone || undefined,
          startDate: start || undefined,
          endDate: end || undefined,
        }),
        endUserApi.getLastSyncDate({ email: user.email, deviceId: user.deviceId }),
      ]);
      if (r.status === "fulfilled") setData(r.value);
      else throw r.reason;
      if (s.status === "fulfilled") setSync(s.value);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load report.");
    } finally { setLoading(false); }
  }, [user, session, start, end]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <>
        <PageHeader title="Report" />
        <div className="card p-8 text-center text-sm text-slate-500">
          Not signed in. <a href="/login" className="text-brand-600 font-medium">Log on</a>.
        </div>
      </>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  const vm = data
    ? fromReportBySessionResult(data, {
        name: fullName,
        email: user.email,
        deviceSerial: user.deviceId,
        provider: user.provider,
        lastSyncDate: sync?.lastSyncDate ?? user.lastSyncDate,
      })
    : null;

  return (
    <>
      <PageHeader title="Report" subtitle="Generated from your device's event stream." />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !vm ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : vm ? (
        <MobileReport
          vm={vm}
          rangeLabel={rangeLabel}
          rangeOptions={RANGES.map((r) => r.label)}
          onRangeSelect={(label) => { setStart(""); setEnd(""); setRangeLabel(label); }}
          customRange={
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-slate-500">or pick range:</span>
              <input className="input !py-1.5" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              <span className="text-slate-400">→</span>
              <input className="input !py-1.5" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          }
          headerActions={
            <>
              <button className="btn-secondary" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print to PDF
              </button>
            </>
          }
        />
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
      )}
    </>
  );
}
