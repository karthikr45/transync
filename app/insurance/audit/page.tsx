import PageHeader from "@/components/PageHeader";
import { auditLog } from "@/lib/mock-data";

export default function AuditPage() {
  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every PHI access is logged. Required for HIPAA compliance."
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
            {auditLog.map((l) => (
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
