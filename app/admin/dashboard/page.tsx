"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Building2, Eye, Clock, HardDrive, ArrowRight, Globe, RefreshCw, AlertTriangle } from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type {
  AdminActivityEntry,
  AdminDashboardResult,
  AccountUser,
  MarketsResponse,
} from "@/lib/types.api";

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardResult | null>(null);
  const [pending, setPending] = useState<AccountUser[]>([]);
  const [activity, setActivity] = useState<AdminActivityEntry[]>([]);
  const [markets, setMarkets] = useState<MarketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const [m, p, a, mk] = await Promise.allSettled([
        homeCareApi.adminDashboard(),
        homeCareApi.listPending(),
        homeCareApi.adminRecentActivity({ limit: 8 }),
        homeCareApi.markets(),
      ]);
      if (m.status === "fulfilled") setMetrics(m.value); else throw m.reason;
      if (p.status === "fulfilled") setPending(p.value);
      if (a.status === "fulfilled") setActivity(a.value.activity);
      if (mk.status === "fulfilled") setMarkets(mk.value);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load dashboard.");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader
        title="Super Admin"
        subtitle="Transcend platform — global oversight & control."
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
        <StatCard
          label="Pending approvals"
          value={metrics?.pendingApprovals ?? "—"}
          tone={metrics && metrics.pendingApprovals > 0 ? "warn" : "default"}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Active providers"
          value={metrics?.activeProviders ?? "—"}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Active monitors"
          value={metrics?.activeMonitors ?? "—"}
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          label="Devices in fleet"
          value={metrics?.devices ? metrics.devices.total.toLocaleString() : "—"}
          hint={metrics?.devices ? `${metrics.devices.active.toLocaleString()} active` : undefined}
          icon={<HardDrive className="w-5 h-5" />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Awaiting approval</h2>
            <Link href="/admin/approvals" className="text-sm text-brand-600 inline-flex items-center gap-1">Open <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {loading && pending.length === 0 ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing pending.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.slice(0, 6).map((o) => {
                const isProvider = o.userType === "home_care_provider";
                const name = isProvider
                  ? o.companyName || `${o.firstName ?? ""} ${o.lastName ?? ""}`.trim() || o.email
                  : o.institutionName || `${o.firstName ?? ""} ${o.lastName ?? ""}`.trim() || o.email;
                return (
                  <li key={o._id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {o.country ?? "—"}
                        {o.createdAt ? ` · ${formatDateTime(o.createdAt)}` : ""}
                      </div>
                    </div>
                    <span className={`badge ${isProvider ? "badge-amber" : "badge-slate"}`}>
                      {isProvider ? "Homecare Provider" : "Authorized Monitor"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
            <Link href="/admin/audit" className="text-sm text-brand-600 inline-flex items-center gap-1">Audit log <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {loading && activity.length === 0 ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="py-2.5">
                  <div className="text-sm text-slate-800">
                    <span className="capitalize">{a.action}</span> —{" "}
                    <span className="text-slate-600">{a.name}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {a.actor} · {formatDateTime(a.date)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" /> Markets
          </h2>
          {markets && (
            <span className="text-sm text-slate-500">
              {markets.summary.total} countries · {markets.summary.providers} providers · {markets.summary.payers} payers
            </span>
          )}
        </div>
        {markets && markets.markets.length === 0 ? (
          <p className="text-sm text-slate-500">No markets yet.</p>
        ) : markets ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {markets.markets.map((m) => (
              <div key={m.country} className="border border-slate-200 rounded-lg p-3">
                <div className="font-medium text-slate-900 text-sm">{m.country}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {m.providers} provider{m.providers === 1 ? "" : "s"} · {m.payers} payer{m.payers === 1 ? "" : "s"}
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : null}
      </div>
    </>
  );
}
