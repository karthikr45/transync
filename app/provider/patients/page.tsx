"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Search, Plus, FileBarChart } from "lucide-react";
import { patients, patientExtras, deactivatedPatients, ComplianceStatus } from "@/lib/mock-data";

export default function ProviderPatients() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ComplianceStatus>("all");
  const [showInactive, setShowInactive] = useState(false);

  const list = patients.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !patientExtras[p.id]?.patientId.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="All patients in your account."
        actions={
          <Link href="/provider/patients/new" className="btn-primary"><Plus className="w-4 h-4" /> Create new</Link>
        }
      />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search name or Patient ID..." />
        </div>
        <div className="flex gap-1">
          {(["all", "compliant", "at-risk", "non-compliant"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${filter === f ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}>
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600 pl-2">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Inactive patients
        </label>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient ID</th>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Consent</th>
              <th className="text-right font-medium px-5 py-2">7d avg</th>
              <th className="text-right font-medium px-5 py-2">Days ≥4h</th>
              <th className="text-left font-medium px-5 py-2">Last sync</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-right font-medium px-5 py-2">Report</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const ex = patientExtras[p.id];
              const pending = ex?.consent === "pending";
              return (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600 font-mono text-xs">{ex?.patientId}</td>
                  <td className="px-5 py-3">
                    <Link href={`/provider/patients/${p.id}`} className="text-slate-900 font-medium hover:text-brand-600">{p.name}</Link>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${pending ? "badge-amber" : "badge-green"}`}>{pending ? "Pending" : "Approved"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">{pending ? "—" : `${p.usageLast7d}h`}</td>
                  <td className="px-5 py-3 text-right">{pending ? "—" : `${p.complianceDays}/30`}</td>
                  <td className="px-5 py-3 text-slate-600">{pending ? "—" : p.lastSync}</td>
                  <td className="px-5 py-3">{pending ? <span className="badge badge-slate">No data</span> : <ComplianceBadge status={p.status} />}</td>
                  <td className="px-5 py-3 text-right">
                    {!pending && (
                      <Link href={`/provider/patients/${p.id}/report`} className="text-slate-400 hover:text-brand-600 inline-flex">
                        <FileBarChart className="w-4 h-4" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-500">No patients match filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {showInactive && (
        <div className="card overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Inactive patients</h2>
            <p className="text-xs text-slate-500 mt-0.5">Soft-deleted records, retained for audit. Device associations were removed on deactivation.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-2">Patient ID</th>
                <th className="text-left font-medium px-5 py-2">Name</th>
                <th className="text-left font-medium px-5 py-2">Deactivated</th>
                <th className="text-left font-medium px-5 py-2">Reason</th>
                <th className="text-right font-medium px-5 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deactivatedPatients.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{d.patientId}</td>
                  <td className="px-5 py-3 text-slate-700">{d.name}</td>
                  <td className="px-5 py-3 text-slate-600">{d.deactivatedOn}</td>
                  <td className="px-5 py-3 text-slate-600">{d.reason}</td>
                  <td className="px-5 py-3 text-right"><button className="btn-secondary">Reactivate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
