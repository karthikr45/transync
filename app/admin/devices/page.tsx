import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { HardDrive, CheckCircle2, PackageX, Wrench, UploadCloud } from "lucide-react";
import { deviceFleet } from "@/lib/mock-data";

export default function AdminDevices() {
  return (
    <>
      <PageHeader
        title="Device fleet"
        subtitle="Platform-wide Transcend device registry and firmware."
        actions={<button className="btn-primary"><UploadCloud className="w-4 h-4" /> Push firmware</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total devices" value={deviceFleet.total.toLocaleString()} icon={<HardDrive className="w-5 h-5" />} />
        <StatCard label="Active" value={deviceFleet.active.toLocaleString()} tone="good" icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatCard label="Unassigned" value={deviceFleet.unassigned} icon={<PackageX className="w-5 h-5" />} />
        <StatCard label="RMA / repair" value={deviceFleet.rma} tone="warn" icon={<Wrench className="w-5 h-5" />} />
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Firmware distribution</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Model</th>
              <th className="text-left font-medium px-5 py-2">Firmware</th>
              <th className="text-right font-medium px-5 py-2">Devices</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deviceFleet.byFirmware.map((f, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-800">{f.model}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{f.firmware}</td>
                <td className="px-5 py-3 text-right">{f.devices.toLocaleString()}</td>
                <td className="px-5 py-3">
                  {f.latest ? <span className="badge badge-green">Latest</span> : <span className="badge badge-amber">Update available</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  {!f.latest && <button className="btn-secondary">Schedule update</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
