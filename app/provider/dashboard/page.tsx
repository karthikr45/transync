import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Users, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { patients, alerts } from "@/lib/mock-data";

export default function ProviderDashboard() {
  const total = patients.length;
  const compliant = patients.filter((p) => p.status === "compliant").length;
  const atRisk = patients.filter((p) => p.status === "at-risk").length;
  const non = patients.filter((p) => p.status === "non-compliant").length;

  return (
    <>
      <PageHeader title="Provider dashboard" subtitle="Northside Homecare — patient compliance overview." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total patients" value={total} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Compliant" value={compliant} hint={`${Math.round((compliant / total) * 100)}%`} tone="good" icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="At risk" value={atRisk} tone="warn" icon={<Activity className="w-5 h-5" />} />
        <StatCard label="Non-compliant" value={non} tone="bad" icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Patients needing attention</h2>
            <Link href="/provider/patients" className="text-sm text-brand-600">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium py-1">Patient</th>
                <th className="text-right font-medium py-1">Usage 7d</th>
                <th className="text-right font-medium py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients
                .filter((p) => p.status !== "compliant")
                .map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2">
                      <Link href={`/provider/patients/${p.id}`} className="text-slate-800 font-medium hover:text-brand-600">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2 text-right">{p.usageLast7d}h</td>
                    <td className="py-2 text-right"><ComplianceBadge status={p.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent alerts</h2>
            <Link href="/provider/alerts" className="text-sm text-brand-600">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 ${
                    a.severity === "high" ? "bg-red-500" : a.severity === "medium" ? "bg-amber-500" : "bg-slate-400"
                  }`}
                />
                <div className="flex-1">
                  <Link href={`/provider/patients/${a.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-600">
                    {a.patientName}
                  </Link>
                  <div className="text-xs text-slate-600">{a.message}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
