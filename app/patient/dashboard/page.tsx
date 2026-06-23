"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Moon, Wind, Gauge, Activity, RefreshCw, AlertTriangle, Smartphone } from "lucide-react";
import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { DataBySessionResult, SessionWindow, LastSyncResult } from "@/lib/types.api";

const SESSIONS: { id: SessionWindow; label: string }[] = [
  { id: 0, label: "Last night" },
  { id: 1, label: "7 days" },
  { id: 2, label: "28 days" },
  { id: 3, label: "90 days" },
  { id: 4, label: "365 days" },
];

export default function PatientDashboard() {
  const [user, setUser] = useState<ReturnType<typeof getCurrentEndUser>>(null);
  const [session, setSession] = useState<SessionWindow>(1);
  const [data, setData] = useState<DataBySessionResult | null>(null);
  const [sync, setSync] = useState<LastSyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setUser(getCurrentEndUser()); }, []);

  const load = useCallback(async () => {
    if (!user || !user.email || !user.deviceId) return;
    setLoading(true); setError(null);
    try {
      const [d, s] = await Promise.allSettled([
        endUserApi.getDataBySession({ email: user.email, deviceId: user.deviceId, session, timeZoneName: user.timeZone || undefined }),
        endUserApi.getLastSyncDate({ email: user.email, deviceId: user.deviceId }),
      ]);
      if (d.status === "fulfilled") setData(d.value);
      else throw d.reason;
      if (s.status === "fulfilled") setSync(s.value);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load data.");
    } finally { setLoading(false); }
  }, [user, session]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="card p-8 text-center text-sm text-slate-500">
          You&apos;re not signed in as a patient. <a href="/login" className="text-brand-600 font-medium">Log on</a> or <a href="/register/patient" className="text-brand-600 font-medium">create an account</a>.
        </div>
      </>
    );
  }

  const first = user.firstName || user.email.split("@")[0];

  return (
    <>
      <PageHeader
        title={`Hi, ${first}`}
        subtitle="Your CPAP therapy summary."
        actions={
          <button className="btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
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
        {sync?.lastSyncDate && (
          <span className="ml-auto text-xs text-slate-500 inline-flex items-center gap-1 px-2">
            <Smartphone className="w-3.5 h-3.5" /> Last sync {formatDateTime(sync.lastSyncDate)}
          </span>
        )}
      </div>

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Usage" value={`${data.usageHours.toFixed(1)}h`} hint="avg / night" tone="good" icon={<Activity className="w-5 h-5" />} />
          <StatCard label="AHI" value={data.ahi.toFixed(1)} hint="events / hour" icon={<Moon className="w-5 h-5" />} />
          <StatCard label="Avg leak" value={`${data.avgLeak.toFixed(0)}`} hint="L/min" icon={<Wind className="w-5 h-5" />} />
          <StatCard label="Mask removed" value={data.maskRemoved} icon={<Gauge className="w-5 h-5" />} />
          <StatCard label="Sleep score" value={data.sleepScore} tone={data.sleepScore >= 75 ? "good" : data.sleepScore >= 50 ? "warn" : "bad"} />
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
      )}

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Device</h2>
        <p className="text-sm text-slate-600">
          {user.transcendDevice ?? "Transcend miniCPAP"} · ID <span className="font-mono text-xs">{user.deviceId ?? "—"}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Sync your device from the Transcend mobile app. New event data will appear here automatically.
        </p>
      </div>
    </>
  );
}
