import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Building2, Eye, Clock, Users, ArrowRight } from "lucide-react";
import { orgRegistrations, patients } from "@/lib/mock-data";

export default function AdminDashboard() {
  const pending = orgRegistrations.filter((o) => o.status === "pending");
  const providers = orgRegistrations.filter((o) => o.type === "Homecare Provider" && o.status === "approved").length;
  const monitors = orgRegistrations.filter((o) => o.type === "Authorized Monitor" && o.status === "approved").length;

  return (
    <>
      <PageHeader title="Platform admin" subtitle="Transcend operations — onboarding & oversight." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending approvals" value={pending.length} tone={pending.length ? "warn" : "default"} icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Active providers" value={providers} icon={<Building2 className="w-5 h-5" />} />
        <StatCard label="Active monitors" value={monitors} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Patients (platform)" value={patients.length * 214} icon={<Users className="w-5 h-5" />} />
      </div>

      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Awaiting review</h2>
          <Link href="/admin/approvals" className="text-sm text-brand-600 inline-flex items-center gap-1">
            Open approvals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing pending.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium py-1">Organization</th>
                <th className="text-left font-medium py-1">Type</th>
                <th className="text-left font-medium py-1">Country</th>
                <th className="text-left font-medium py-1">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="py-2 text-slate-800 font-medium">{o.name}</td>
                  <td className="py-2">
                    <span className={`badge ${o.type === "Homecare Provider" ? "badge-amber" : "badge-slate"}`}>{o.type}</span>
                  </td>
                  <td className="py-2 text-slate-600">{o.country}</td>
                  <td className="py-2 text-slate-600">{o.submittedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-4 mt-4 text-xs text-slate-500">
        <strong className="text-slate-700">Approval policy.</strong> Homecare Providers require credential + BAA review before activation
        (they get population-level PHI). Authorized Monitors only need identity verification — they see no data until a provider shares a
        patient and the patient consents.
      </div>
    </>
  );
}
