import PageHeader from "@/components/PageHeader";
import { Download, FileText } from "lucide-react";

export default function PatientReports() {
  const reports = [
    { id: "r1", name: "Compliance report — Apr 2026", date: "2026-05-01", size: "212 KB" },
    { id: "r2", name: "Compliance report — Mar 2026", date: "2026-04-01", size: "198 KB" },
    { id: "r3", name: "Compliance report — Feb 2026", date: "2026-03-01", size: "204 KB" },
  ];
  return (
    <>
      <PageHeader title="Reports" subtitle="Download or share your therapy and compliance reports." />

      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Generate a new report</h2>
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <div><label className="label">From</label><input className="input" type="date" defaultValue="2026-04-01" /></div>
          <div><label className="label">To</label><input className="input" type="date" defaultValue="2026-04-30" /></div>
          <div>
            <label className="label">Format</label>
            <select className="input"><option>PDF</option><option>CSV</option></select>
          </div>
          <button className="btn-primary"><Download className="w-4 h-4" /> Generate</button>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Available reports</h2>
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
            {reports.map((r) => (
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
