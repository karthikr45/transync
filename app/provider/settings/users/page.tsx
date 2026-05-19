import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Plus } from "lucide-react";
import { orgUsers } from "@/lib/mock-data";

export default function UsersSettings() {
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Users"
        subtitle="The first user is the IT Administrator. Admins create additional users with a role."
        actions={<button className="btn-primary"><Plus className="w-4 h-4" /> Add user</button>}
      />

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        {[
          ["IT Administrator", "Full access plus user / sub-account management."],
          ["Full Access User", "Patients, devices, settings — but not user management."],
          ["Read-Only User", "View-only (billing staff, junior team)."],
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
            {orgUsers.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3"><span className="badge badge-slate">{u.role}</span></td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.status === "active" ? "badge-green" : "badge-amber"}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3 text-slate-600">{u.lastActive}</td>
                <td className="px-5 py-3 text-right">
                  <button className="btn-secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
