// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiInput from "@/components/ui/Input";
import UiButton from "@/components/ui/Button";

import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";

import { useAlertsSettingsModel } from "./hooks";
export default function AlertsSettings() {
  const { rules, toggle } = useAlertsSettingsModel();
  return (
    <>
      <Link
        href="/provider/settings"
        className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800"
      >
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
                <UiInput className="input !py-1 !w-auto text-xs" defaultValue={r.threshold} />
              </div>
            </div>
            <UiButton
              variant="plain"
              type="submit"
              onClick={() => toggle(r.id)}
              className={`relative w-11 h-6 rounded-full transition shrink-0 ${r.enabled ? "bg-brand-600" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 ${r.enabled ? "left-5" : "left-0.5"} w-5 h-5 bg-white rounded-full transition`}
              />
            </UiButton>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Delivery</h2>
        <div className="space-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <UiInput type="checkbox" defaultChecked /> Show in Alerts dashboard
          </label>
          <label className="flex items-center gap-2">
            <UiInput type="checkbox" defaultChecked /> Email assigned staff
          </label>
          <label className="flex items-center gap-2">
            <UiInput type="checkbox" /> Daily digest instead of real-time
          </label>
        </div>
        <div className="mt-4">
          <UiButton variant="primary" type="submit" className="btn-primary">
            Save
          </UiButton>
        </div>
      </div>
    </>
  );
}
