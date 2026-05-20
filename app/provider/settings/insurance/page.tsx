"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Plus, ChevronDown, X, Check } from "lucide-react";
import { insuranceProviders, InsuranceProvider } from "@/lib/mock-data";

const blank: Omit<InsuranceProvider, "id"> = {
  name: "",
  compliance: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
  schedule: { maskDays: 90, tubeDays: 90, filterDays: 30, preReminderDays: 7, postReminderDays: 14, remindersOn: true, patientEmailOn: true },
};

export default function InsuranceSettings() {
  const [list, setList] = useState<InsuranceProvider[]>(insuranceProviders);
  const [open, setOpen] = useState<string | null>(insuranceProviders[0].id);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [added, setAdded] = useState<string | null>(null);

  function save() {
    if (!draft.name.trim()) return;
    const id = `ins-${Date.now()}`;
    const created: InsuranceProvider = { id, ...draft };
    setList((l) => [...l, created]);
    setOpen(id);
    setAdded(draft.name);
    setShowAdd(false);
    setDraft(blank);
    setTimeout(() => setAdded(null), 4000);
  }

  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Insurance providers"
        subtitle="Compliance rules and replacement schedules are set per payer — all patients on that payer inherit them."
        actions={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add provider</button>}
      />

      {added && (
        <div className="card p-3 mb-4 flex items-center gap-3 bg-green-50 border-green-100 text-sm text-green-800">
          <Check className="w-4 h-4 text-green-600" /> Added <strong>{added}</strong>. New patients can now be assigned to this payer.
        </div>
      )}

      <div className="space-y-3">
        {list.map((ins) => {
          const isOpen = open === ins.id;
          return (
            <div key={ins.id} className="card overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50" onClick={() => setOpen(isOpen ? null : ins.id)}>
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

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Add insurance provider</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-slate-500 mt-1">Patients you later assign to this payer will inherit the rules below.</p>

            <div className="mt-4">
              <label className="label">Provider name *</label>
              <input
                className="input"
                placeholder="e.g. UnitedHealthcare"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                autoFocus
              />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 mt-5 mb-2">Compliance rule</h3>
            <div className="grid grid-cols-3 gap-3">
              <ModalField label="Min hours/night" value={draft.compliance.minHoursPerNight}
                onChange={(v) => setDraft({ ...draft, compliance: { ...draft.compliance, minHoursPerNight: v } })} />
              <ModalField label="Min nights %" value={draft.compliance.minNightsPercent}
                onChange={(v) => setDraft({ ...draft, compliance: { ...draft.compliance, minNightsPercent: v } })} />
              <ModalField label="Window (days)" value={draft.compliance.windowDays}
                onChange={(v) => setDraft({ ...draft, compliance: { ...draft.compliance, windowDays: v } })} />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 mt-5 mb-2">Replacement schedule</h3>
            <div className="grid grid-cols-3 gap-3">
              <ModalField label="Mask (days)" value={draft.schedule.maskDays}
                onChange={(v) => setDraft({ ...draft, schedule: { ...draft.schedule, maskDays: v } })} />
              <ModalField label="Tube (days)" value={draft.schedule.tubeDays}
                onChange={(v) => setDraft({ ...draft, schedule: { ...draft.schedule, tubeDays: v } })} />
              <ModalField label="Filter (days)" value={draft.schedule.filterDays}
                onChange={(v) => setDraft({ ...draft, schedule: { ...draft.schedule, filterDays: v } })} />
              <ModalField label="Pre-reminder (days)" value={draft.schedule.preReminderDays}
                onChange={(v) => setDraft({ ...draft, schedule: { ...draft.schedule, preReminderDays: v } })} />
              <ModalField label="Post-reminder (days)" value={draft.schedule.postReminderDays}
                onChange={(v) => setDraft({ ...draft, schedule: { ...draft.schedule, postReminderDays: v } })} />
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-700">
                <input type="checkbox" checked={draft.schedule.remindersOn}
                  onChange={(e) => setDraft({ ...draft, schedule: { ...draft.schedule, remindersOn: e.target.checked } })} />
                Reminders on
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input type="checkbox" checked={draft.schedule.patientEmailOn}
                  onChange={(e) => setDraft({ ...draft, schedule: { ...draft.schedule, patientEmailOn: e.target.checked } })} />
                Patient email reminders
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary disabled:opacity-50" disabled={!draft.name.trim()} onClick={save}>Add provider</button>
            </div>
          </div>
        </div>
      )}
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

function ModalField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
