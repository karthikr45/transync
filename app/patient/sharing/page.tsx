"use client";

import PageHeader from "@/components/PageHeader";
import { Plus, Stethoscope, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

type Share = { id: string; name: string; type: "Provider" | "Insurance"; granted: string; status: "active" | "pending" };

export default function PatientSharing() {
  const [shares, setShares] = useState<Share[]>([
    { id: "s1", name: "Northside Homecare", type: "Provider", granted: "2026-01-12", status: "active" },
    { id: "s2", name: "BlueCross — claims", type: "Insurance", granted: "2026-02-04", status: "active" },
    { id: "s3", name: "Dr. Lin (consulting)", type: "Provider", granted: "2026-04-22", status: "pending" },
  ]);
  const [showInvite, setShowInvite] = useState(false);

  function revoke(id: string) {
    setShares((s) => s.filter((x) => x.id !== id));
  }

  return (
    <>
      <PageHeader
        title="Data sharing"
        subtitle="Choose who can see your therapy data. Revoke access anytime."
        actions={
          <button onClick={() => setShowInvite(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Invite
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Recipient</th>
              <th className="text-left font-medium px-5 py-2">Type</th>
              <th className="text-left font-medium px-5 py-2">Granted</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 flex items-center gap-2 text-slate-800">
                  {s.type === "Provider" ? (
                    <Stethoscope className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  )}
                  {s.name}
                </td>
                <td className="px-5 py-3 text-slate-600">{s.type}</td>
                <td className="px-5 py-3 text-slate-600">{s.granted}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${s.status === "active" ? "badge-green" : "badge-amber"}`}>{s.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-secondary" onClick={() => revoke(s.id)}>
                    <X className="w-4 h-4" /> Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-slate-900">Invite recipient</h2>
            <p className="text-sm text-slate-500 mt-1">They&apos;ll get an email to access your therapy data.</p>
            <div className="mt-4 space-y-3">
              <div><label className="label">Type</label>
                <select className="input">
                  <option>Homecare provider</option>
                  <option>Insurance / payer</option>
                </select>
              </div>
              <div><label className="label">Email or invite code</label><input className="input" placeholder="name@clinic.com" /></div>
              <div>
                <label className="label">Date range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" type="date" />
                  <input className="input" type="date" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowInvite(false)}>Send invite</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
