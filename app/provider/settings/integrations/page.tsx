import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { integrations } from "@/lib/mock-data";

export default function IntegrationsSettings() {
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader title="Integrations" subtitle="Connect Transcend to billing, EHR and automation systems." />

      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((i) => (
          <div key={i.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-slate-900">{i.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{i.category}</div>
              </div>
              <span className={`badge ${i.status === "connected" ? "badge-green" : "badge-slate"}`}>{i.status}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{i.description}</p>
            <div className="mt-4">
              <button className={i.status === "connected" ? "btn-secondary" : "btn-primary"}>
                {i.status === "connected" ? "Manage" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
