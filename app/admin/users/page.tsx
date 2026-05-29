import PageHeader from "@/components/PageHeader";
import { Plus } from "lucide-react";
import { adminUsers } from "@/lib/mock-data";

export default function AdminUsers() {
  return (
    <>
      <PageHeader
        title="Admin users"
        subtitle="Transcend platform staff and their roles."
        actions={<button className="btn-primary"><Plus className="w-4 h-4" /> Invite admin</button>}
      />

      <div className="grid md:grid-cols-4 gap-4 mb-5">
        {[
          ["Super Admin", "Full platform control, incl. admin users & settings."],
          ["Approver", "Review and approve org registrations."],
          ["Support", "Assist orgs; suspend/reinstate; no settings."],
          ["Read-only", "View dashboards and audit only."],
        ].map(([r, d]) => (
          <div key={r} className="card p-4">
            <div className="font-semibold text-slate-900 text-sm">{r}</div>
            <p className="text-xs text-slate-600 mt-1">{d}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Email</th>
              <th className="text-left font-medium px-5 py-2">Role</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-left font-medium px-5 py-2">Last active</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3"><span className="badge badge-slate">{u.role}</span></td>
                <td className="px-5 py-3"><span className={`badge ${u.status === "active" ? "badge-green" : "badge-amber"}`}>{u.status}</span></td>
                <td className="px-5 py-3 text-slate-600">{u.lastActive}</td>
                <td className="px-5 py-3 text-right"><button className="btn-secondary">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
