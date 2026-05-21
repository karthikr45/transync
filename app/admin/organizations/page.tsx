"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Search, BadgeCheck } from "lucide-react";
import { orgRegistrations } from "@/lib/mock-data";

export default function AdminOrganizations() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "Homecare Provider" | "Authorized Monitor">("all");

  const list = orgRegistrations.filter((o) => {
    if (type !== "all" && o.type !== type) return false;
    if (q && !o.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Organizations" subtitle="All registered organizations on the platform." />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search organizations..." />
        </div>
        <div className="flex gap-1">
          {(["all", "Homecare Provider", "Authorized Monitor"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${type === t ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}>
              {t === "all" ? "All" : t === "Homecare Provider" ? "Providers" : "Monitors"}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Organization</th>
              <th className="text-left font-medium px-5 py-2">Type</th>
              <th className="text-left font-medium px-5 py-2">Country</th>
              <th className="text-left font-medium px-5 py-2">Joined</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="text-slate-900 font-medium flex items-center gap-1.5">
                    {o.name}
                    {o.type === "Authorized Monitor" && o.verified && <BadgeCheck className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="text-xs text-slate-500">{o.email}</div>
                </td>
                <td className="px-5 py-3"><span className="badge badge-slate">{o.type}</span></td>
                <td className="px-5 py-3 text-slate-600">{o.country}</td>
                <td className="px-5 py-3 text-slate-600">{o.submittedOn}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${o.status === "approved" ? "badge-green" : o.status === "pending" ? "badge-amber" : "badge-red"}`}>
                    {o.status === "approved" ? "Active" : o.status === "pending" ? "Pending" : "Rejected"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
