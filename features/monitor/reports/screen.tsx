// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).

import UiSelect from "@/components/ui/Select";
import UiInput from "@/components/ui/Input";
import UiButton from "@/components/ui/Button";
import UiTable from "@/components/ui/Table";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { Download, FileText } from "lucide-react";

export default function MonitorReports() {
  const recent = [
    {
      id: "r1",
      name: "Compliance audit — Shared cohort (Apr 2026)",
      date: "2026-05-01",
      size: "2.1 MB",
    },
    {
      id: "r2",
      name: "Patient compliance — John Carter (Jan-Apr 2026)",
      date: "2026-05-01",
      size: "188 KB",
    },
    { id: "r3", name: "Cohort summary — March 2026", date: "2026-04-02", size: "1.6 MB" },
  ];
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate compliance audit reports for your monitoring use case."
      />
      <MockBanner />

      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Build a new report</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="label">Cohort</label>
            <UiSelect className="input">
              <option>All shared patients</option>
              <option>Non-compliant only</option>
              <option>Single patient</option>
            </UiSelect>
          </div>
          <div>
            <label className="label">From</label>
            <UiInput className="input" type="date" />
          </div>
          <div>
            <label className="label">To</label>
            <UiInput className="input" type="date" />
          </div>
          <div>
            <label className="label">Format</label>
            <UiSelect className="input">
              <option>PDF</option>
              <option>CSV</option>
            </UiSelect>
          </div>
          <div>
            <label className="label">Threshold</label>
            <UiSelect className="input">
              <option>Medicare (4h / 70% / 30d)</option>
              <option>BlueCross (4h / 70% / 30d)</option>
              <option>Aetna (4h / 65% / 30d)</option>
              <option>Custom</option>
            </UiSelect>
          </div>
          <div className="flex items-end">
            <UiButton variant="primary" type="submit" className="btn-primary w-full">
              <Download className="w-4 h-4" /> Generate
            </UiButton>
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Recent exports</h2>
        </div>
        <UiTable className="w-full text-sm">
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
                  <UiButton variant="secondary" type="submit" className="btn-secondary">
                    <Download className="w-4 h-4" /> Download
                  </UiButton>
                </td>
              </tr>
            ))}
          </tbody>
        </UiTable>
      </div>
    </>
  );
}
