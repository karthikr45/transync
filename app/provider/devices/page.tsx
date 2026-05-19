"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Plus, Search, X } from "lucide-react";
import { devices, patients } from "@/lib/mock-data";

export default function DevicesPage() {
  const [q, setQ] = useState("");
  const [showReg, setShowReg] = useState(false);
  const patientName = (pid: string | null) => patients.find((p) => p.id === pid)?.name ?? "—";

  const list = devices.filter((d) => !q || d.serial.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Devices"
        subtitle="Master list of registered Transcend devices."
        actions={<button className="btn-primary" onClick={() => setShowReg(true)}><Plus className="w-4 h-4" /> Register device</button>}
      />

      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search by serial..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Serial</th>
              <th className="text-left font-medium px-5 py-2">Model</th>
              <th className="text-left font-medium px-5 py-2">Firmware</th>
              <th className="text-left font-medium px-5 py-2">Registered</th>
              <th className="text-left font-medium px-5 py-2">Assigned to</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.serial} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/provider/devices/${d.serial}`} className="text-slate-900 font-medium font-mono text-xs hover:text-brand-600">{d.serial}</Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{d.model}</td>
                <td className="px-5 py-3 text-slate-600">{d.firmware}</td>
                <td className="px-5 py-3 text-slate-600">{d.registeredOn}</td>
                <td className="px-5 py-3 text-slate-700">
                  {d.assignedPatientId ? patientName(d.assignedPatientId) : <span className="badge badge-slate">Unassigned</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`badge ${d.status === "active" ? "badge-green" : "badge-red"}`}>{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReg && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={() => setShowReg(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Register device</h2>
              <button onClick={() => setShowReg(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-slate-500 mt-1">Enter the serial number from the underside of the unit.</p>
            <input className="input mt-4" placeholder="TR-MC3-XXXXX" />
            <p className="text-xs text-slate-500 mt-2">
              If this device is already registered to a patient account, you&apos;ll continue to an email confirmation step — the patient must approve monitoring.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowReg(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowReg(false)}>Register</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
