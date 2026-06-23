"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Building2, Eye, Clock, HardDrive, ArrowRight, Globe, Activity, RefreshCw, AlertTriangle } from "lucide-react";
import { orgRegistrations, deviceFleet, platformAuditLog } from "@/lib/mock-data";
import { homeCareApi, ApiError } from "@/lib/api";
import type { MarketsResponse } from "@/lib/types.api";

export default function SuperAdminDashboard() {
  const pending = orgRegistrations.filter((o) => o.status === "pending");

  const [markets, setMarkets] = useState<MarketsResponse | null>(null);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [marketsError, setMarketsError] = useState<string | null>(null);

  async function loadMarkets() {
    setLoadingMarkets(true); setMarketsError(null);
    try {
      const m = await homeCareApi.markets();
      setMarkets(m);
    } catch (e) {
      setMarketsError((e as ApiError).message || "Failed to load markets.");
    } finally { setLoadingMarkets(false); }
  }
  useEffect(() => { loadMarkets(); }, []);

  // Headline counts come from the markets summary when available, mock data otherwise.
  const providersCount = markets?.summary.providers
    ?? orgRegistrations.filter((o) => o.type === "Homecare Provider" && o.status === "approved").length;
  const monitorsCount = markets?.summary.payers
    ?? orgRegistrations.filter((o) => o.type === "Authorized Monitor" && o.status === "approved").length;

  return (
    <>
      <PageHeader title="Super Admin" subtitle="Transcend platform — global oversight & control." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending approvals" value={pending.length} tone={pending.length ? "warn" : "default"} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Active providers" value={providersCount} icon={<Building2 className="w-5 h-5" />} />
        <StatCard label="Active monitors" value={monitorsCount} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Devices in fleet" value={deviceFleet.total.toLocaleString()} hint={`${deviceFleet.active.toLocaleString()} active`} icon={<HardDrive className="w-5 h-5" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Awaiting approval</h2>
            <Link href="/admin/approvals" className="text-sm text-brand-600 inline-flex items-center gap-1">Open <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing pending.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{o.name}</div>
                    <div className="text-xs text-slate-500">{o.country} · {o.submittedOn}</div>
                  </div>
                  <span className={`badge ${o.type === "Homecare Provider" ? "badge-amber" : "badge-slate"}`}>{o.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
            <Link href="/admin/audit" className="text-sm text-brand-600 inline-flex items-center gap-1">Audit log <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {platformAuditLog.slice(0, 5).map((a) => (
              <li key={a.id} className="py-2.5">
                <div className="text-sm text-slate-800">{a.action} — <span className="text-slate-600">{a.target}</span></div>
                <div className="text-xs text-slate-400">{a.actor} · {a.timestamp}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Markets — live from /home-care/admin/markets */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" /> Markets
          </h2>
          <div className="flex items-center gap-3">
            {markets && (
              <span className="text-sm text-slate-500">
                {markets.summary.total} countries · {markets.summary.providers} providers · {markets.summary.payers} payers
              </span>
            )}
            <button onClick={loadMarkets} disabled={loadingMarkets} className="text-slate-500 hover:text-slate-800">
              <RefreshCw className={`w-4 h-4 ${loadingMarkets ? "animate-spin" : ""}`} aria-label="Refresh" />
            </button>
          </div>
        </div>
        {marketsError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" /> {marketsError}
          </div>
        )}
        {loadingMarkets && !markets ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : markets && markets.markets.length === 0 ? (
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
        ) : null}
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-slate-400" /> System health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Health label="API" value="Operational" ok />
          <Health label="Data ingestion" value="Operational" ok />
          <Health label="Last fleet sync" value="6 min ago" ok />
          <Health label="Devices needing RMA" value={`${deviceFleet.rma}`} />
        </div>
      </div>
    </>
  );
}

function Health({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${ok ? "bg-green-500" : "bg-amber-500"}`} />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-slate-900 font-medium">{value}</div>
      </div>
    </div>
  );
}
