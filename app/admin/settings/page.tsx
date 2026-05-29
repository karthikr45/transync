"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Plus } from "lucide-react";
import { countriesConfig, platformFeatureFlags } from "@/lib/mock-data";

export default function AdminSettings() {
  const [flags, setFlags] = useState(platformFeatureFlags);
  const toggle = (id: string) => setFlags((fs) => fs.map((f) => (f.id === id ? { ...f, on: !f.on } : f)));

  return (
    <>
      <PageHeader title="Platform settings" subtitle="Markets, compliance defaults and feature flags." />

      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Markets & data residency</h2>
          <button className="btn-secondary"><Plus className="w-4 h-4" /> Add country</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Country</th>
              <th className="text-left font-medium px-5 py-2">Region</th>
              <th className="text-left font-medium px-5 py-2">Language</th>
              <th className="text-right font-medium px-5 py-2">Payers</th>
              <th className="text-right font-medium px-5 py-2">Providers</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {countriesConfig.map((c) => (
              <tr key={c.code} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{c.region}</td>
                <td className="px-5 py-3 text-slate-600">{c.language}</td>
                <td className="px-5 py-3 text-right">{c.payers}</td>
                <td className="px-5 py-3 text-right">{c.providers}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${c.status === "live" ? "badge-green" : c.status === "pilot" ? "badge-amber" : "badge-slate"}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Feature flags</h2>
        <p className="text-sm text-slate-500 mb-4">Platform-wide toggles. Some are hardware-gated.</p>
        <div className="space-y-3">
          {flags.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 first:border-0 first:pt-0">
              <div>
                <div className="font-medium text-slate-900 text-sm">{f.label}</div>
                <p className="text-xs text-slate-600 mt-0.5">{f.desc}</p>
              </div>
              <button
                onClick={() => toggle(f.id)}
                className={`relative w-11 h-6 rounded-full transition shrink-0 ${f.on ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 ${f.on ? "left-5" : "left-0.5"} w-5 h-5 bg-white rounded-full transition`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
