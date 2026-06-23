import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import StatCard from "@/components/StatCard";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Users, ShieldCheck, AlertTriangle, FileCheck, Eye } from "lucide-react";
import { patients, insuranceThresholds } from "@/lib/mock-data";

export default function MonitorDashboard() {
  const consented = patients.filter((p) => p.consentedInsurer);
  const compliant = consented.filter((p) => p.status === "compliant").length;
  const nonCompliant = consented.filter((p) => p.status === "non-compliant").length;
  const t = insuranceThresholds.BlueCross;

  return (
    <>
      <PageHeader
        title="Monitor dashboard"
        subtitle="Read-only view of patients shared with your organization."
      />
      <MockBanner />

      <div className="card p-4 mb-5 flex items-start gap-3 bg-blue-50 border-blue-100">
        <Eye className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900">
          <strong>Authorized Monitor account.</strong> You can only see patients that Homecare Providers have explicitly shared with you. All access is logged.
        </div>
      </div>

      <div className="card p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Your Monitor ID</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-slate-900 tracking-widest">MON-7K3-92H</div>
          <p className="text-xs text-slate-500 mt-1">
            Give this to a Homecare Provider so they can grant you access to specific patients.
          </p>
        </div>
        <button className="btn-secondary">Copy ID</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Shared patients" value={consented.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Compliant" value={compliant} hint={`${Math.round((compliant / consented.length) * 100)}% of cohort`} tone="good" icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="Non-compliant" value={nonCompliant} tone="bad" icon={<AlertTriangle className="w-5 h-5" />} />
        <StatCard label="Reports this month" value={42} icon={<FileCheck className="w-5 h-5" />} />
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Active compliance threshold</h2>
        <p className="text-sm text-slate-600">
          Patients must use therapy ≥ <strong>{t.minHoursPerNight} hours</strong> on at least <strong>{t.minNightsPercent}%</strong> of nights
          in any <strong>{t.windowDays}-day</strong> rolling window.
        </p>
        <p className="text-xs text-slate-500 mt-2">Thresholds vary by payer or monitoring use case. Configure under Reports.</p>
      </div>

      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Cohort summary</h2>
          <Link href="/monitor/patients" className="text-sm text-brand-600">View all patients</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium py-1">Patient</th>
              <th className="text-right font-medium py-1">30d avg</th>
              <th className="text-right font-medium py-1">Days ≥4h</th>
              <th className="text-right font-medium py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {consented.slice(0, 5).map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2">
                  <Link href={`/monitor/patients/${p.id}`} className="text-slate-800 font-medium hover:text-brand-600">
                    {p.name}
                  </Link>
                </td>
                <td className="py-2 text-right">{p.usageLast30d}h</td>
                <td className="py-2 text-right">{p.complianceDays}/30</td>
                <td className="py-2 text-right"><ComplianceBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
