"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { ArrowLeft, Check } from "lucide-react";
import { careMonitors, devices, insuranceProviders } from "@/lib/mock-data";

export default function CreatePatient() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const unassigned = devices.filter((d) => !d.assignedPatientId && d.status === "active");

  if (done) {
    return (
      <>
        <PageHeader title="Patient created" />
      <MockBanner />
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Confirmation email sent</h2>
          <p className="text-sm text-slate-600 mt-2">
            The patient must click the confirmation link and approve compliance monitoring before any data
            becomes visible to your team. Until then they appear with a <span className="badge badge-amber">Pending</span> consent status.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link href="/provider/patients" className="btn-secondary">Back to patients</Link>
            <button className="btn-primary" onClick={() => setDone(false)}>Create another</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Link href="/provider/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader title="Create new patient" subtitle="Fields marked * are required." />

      <form
        onSubmit={(e) => { e.preventDefault(); setDone(true); }}
        className="space-y-5 max-w-3xl"
      >
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Patient details</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="label">Patient ID *</label><input required className="input" placeholder="Your internal reference, e.g. NS-1007" /></div>
            <div><label className="label">Birth date *</label><input required className="input" type="date" /></div>
            <div><label className="label">First name *</label><input required className="input" /></div>
            <div><label className="label">Last name *</label><input required className="input" /></div>
            <div><label className="label">Email *</label><input required className="input" type="email" /></div>
            <div><label className="label">Confirm email *</label><input required className="input" type="email" /></div>
            <div>
              <label className="label">End of day cutoff *</label>
              <select required className="input">
                <option>12:00 PM (noon)</option>
                <option>06:00 AM</option>
                <option>09:00 AM</option>
                <option>Midnight</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Defines what counts as one therapy &quot;night&quot; for compliance math.</p>
            </div>
            <div>
              <label className="label">Insurance provider</label>
              <select className="input">
                {insuranceProviders.map((i) => <option key={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Optional</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="label">Transcend device</label>
              <select className="input">
                <option value="">Assign later</option>
                {unassigned.map((d) => <option key={d.serial}>{d.serial}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Referring physician</label>
              <select className="input">
                <option value="">None</option>
                {careMonitors.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prescribing physician</label>
              <select className="input">
                <option value="">None</option>
                {careMonitors.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Other health care monitor</label>
              <select className="input">
                <option value="">None</option>
                {careMonitors.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/provider/patients" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary">Create patient</button>
        </div>
      </form>
    </>
  );
}
