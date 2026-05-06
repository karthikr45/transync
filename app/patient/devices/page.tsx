import PageHeader from "@/components/PageHeader";
import { Smartphone, Bluetooth, RefreshCw } from "lucide-react";
import { currentPatient } from "@/lib/mock-data";

export default function PatientDevices() {
  return (
    <>
      <PageHeader
        title="My devices"
        subtitle="Devices linked to your account. Pairing happens in the TranSync mobile app."
      />

      <div className="card p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{currentPatient.device}</h2>
              <p className="text-sm text-slate-500">Serial {currentPatient.serial}</p>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-xs text-slate-500">Last sync</dt><dd className="text-slate-800 mt-0.5">{currentPatient.lastSync}</dd></div>
            <div><dt className="text-xs text-slate-500">Firmware</dt><dd className="text-slate-800 mt-0.5">v3.2.1</dd></div>
            <div><dt className="text-xs text-slate-500">Therapy</dt><dd className="text-slate-800 mt-0.5">{currentPatient.prescription}</dd></div>
            <div><dt className="text-xs text-slate-500">Hours of use</dt><dd className="text-slate-800 mt-0.5">1,284 h</dd></div>
          </dl>
          <div className="mt-4 flex gap-2">
            <button className="btn-secondary"><RefreshCw className="w-4 h-4" /> Refresh from mobile</button>
            <button className="btn-secondary">View settings</button>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <div className="flex items-start gap-3">
          <Bluetooth className="w-5 h-5 text-brand-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Add a new device</h3>
            <p className="text-sm text-slate-600 mt-1">
              Pairing a Transcend miniCPAP requires Bluetooth and is done from the TranSync mobile app on your phone.
              Once paired, it will appear here automatically.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
