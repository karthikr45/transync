"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Search, BadgeCheck, Ban, RotateCcw, X } from "lucide-react";
import { orgRegistrations } from "@/lib/mock-data";

type Override = "active" | "suspended";

export default function AdminOrganizations() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "Homecare Provider" | "Authorized Monitor">("all");
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [confirm, setConfirm] = useState<{ id: string; name: string; action: "suspend" | "reinstate" } | null>(null);

  const effectiveStatus = (id: string, base: string): string => overrides[id] ?? base;

  const list = orgRegistrations.filter((o) => {
    if (type !== "all" && o.type !== type) return false;
    if (q && !o.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  function apply() {
    if (!confirm) return;
    setOverrides((o) => ({ ...o, [confirm.id]: confirm.action === "suspend" ? "suspended" : "active" }));
    setConfirm(null);
  }

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
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => {
              const status = effectiveStatus(o.id, o.status);
              return (
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
                    <span className={`badge ${status === "active" ? "badge-green" : status === "approved" ? "badge-green" : status === "pending" ? "badge-amber" : status === "suspended" ? "badge-red" : "badge-red"}`}>
                      {status === "approved" ? "Active" : status === "active" ? "Active" : status === "pending" ? "Pending" : status === "suspended" ? "Suspended" : "Rejected"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {(status === "approved" || status === "active") && (
                      <button className="btn-secondary" onClick={() => setConfirm({ id: o.id, name: o.name, action: "suspend" })}>
                        <Ban className="w-4 h-4" /> Suspend
                      </button>
                    )}
                    {status === "suspended" && (
                      <button className="btn-secondary" onClick={() => setConfirm({ id: o.id, name: o.name, action: "reinstate" })}>
                        <RotateCcw className="w-4 h-4" /> Reinstate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={() => setConfirm(null)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {confirm.action === "suspend" ? "Suspend organization" : "Reinstate organization"}
              </h2>
              <button onClick={() => setConfirm(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            {confirm.action === "suspend" ? (
              <p className="text-sm text-red-700 mt-2 bg-red-50 rounded-lg p-3">
                Suspending <strong>{confirm.name}</strong> blocks all their logins and data access immediately. Patient
                records are retained. This is reversible.
              </p>
            ) : (
              <p className="text-sm text-slate-600 mt-2">
                Reinstating <strong>{confirm.name}</strong> restores login and data access for their users.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirm(null)}>Cancel</button>
              <button className={confirm.action === "suspend" ? "btn-danger" : "btn-primary"} onClick={apply}>
                {confirm.action === "suspend" ? "Suspend" : "Reinstate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
