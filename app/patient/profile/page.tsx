import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { currentPatient } from "@/lib/mock-data";

export default function PatientProfile() {
  return (
    <>
      <PageHeader title="Profile" subtitle="Personal and prescription information." />
      <MockBanner />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Personal</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First name</label><input className="input" defaultValue={currentPatient.name.split(" ")[0]} /></div>
              <div><label className="label">Last name</label><input className="input" defaultValue={currentPatient.name.split(" ")[1]} /></div>
            </div>
            <div><label className="label">Email</label><input className="input" defaultValue={currentPatient.email} /></div>
            <div><label className="label">Date of birth</label><input className="input" type="date" defaultValue={currentPatient.dob} /></div>
            <button className="btn-primary">Save changes</button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Prescription (read-only)</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Therapy" value={currentPatient.prescription} />
            <Row label="Device" value={currentPatient.device} />
            <Row label="Serial" value={currentPatient.serial} />
            <Row label="Prescribing physician" value="Dr. Helen Park" />
            <Row label="Insurance / payer" value={currentPatient.payer ?? "—"} />
            <Row label="Homecare provider" value={currentPatient.provider ?? "—"} />
          </dl>
          <p className="text-xs text-slate-500 mt-4">
            To update prescription details, contact your prescribing physician.
          </p>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Security</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <button className="btn-secondary">Change password</button>
          <button className="btn-secondary">Enable 2FA</button>
          <button className="btn-danger">Delete account</button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right">{value}</dd>
    </div>
  );
}
