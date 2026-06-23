import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { alerts } from "@/lib/mock-data";

export default function ProviderAlerts() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Compliance and therapy alerts across all patients." />
      <MockBanner />

      <div className="card p-3 mb-4 flex gap-2">
        {["All", "High", "Medium", "Low"].map((f) => (
          <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Severity</th>
              <th className="text-left font-medium px-5 py-2">Patient</th>
              <th className="text-left font-medium px-5 py-2">Type</th>
              <th className="text-left font-medium px-5 py-2">Message</th>
              <th className="text-left font-medium px-5 py-2">Date</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <span
                    className={`badge ${a.severity === "high" ? "badge-red" : a.severity === "medium" ? "badge-amber" : "badge-slate"}`}
                  >
                    {a.severity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/provider/patients/${a.patientId}`} className="text-slate-900 font-medium hover:text-brand-600">
                    {a.patientName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{a.type}</td>
                <td className="px-5 py-3 text-slate-700">{a.message}</td>
                <td className="px-5 py-3 text-slate-600">{a.date}</td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-secondary">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
