// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import UiInput from "@/components/ui/Input";
import UiSelect from "@/components/ui/Select";
import UiButton from "@/components/ui/Button";

import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { dataRegions } from "@/lib/mock-data";

import { useOrganizationSettingsModel } from "./hooks";
export default function OrganizationSettings() {
  const { countries, timeZones } = useOrganizationSettingsModel();
  return (
    <>
      <Link
        href="/provider/settings"
        className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader title="Organization" subtitle="Identity, region and data residency." />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Identity</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Institution name</label>
              <UiInput className="input" defaultValue="Northside Homecare" />
            </div>
            <div>
              <label className="label">Unique Provider Identifier</label>
              <UiInput className="input" defaultValue="UPI-NS-44120" readOnly />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Country</label>
                <UiSelect className="input">
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </UiSelect>
              </div>
              <div>
                <label className="label">Time zone</label>
                <UiSelect className="input">
                  {timeZones.map((tz) => (
                    <option key={tz}>{tz}</option>
                  ))}
                </UiSelect>
              </div>
            </div>
            <UiButton variant="primary" type="submit" className="btn-primary">
              Save
            </UiButton>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Data residency</h2>
          <p className="text-sm text-slate-600 mb-3">
            Patient health data is stored in the selected region. Changing this triggers a
            supervised migration.
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">Storage region</label>
              <UiSelect className="input">
                {dataRegions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </UiSelect>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <UiInput type="checkbox" defaultChecked /> Restrict data export to in-region
              destinations
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <UiInput type="checkbox" defaultChecked /> Require BAA before granting Authorized
              Monitor access
            </label>
            <UiButton variant="primary" type="submit" className="btn-primary">
              Save
            </UiButton>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Compliance defaults</h2>
        <p className="text-sm text-slate-600">
          Compliance rules are configured per insurance provider (not hardcoded to Medicare), so
          non-US payers and regional rules are supported. Manage them under{" "}
          <Link href="/provider/settings/insurance" className="text-brand-600 font-medium">
            Insurance providers
          </Link>
          .
        </p>
      </div>
    </>
  );
}
