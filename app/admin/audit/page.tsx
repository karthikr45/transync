import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { Download } from "lucide-react";
import { platformAuditLog } from "@/lib/mock-data";

export default function AdminAudit() {
  return (
    <>
      <PageHeader
        title="Platform audit log"
        subtitle="Every platform-level action: approvals, suspensions, firmware, config."
        actions={<button className="btn-secondary"><Download className="w-4 h-4" /> Export</button>}
      />
      <MockBanner />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Timestamp</th>
              <th className="text-left font-medium px-5 py-2">Actor</th>
              <th className="text-left font-medium px-5 py-2">Action</th>
              <th className="text-left font-medium px-5 py-2">Target</th>
            </tr>
          </thead>
          <tbody>
            {platformAuditLog.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600 font-mono text-xs">{a.timestamp}</td>
                <td className="px-5 py-3 text-slate-800">{a.actor}</td>
                <td className="px-5 py-3 text-slate-700">{a.action}</td>
                <td className="px-5 py-3 text-slate-700">{a.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
