"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Search, Download } from "lucide-react";
import { patients, ComplianceStatus } from "@/lib/mock-data";

export default function ProviderPatients() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ComplianceStatus>("all");

  const list = patients.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="All patients sharing data with Northside Homecare."
        actions={<button className="btn-secondary"><Download className="w-4 h-4" /> Export</button>}
      />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-9"
            placeholder="Search by name..."
          />
        </div>
        <div className="flex gap-1">
          {(["all", "compliant", "at-risk", "non-compliant"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                filter === f
                  ? "bg-brand-50 border-brand-500 text-brand-700"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient</th>
              <th className="text-left font-medium px-5 py-2">Payer</th>
              <th className="text-right font-medium px-5 py-2">7d avg</th>
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
                  <Link href={`/provider/patients/${p.id}`} className="text-slate-900 font-medium hover:text-brand-600">
                    {p.name}
                  </Link>
                  <div className="text-xs text-slate-500">{p.email}</div>
                </td>
                <td className="px-5 py-3 text-slate-600">{p.payer}</td>
                <td className="px-5 py-3 text-right">{p.usageLast7d}h</td>
                <td className="px-5 py-3 text-right">{p.usageLast30d}h</td>
                <td className="px-5 py-3 text-right">{p.complianceDays}/30</td>
                <td className="px-5 py-3 text-slate-600">{p.lastSync}</td>
                <td className="px-5 py-3 text-right"><ComplianceBadge status={p.status} /></td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No patients match filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
