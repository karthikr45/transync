"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Printer, RefreshCw, AlertTriangle } from "lucide-react";
import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser } from "@/lib/auth";
import type { ReportBySessionResult, SessionWindow } from "@/lib/types.api";

const SESSIONS: { id: SessionWindow; label: string }[] = [
  { id: 0, label: "Last night" },
  { id: 1, label: "7 days" },
  { id: 2, label: "28 days" },
  { id: 3, label: "90 days" },
  { id: 4, label: "365 days" },
];

export default function PatientReports() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentEndUser>>(null);
  const [session, setSession] = useState<SessionWindow>(2);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<ReportBySessionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setUser(getCurrentEndUser()); }, []);

  const load = useCallback(async () => {
    if (!user?.email || !user.deviceId) return;
    setLoading(true); setError(null);
    try {
      const r = await endUserApi.reportBySession({
        email: user.email,
        deviceId: user.deviceId,
        session,
        timeZoneName: user.timeZone || undefined,
        startDate: start || undefined,
        endDate: end || undefined,
      });
      setData(r);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load report.");
    } finally { setLoading(false); }
  }, [user, session, start, end]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <>
        <PageHeader title="Reports" />
        <div className="card p-8 text-center text-sm text-slate-500">
          Not signed in. <a href="/login" className="text-brand-600 font-medium">Log on</a>.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Compliance Report"
        subtitle="Generated from your device&apos;s event stream."
        actions={<button className="btn-primary" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print to PDF</button>}
      />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 px-2">Window:</span>
        {SESSIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSession(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${session === s.id ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {s.label}
          </button>
        ))}
        <span className="text-xs text-slate-400 mx-2">or pick a range:</span>
        <input className="input !py-1.5" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <span className="text-slate-400">→</span>
        <input className="input !py-1.5" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button className="btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Submit
        </button>
      </div>

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : data ? (
        <div className="space-y-5">
          <Section title="Range">
            <p className="text-sm text-slate-700">{data.datesOfReport}</p>
          </Section>

          <Section title="Usage">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Cell label="Days used" value={String(data.usage)} />
              <Cell label="Days in range" value={String(data.numberOfDays)} />
              <Cell label="Days not used" value={String(data.notUsed)} />
              <Cell label="Avg / night" value={`${data.averageHoursPerNight.toFixed(1)} h`} />
              <Cell label="Days ≥ 4 h" value={String(data.greaterThanFour)} />
              <Cell label="Days ≥ 6 h" value={String(data.greaterThanSix)} />
              <Cell label="Sleep score" value={String(data.sleepScore)} />
              <Cell label="Avg mask removed" value={String(data.avgMaskRemoved)} />
            </dl>
          </Section>

          <div className="grid md:grid-cols-2 gap-5">
            <Section title="AHI">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Cell label="AHI" value={data.AHI.toFixed(1)} />
                <Cell label="Apnea" value={data.apnea.toFixed(1)} />
                <Cell label="Hypopnea" value={data.hypopnea.toFixed(1)} />
                <Cell label="Apnea %" value={`${data.apneaPercentage.toFixed(1)}%`} />
                <Cell label="Avg apnea length" value={`${data.apneaAvgLength.toFixed(1)} s`} />
                <Cell label="Longest apnea" value={`${data.longestApnea} s`} />
                <Cell label="Total duration" value={`${data.apneaDuration.toFixed(1)} s`} />
                <Cell label="Flow-limited index" value={data.flowLtdIndex.toFixed(2)} />
              </dl>
            </Section>
            <Section title="Snore">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Cell label="Snore index" value={data.snoreIndex.toFixed(2)} />
              </dl>
            </Section>
            <Section title="Pressure">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Cell label="Min" value={`${data.minPressure.toFixed(1)} cmH₂O`} />
                <Cell label="Max" value={`${data.maxPressure.toFixed(1)} cmH₂O`} />
                <Cell label="Average" value={`${data.averagePressure.toFixed(1)} cmH₂O`} />
                <Cell label="95th percentile" value={`${data.ninetyFivePercentilePressure.toFixed(1)} cmH₂O`} />
              </dl>
            </Section>
            <Section title="Leak">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Cell label="Average" value={`${data.averageLeak.toFixed(1)} L/min`} />
                <Cell label="95th percentile" value={`${data.ninetyFivePercentileLeak.toFixed(1)} L/min`} />
                <Cell label="Avg range" value={data.leakAvgRange.toFixed(2)} />
              </dl>
            </Section>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium mt-0.5">{value}</dd>
    </div>
  );
}
