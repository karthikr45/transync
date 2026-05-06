import PageHeader from "@/components/PageHeader";
import { Download, FileText } from "lucide-react";

export default function ProviderReports() {
  const recent = [
    { id: "r1", name: "Monthly compliance — All patients (Apr 2026)", date: "2026-05-01", size: "1.4 MB" },
    { id: "r2", name: "Medicare cohort — Compliance audit (Q1 2026)", date: "2026-04-08", size: "942 KB" },
    { id: "r3", name: "BlueCross export (Mar 2026)", date: "2026-04-02", size: "612 KB" },
  ];
  return (
    <>
      <PageHeader title="Reports" subtitle="Generate compliance and audit reports across your patient population." />

      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Build a new report</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="label">Cohort</label>
            <select className="input">
              <option>All patients</option>
              <option>Medicare only</option>
              <option>BlueCross only</option>
              <option>At-risk patients</option>
            </select>
          </div>
          <div><label className="label">From</label><input className="input" type="date" /></div>
          <div><label className="label">To</label><input className="input" type="date" /></div>
          <div>
            <label className="label">Format</label>
            <select className="input"><option>PDF</option><option>CSV</option><option>Both</option></select>
          </div>
          <div>
            <label className="label">Include</label>
            <select className="input" multiple>
              <option>Usage hours</option>
              <option>AHI</option>
              <option>Mask leak</option>
              <option>Clinical notes</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full"><Download className="w-4 h-4" /> Generate report</button>
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Recent reports</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Report</th>
              <th className="text-left font-medium px-5 py-2">Generated</th>
              <th className="text-left font-medium px-5 py-2">Size</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-5 py-3 flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-slate-400" /> {r.name}
                </td>
                <td className="px-5 py-3 text-slate-600">{r.date}</td>
                <td className="px-5 py-3 text-slate-600">{r.size}</td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-secondary"><Download className="w-4 h-4" /> Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
