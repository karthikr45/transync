"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Download } from "lucide-react";
import { groupCompliance, GroupPeriod } from "@/lib/mock-data";

const periods: { id: GroupPeriod; label: string }[] = [
  { id: "24h", label: "Past 24 hours" },
  { id: "7d", label: "Past 7 days" },
  { id: "30d", label: "Past 30 days" },
  { id: "90d", label: "Past 90 days" },
];

export default function GroupReports() {
  const [period, setPeriod] = useState<GroupPeriod>("30d");
  const rows = groupCompliance(period);
  const compliant = rows.filter((r) => r.compliant).length;

  return (
    <>
      <PageHeader
        title="Group Compliance Reports"
        subtitle="Management-by-exception view across your patient population."
        actions={<button className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>}
      />

      <div className="card p-3 mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-500 px-2">Window:</span>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${period === p.id ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-600 px-2">
          {compliant}/{rows.length} compliant ({Math.round((compliant / rows.length) * 100)}%)
        </span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient ID</th>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-right font-medium px-5 py-2">Total days</th>
              <th className="text-right font-medium px-5 py-2">Therapy hours</th>
              <th className="text-right font-medium px-5 py-2">4+ hr sessions</th>
              <th className="text-right font-medium px-5 py-2">AHI</th>
              <th className="text-right font-medium px-5 py-2">% compliant</th>
              <th className="text-right font-medium px-5 py-2">Compliant</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.patientId}</td>
                <td className="px-5 py-3">
                  <Link href={`/provider/patients/${r.id}`} className="text-slate-900 font-medium hover:text-brand-600">{r.name}</Link>
                </td>
                <td className="px-5 py-3 text-right">{r.totalDays}</td>
                <td className="px-5 py-3 text-right">{r.totalHours}h</td>
                <td className="px-5 py-3 text-right">{r.fourPlusSessions}</td>
                <td className="px-5 py-3 text-right">{r.ahi.toFixed(1)}</td>
                <td className="px-5 py-3 text-right">{r.pctCompliant}%</td>
                <td className="px-5 py-3 text-right">
                  <span className={`badge ${r.compliant ? "badge-green" : "badge-red"}`}>{r.compliant ? "Yes" : "No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Compliant = ≥ 70% of nights with ≥ 4 hours therapy in the selected window. Pending-consent patients are excluded.
      </p>
    </>
  );
}
