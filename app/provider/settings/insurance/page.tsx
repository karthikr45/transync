"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Plus, ChevronDown } from "lucide-react";
import { insuranceProviders } from "@/lib/mock-data";

export default function InsuranceSettings() {
  const [open, setOpen] = useState<string | null>(insuranceProviders[0].id);

  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Insurance providers"
        subtitle="Compliance rules and replacement schedules are set per payer — all patients on that payer inherit them."
        actions={<button className="btn-primary"><Plus className="w-4 h-4" /> Add provider</button>}
      />

      <div className="space-y-3">
        {insuranceProviders.map((ins) => {
          const isOpen = open === ins.id;
          return (
            <div key={ins.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50"
                onClick={() => setOpen(isOpen ? null : ins.id)}
              >
                <div className="text-left">
                  <div className="font-semibold text-slate-900">{ins.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Compliance: ≥{ins.compliance.minHoursPerNight}h / {ins.compliance.minNightsPercent}% / {ins.compliance.windowDays}d
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Compliance rule</h3>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <Field label="Min hours/night" value={ins.compliance.minHoursPerNight} />
                    <Field label="Min nights %" value={ins.compliance.minNightsPercent} />
                    <Field label="Window (days)" value={ins.compliance.windowDays} />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Replacement schedule</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Mask (days)" value={ins.schedule.maskDays} />
                    <Field label="Tube (days)" value={ins.schedule.tubeDays} />
                    <Field label="Filter (days)" value={ins.schedule.filterDays} />
                    <Field label="Pre-reminder (days)" value={ins.schedule.preReminderDays} />
                    <Field label="Post-reminder (days)" value={ins.schedule.postReminderDays} />
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" defaultChecked={ins.schedule.remindersOn} /> Reminders on
                    </label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" defaultChecked={ins.schedule.patientEmailOn} /> Patient email reminders
                    </label>
                  </div>
                  <div className="mt-4"><button className="btn-primary">Save</button></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" defaultValue={value} />
    </div>
  );
}
