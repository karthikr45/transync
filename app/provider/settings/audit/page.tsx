import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Download } from "lucide-react";
import { providerAuditLog } from "@/lib/mock-data";

export default function ProviderAudit() {
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Audit log"
        subtitle="Every action on PHI and configuration is recorded. Required for HIPAA / regulated SaMD."
        actions={<button className="btn-secondary"><Download className="w-4 h-4" /> Export</button>}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Timestamp</th>
              <th className="text-left font-medium px-5 py-2">User</th>
              <th className="text-left font-medium px-5 py-2">Role</th>
              <th className="text-left font-medium px-5 py-2">Action</th>
              <th className="text-left font-medium px-5 py-2">Patient</th>
            </tr>
          </thead>
          <tbody>
            {providerAuditLog.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600 font-mono text-xs">{l.timestamp}</td>
                <td className="px-5 py-3 text-slate-800">{l.user}</td>
                <td className="px-5 py-3"><span className="badge badge-slate">{l.role}</span></td>
                <td className="px-5 py-3 text-slate-700">{l.action}</td>
                <td className="px-5 py-3 text-slate-700">{l.patientName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
