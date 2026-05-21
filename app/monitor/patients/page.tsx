"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Search, Download } from "lucide-react";
import { patients, currentMonitorAccess } from "@/lib/mock-data";

export default function MonitorPatients() {
  const [q, setQ] = useState("");
  const consented = patients.filter((p) => p.consentedInsurer);
  const list = consented.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Patients shared with your monitoring account."
        actions={<button className="btn-secondary"><Download className="w-4 h-4" /> Export cohort</button>}
      />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient</th>
              <th className="text-left font-medium px-5 py-2">Shared by</th>
              <th className="text-left font-medium px-5 py-2">Access</th>
              <th className="text-right font-medium px-5 py-2">30d avg</th>
              <th className="text-right font-medium px-5 py-2">Days ≥4h</th>
              <th className="text-left font-medium px-5 py-2">Last sync</th>
              <th className="text-right font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/monitor/patients/${p.id}`} className="text-slate-900 font-medium hover:text-brand-600">
                    {p.name}
                  </Link>
                  <div className="text-xs text-slate-500">DOB {p.dob}</div>
                </td>
                <td className="px-5 py-3 text-slate-600">{p.provider}</td>
                <td className="px-5 py-3">
                  {currentMonitorAccess(p.id) === "read-write"
                    ? <span className="badge badge-amber">Read-write</span>
                    : <span className="badge badge-slate">Read-only</span>}
                </td>
                <td className="px-5 py-3 text-right">{p.usageLast30d}h</td>
                <td className="px-5 py-3 text-right">{p.complianceDays}/30</td>
                <td className="px-5 py-3 text-slate-600">{p.lastSync}</td>
                <td className="px-5 py-3 text-right"><ComplianceBadge status={p.status} /></td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No patients match search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
