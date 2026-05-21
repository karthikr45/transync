"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Check, X, ShieldCheck, FileText } from "lucide-react";
import { orgRegistrations, OrgRegistration, ApprovalStatus } from "@/lib/mock-data";

export default function AdminApprovals() {
  const [regs, setRegs] = useState<OrgRegistration[]>(orgRegistrations);
  const [tab, setTab] = useState<"providers" | "monitors">("providers");

  const setStatus = (id: string, status: ApprovalStatus) =>
    setRegs((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  const pendingProviders = regs.filter((r) => r.type === "Homecare Provider" && r.status === "pending");
  const pendingMonitors = regs.filter((r) => r.type === "Authorized Monitor" && r.status === "pending");
  const list = tab === "providers" ? pendingProviders : pendingMonitors;

  return (
    <>
      <PageHeader title="Approvals" subtitle="Review and activate new organization registrations." />

      <div className="card p-3 mb-4 flex gap-2">
        <button
          onClick={() => setTab("providers")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${tab === "providers" ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
        >
          Homecare Providers <span className="ml-1 badge badge-amber">{pendingProviders.length}</span>
        </button>
        <button
          onClick={() => setTab("monitors")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${tab === "monitors" ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}
        >
          Authorized Monitors <span className="ml-1 badge badge-slate">{pendingMonitors.length}</span>
        </button>
      </div>

      {tab === "providers" && (
        <div className="card p-4 mb-4 text-xs text-amber-800 bg-amber-50 border-amber-100 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <span><strong>Hard gate.</strong> Providers get population-level PHI. Verify business license, accreditation, and a signed BAA before approving.</span>
        </div>
      )}
      {tab === "monitors" && (
        <div className="card p-4 mb-4 text-xs text-slate-600 bg-slate-50 border-slate-200 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <span><strong>Light gate.</strong> Verify identity (NPI / org) and mark as verified. Monitors see no data until a provider shares a consented patient.</span>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">No pending {tab === "providers" ? "providers" : "monitors"}.</div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.contact} · {r.email} · {r.country} · submitted {r.submittedOn}</div>

                  {r.type === "Homecare Provider" ? (
                    <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <Cell label="License" value={r.license ?? "—"} />
                      <Cell label="Accreditation" value={r.accreditation ?? "—"} />
                      <Cell label="BAA" value={r.baaSigned ? "Signed" : "Not signed"} ok={r.baaSigned} bad={!r.baaSigned} />
                    </dl>
                  ) : (
                    <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <Cell label="Kind" value={r.orgKind ?? "—"} />
                      <Cell label="NPI" value={r.npi ?? "—"} />
                      <Cell label="Identity" value={r.verified ? "Verified" : "Unverified"} ok={r.verified} />
                    </dl>
                  )}
                </div>
                <button className="btn-secondary shrink-0"><FileText className="w-4 h-4" /> Documents</button>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setStatus(r.id, "rejected")}><X className="w-4 h-4" /> Reject</button>
                {r.type === "Homecare Provider" && !r.baaSigned ? (
                  <button className="btn-primary opacity-50 cursor-not-allowed" disabled title="BAA required">
                    <Check className="w-4 h-4" /> Approve (BAA required)
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => setStatus(r.id, "approved")}>
                    <Check className="w-4 h-4" /> {r.type === "Homecare Provider" ? "Approve & activate" : "Verify & approve"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Cell({ label, value, ok, bad }: { label: string; value: string; ok?: boolean; bad?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`font-medium mt-0.5 ${ok ? "text-green-600" : bad ? "text-red-600" : "text-slate-900"}`}>{value}</dd>
    </div>
  );
}
