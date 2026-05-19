"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { alertRules } from "@/lib/mock-data";

export default function AlertsSettings() {
  const [rules, setRules] = useState(alertRules);
  const toggle = (id: string) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Proactive alerts"
        subtitle="Automated non-compliance and equipment alerts so staff can intervene early."
      />

      <div className="space-y-3">
        {rules.map((r) => (
          <div key={r.id} className="card p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">{r.label}</div>
              <p className="text-sm text-slate-600 mt-0.5">{r.description}</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-slate-500">Threshold:</span>
                <input className="input !py-1 !w-auto text-xs" defaultValue={r.threshold} />
              </div>
            </div>
            <button
              onClick={() => toggle(r.id)}
              className={`relative w-11 h-6 rounded-full transition shrink-0 ${r.enabled ? "bg-brand-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 ${r.enabled ? "left-5" : "left-0.5"} w-5 h-5 bg-white rounded-full transition`} />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Delivery</h2>
        <div className="space-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Show in Alerts dashboard</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Email assigned staff</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Daily digest instead of real-time</label>
        </div>
        <div className="mt-4"><button className="btn-primary">Save</button></div>
      </div>
    </>
  );
}
