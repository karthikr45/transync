"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";
import { Moon, Wind, Gauge, Activity, RefreshCw, AlertTriangle, Smartphone } from "lucide-react";
import { endUserApi, ApiError } from "@/lib/api";
import { getCurrentEndUser, getRefreshToken, setSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getTimeZoneName, getTimeZoneOffset } from "@/lib/timezone";
import type {
  BarChartResponse,
  DataBySessionResult,
  EndUser,
  EventGraphDto,
  LastSyncResult,
  SessionQuery,
  SessionWindow,
} from "@/lib/types.api";

// Window selector mirrors the mobile app: Last 24 Hours / 7 Days / 30 Days / 90 Days.
const SESSIONS: { id: SessionWindow; label: string }[] = [
  { id: 0, label: "Last 24 Hours" },
  { id: 1, label: "7 Days" },
  { id: 2, label: "30 Days" },
  { id: 3, label: "90 Days" },
];

function normaliseBarChart(raw: BarChartResponse | null | undefined): EventGraphDto[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.labels) && Array.isArray(raw.values)) {
    return raw.labels.map((label, i) => ({ label, value: raw.values?.[i] ?? 0 }));
  }
  return [];
}

type Charts = {
  usage: EventGraphDto[];
  leak: EventGraphDto[];
  ahi: EventGraphDto[];
  sleep: EventGraphDto[];
  mask: EventGraphDto[];
};

const EMPTY_CHARTS: Charts = { usage: [], leak: [], ahi: [], sleep: [], mask: [] };

export default function PatientDashboard() {
  const [user, setUser] = useState<EndUser | null>(null);
  const [ready, setReady] = useState(false);
  const [session, setSessionWindow] = useState<SessionWindow>(1);
  const [data, setData] = useState<DataBySessionResult | null>(null);
  const [sync, setSync] = useState<LastSyncResult | null>(null);
  const [charts, setCharts] = useState<Charts>(EMPTY_CHARTS);
  const [loading, setLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, hydrate from session cache then ask the server for the
  // latest profile so deviceId / timeZone reflect any device sync that
  // happened on the mobile app after login. Critically: we keep the
  // cached deviceId if /users/getByEmail returns nothing for it — the
  // login response is the source of truth, and getByEmail can return a
  // stale or null deviceId on multi-device accounts.
  useEffect(() => {
    const cached = getCurrentEndUser();
    setUser(cached);
    setReady(true);
    if (!cached?.email) return;
    endUserApi.getByEmail(cached.email)
      .then((fresh) => {
        const merged: EndUser = {
          ...cached,
          ...fresh,
          deviceId: fresh.deviceId || cached.deviceId,
          token: cached.token,
          refreshToken: cached.refreshToken ?? getRefreshToken() ?? "",
        };
        setUser(merged);
        setSession(merged.token, merged.refreshToken, merged, "end-user");
      })
      .catch(() => { /* keep cached user; surface errors only when the data call fails */ });
  }, []);

  // Match the mobile app exactly: always use the browser's current time
  // zone (Intl + Date.getTimezoneOffset). Using user.timeZone — the
  // value saved at registration — shifts the aggregation window when
  // the user travels, so totals diverge from the mobile view.
  const baseQuery = useMemo<SessionQuery | null>(() => {
    if (!user?.email || !user?.deviceId) return null;
    return {
      email: user.email,
      deviceId: user.deviceId,
      session,
      timeZone: getTimeZoneOffset(),
      timeZoneName: getTimeZoneName(),
    };
  }, [user, session]);

  const load = useCallback(async () => {
    if (!baseQuery) return;
    setLoading(true); setChartsLoading(true); setError(null);
    try {
      const [d, s] = await Promise.allSettled([
        endUserApi.getDataBySession(baseQuery),
        endUserApi.getLastSyncDate({ email: baseQuery.email, deviceId: baseQuery.deviceId }),
      ]);
      if (d.status === "fulfilled") setData(d.value);
      else throw d.reason;
      if (s.status === "fulfilled") setSync(s.value);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load data.");
    } finally { setLoading(false); }

    // Fire all five trend charts in parallel; failures degrade to empty arrays.
    try {
      const [usage, leak, ahi, sleep, mask] = await Promise.allSettled([
        endUserApi.getAverageTime(baseQuery),
        endUserApi.getAverageLeak(baseQuery),
        endUserApi.getAverageAHI(baseQuery),
        endUserApi.getAverageSleepScore(baseQuery),
        endUserApi.getAverageMaskRemoved(baseQuery),
      ]);
      setCharts({
        usage: usage.status === "fulfilled" ? normaliseBarChart(usage.value) : [],
        leak: leak.status === "fulfilled" ? normaliseBarChart(leak.value) : [],
        ahi: ahi.status === "fulfilled" ? normaliseBarChart(ahi.value) : [],
        sleep: sleep.status === "fulfilled" ? normaliseBarChart(sleep.value) : [],
        mask: mask.status === "fulfilled" ? normaliseBarChart(mask.value) : [],
      });
    } finally { setChartsLoading(false); }
  }, [baseQuery]);

  useEffect(() => { load(); }, [load]);

  if (!ready) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      </>
    );
  }

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

  if (!user.deviceId) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Your CPAP therapy summary." />
        <div className="card p-8 text-center text-sm text-slate-500">
          No device is linked to this account yet. Sync your Transcend device from the mobile app — your therapy data will appear here once events are uploaded.
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
            onClick={() => setSessionWindow(s.id)}
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
          <StatCard label="Usage hours" value={`${data.usageHours.toFixed(2)}h`} hint="avg / night" tone="good" icon={<Activity className="w-5 h-5" />} />
          <StatCard label="Events / hour" value={data.ahi.toFixed(2)} hint="AHI" icon={<Moon className="w-5 h-5" />} />
          <StatCard label="Mask leak" value={data.avgLeak.toFixed(2)} hint="L/min" icon={<Wind className="w-5 h-5" />} />
          <StatCard label="Mask removed" value={data.maskRemoved} hint="events" icon={<Gauge className="w-5 h-5" />} />
          <StatCard label="Sleep score" value={`${Math.round(data.sleepScore)} / 100`} tone={data.sleepScore >= 75 ? "good" : data.sleepScore >= 50 ? "warn" : "bad"} />
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">No data for this window yet.</div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        <BarChart title="Usage hours" unit="hours" points={charts.usage} tone="brand" loading={chartsLoading} />
        <BarChart title="Mask leak" unit="L/min" points={charts.leak} tone="amber" loading={chartsLoading} />
        <BarChart title="Events / hour" unit="AHI" points={charts.ahi} tone="slate" loading={chartsLoading} />
        <BarChart title="Sleep score" unit="/100" points={charts.sleep} tone="green" loading={chartsLoading} />
        <BarChart title="Mask removed" unit="events" points={charts.mask} tone="slate" loading={chartsLoading} />
      </div>

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
