// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiButton from "@/components/ui/Button";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";
import { Moon, Wind, Gauge, Activity, RefreshCw, AlertTriangle, Smartphone } from "lucide-react";

import { formatDate } from "@/lib/format";

import { SESSIONS } from "./model";

import { usePatientDashboardModel } from "./hooks";
export default function PatientDashboard() {
  const {
    user,
    ready,
    session,
    setSessionWindow,
    data,
    sync,
    charts,
    loading,
    chartsLoading,
    error,
    load,
    first,
  } = usePatientDashboardModel();
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
          You&apos;re not signed in as a patient.{" "}
          <a href="/login" className="text-brand-600 font-medium">
            Log on
          </a>{" "}
          or{" "}
          <a href="/register/patient" className="text-brand-600 font-medium">
            create an account
          </a>
          .
        </div>
      </>
    );
  }
  if (!user.deviceId) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Your CPAP therapy summary." />
        <div className="card p-8 text-center text-sm text-slate-500">
          No device is linked to this account yet. Sync your Transcend device from the mobile app —
          your therapy data will appear here once events are uploaded.
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title={`Hi, ${first}`}
        subtitle="Your CPAP therapy summary."
        actions={
          <UiButton
            variant="secondary"
            type="submit"
            className="btn-secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </UiButton>
        }
      />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 px-2">Window:</span>
        {SESSIONS.map((s) => (
          <UiButton
            variant="plain"
            type="submit"
            key={s.id}
            onClick={() => setSessionWindow(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${session === s.id ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {s.label}
          </UiButton>
        ))}
        {sync?.lastSyncDate && (
          <span className="ml-auto text-xs text-slate-500 inline-flex items-center gap-1 px-2">
            <Smartphone className="w-3.5 h-3.5" /> Last sync {formatDate(sync.lastSyncDate, true)}
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
          <StatCard
            label="Usage hours"
            value={`${data.usageHours.toFixed(2)}h`}
            hint="avg / night"
            tone="good"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            label="Events / hour"
            value={data.ahi.toFixed(2)}
            hint="AHI"
            icon={<Moon className="w-5 h-5" />}
          />
          <StatCard
            label="Mask leak"
            value={data.avgLeak.toFixed(2)}
            hint="L/min"
            icon={<Wind className="w-5 h-5" />}
          />
          <StatCard
            label="Mask removed"
            value={data.maskRemoved}
            hint="events"
            icon={<Gauge className="w-5 h-5" />}
          />
          <StatCard
            label="Sleep score"
            value={`${Math.round(data.sleepScore)} / 100`}
            tone={data.sleepScore >= 75 ? "good" : data.sleepScore >= 50 ? "warn" : "bad"}
          />
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-slate-500">
          No data for this window yet.
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        <BarChart
          title="Usage hours"
          unit="hours"
          points={charts.usage}
          tone="brand"
          loading={chartsLoading}
        />
        <BarChart
          title="Mask leak"
          unit="L/min"
          points={charts.leak}
          tone="amber"
          loading={chartsLoading}
        />
        <BarChart
          title="Events / hour"
          unit="AHI"
          points={charts.ahi}
          tone="slate"
          loading={chartsLoading}
        />
        <BarChart
          title="Sleep score"
          unit="/100"
          points={charts.sleep}
          tone="green"
          loading={chartsLoading}
        />
        <BarChart
          title="Mask removed"
          unit="events"
          points={charts.mask}
          tone="slate"
          loading={chartsLoading}
        />
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Device</h2>
        <p className="text-sm text-slate-600">
          {user.transcendDevice ?? "Transcend miniCPAP"} · ID{" "}
          <span className="font-mono text-xs">{user.deviceId ?? "—"}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Sync your device from the Transcend mobile app. New event data will appear here
          automatically.
        </p>
      </div>
    </>
  );
}
