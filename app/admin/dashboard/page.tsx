import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Building2, Eye, Clock, HardDrive, ArrowRight, Globe, Activity } from "lucide-react";
import { orgRegistrations, deviceFleet, countriesConfig, platformAuditLog } from "@/lib/mock-data";

export default function SuperAdminDashboard() {
  const pending = orgRegistrations.filter((o) => o.status === "pending");
  const providers = orgRegistrations.filter((o) => o.type === "Homecare Provider" && o.status === "approved").length;
  const monitors = orgRegistrations.filter((o) => o.type === "Authorized Monitor" && o.status === "approved").length;
  const liveCountries = countriesConfig.filter((c) => c.status === "live").length;

  return (
    <>
      <PageHeader title="Super Admin" subtitle="Transcend platform — global oversight & control." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending approvals" value={pending.length} tone={pending.length ? "warn" : "default"} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Active providers" value={providers} icon={<Building2 className="w-5 h-5" />} />
        <StatCard label="Active monitors" value={monitors} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Devices in fleet" value={deviceFleet.total.toLocaleString()} hint={`${deviceFleet.active.toLocaleString()} active`} icon={<HardDrive className="w-5 h-5" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        {/* Approvals */}
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

        {/* Recent platform activity */}
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

      {/* Countries */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> Markets</h2>
          <span className="text-sm text-slate-500">{liveCountries} live · {countriesConfig.length - liveCountries} pilot/off</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {countriesConfig.map((c) => (
            <div key={c.code} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 text-sm">{c.name}</span>
                <span className={`badge ${c.status === "live" ? "badge-green" : c.status === "pilot" ? "badge-amber" : "badge-slate"}`}>{c.status}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{c.providers} providers · {c.payers} payers · {c.region}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System health */}
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
