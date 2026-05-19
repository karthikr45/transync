import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { dataRegions } from "@/lib/mock-data";

export default function OrganizationSettings() {
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader title="Organization" subtitle="Identity, region and data residency." />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Identity</h2>
          <div className="space-y-3">
            <div><label className="label">Institution name</label><input className="input" defaultValue="Northside Homecare" /></div>
            <div><label className="label">Unique Provider Identifier</label><input className="input" defaultValue="UPI-NS-44120" readOnly /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Country</label>
                <select className="input"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Germany</option><option>Australia</option></select>
              </div>
              <div><label className="label">Time zone</label>
                <select className="input"><option>America/Denver</option><option>America/New_York</option><option>UTC</option></select>
              </div>
            </div>
            <button className="btn-primary">Save</button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Data residency</h2>
          <p className="text-sm text-slate-600 mb-3">
            Patient health data is stored in the selected region. Changing this triggers a supervised migration.
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">Storage region</label>
              <select className="input">
                {dataRegions.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" defaultChecked /> Restrict data export to in-region destinations
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" defaultChecked /> Require BAA before granting Authorized Monitor access
            </label>
            <button className="btn-primary">Save</button>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Compliance defaults</h2>
        <p className="text-sm text-slate-600">
          Compliance rules are configured per insurance provider (not hardcoded to Medicare), so non-US payers and
          regional rules are supported. Manage them under{" "}
          <Link href="/provider/settings/insurance" className="text-brand-600 font-medium">Insurance providers</Link>.
        </p>
      </div>
    </>
  );
}
