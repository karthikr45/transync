import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Plus } from "lucide-react";
import { maskTypes } from "@/lib/mock-data";

export default function MaskTypesSettings() {
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Mask types"
        subtitle="The catalog of mask SKUs your organization stocks."
        actions={<button className="btn-primary"><Plus className="w-4 h-4" /> Add mask type</button>}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">SKU</th>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Style</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maskTypes.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{m.sku}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">{m.name}</td>
                <td className="px-5 py-3"><span className="badge badge-slate">{m.style}</span></td>
                <td className="px-5 py-3 text-right"><button className="btn-secondary">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
