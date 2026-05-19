import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Plus } from "lucide-react";
import { careMonitors } from "@/lib/mock-data";

export default function CareMonitorsSettings() {
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Care monitors"
        subtitle="Referring / prescribing physicians and clinicians. Informational tags — they do not grant data access."
        actions={<button className="btn-primary"><Plus className="w-4 h-4" /> Add care monitor</button>}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Kind</th>
              <th className="text-left font-medium px-5 py-2">NPI</th>
              <th className="text-left font-medium px-5 py-2">Institution</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {careMonitors.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-900 font-medium">{c.name}</td>
                <td className="px-5 py-3"><span className="badge badge-slate">{c.kind}</span></td>
                <td className="px-5 py-3 text-slate-600 font-mono text-xs">{c.npi}</td>
                <td className="px-5 py-3 text-slate-600">{c.institution}</td>
                <td className="px-5 py-3 text-right"><button className="btn-secondary">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
