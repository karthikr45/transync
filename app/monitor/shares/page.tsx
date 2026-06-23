"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { Check, X } from "lucide-react";
import { monitorShares, MonitorShare } from "@/lib/mock-data";

export default function MonitorShares() {
  const [shares, setShares] = useState<MonitorShare[]>(monitorShares);
  const act = (id: string, status: MonitorShare["status"]) =>
    setShares((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));

  const pending = shares.filter((s) => s.status === "pending");
  const decided = shares.filter((s) => s.status !== "pending");

  return (
    <>
      <PageHeader
        title="Shares"
        subtitle="Patients that Homecare Providers have shared with your monitoring account."
      />
      <MockBanner />

      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Pending requests</h2>
          <span className="badge badge-amber">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No pending share requests.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-5 py-2">Patient</th>
                <th className="text-left font-medium px-5 py-2">Ref</th>
                <th className="text-left font-medium px-5 py-2">From provider</th>
                <th className="text-left font-medium px-5 py-2">Requested</th>
                <th className="text-right font-medium px-5 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-900 font-medium">{s.patientName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.patientRef}</td>
                  <td className="px-5 py-3 text-slate-600">{s.fromProvider}</td>
                  <td className="px-5 py-3 text-slate-600">{s.requestedOn}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="btn-secondary" onClick={() => act(s.id, "declined")}><X className="w-4 h-4" /> Decline</button>
                      <button className="btn-primary" onClick={() => act(s.id, "active")}><Check className="w-4 h-4" /> Accept</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Active & past shares</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient</th>
              <th className="text-left font-medium px-5 py-2">Ref</th>
              <th className="text-left font-medium px-5 py-2">From provider</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {decided.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{s.patientName}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.patientRef}</td>
                <td className="px-5 py-3 text-slate-600">{s.fromProvider}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${s.status === "active" ? "badge-green" : "badge-red"}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
