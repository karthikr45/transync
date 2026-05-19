"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Plus, X } from "lucide-react";
import { subAccounts } from "@/lib/mock-data";

export default function SubAccountsSettings() {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Sub-accounts"
        subtitle="Partner branches / second locations. Each sub-account has its own admin; you keep control of shared patients."
        actions={<button className="btn-primary" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Create sub-account</button>}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Location</th>
              <th className="text-left font-medium px-5 py-2">Admin</th>
              <th className="text-right font-medium px-5 py-2">Patients</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subAccounts.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{s.name}</td>
                <td className="px-5 py-3 text-slate-600">{s.location}</td>
                <td className="px-5 py-3 text-slate-600">{s.admin}</td>
                <td className="px-5 py-3 text-right">{s.patients}</td>
                <td className="px-5 py-3"><span className={`badge ${s.status === "active" ? "badge-green" : "badge-amber"}`}>{s.status}</span></td>
                <td className="px-5 py-3 text-right"><button className="btn-secondary">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Sharing a patient to a sub-account keeps the patient under your control. A full transfer to another provider is permanent — see Transfer patient on the patient record.
      </p>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={() => setShowCreate(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Create sub-account</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div><label className="label">Name</label><input className="input" placeholder="Northside — East Branch" /></div>
              <div><label className="label">Location</label><input className="input" /></div>
              <div><label className="label">Admin email</label><input className="input" type="email" /></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowCreate(false)}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
