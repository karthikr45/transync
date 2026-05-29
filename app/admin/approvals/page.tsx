"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Check, X, ShieldCheck, FileText, BadgeCheck } from "lucide-react";
import { orgRegistrations, OrgRegistration, ApprovalStatus } from "@/lib/mock-data";

export default function AdminApprovals() {
  const [regs, setRegs] = useState<OrgRegistration[]>(orgRegistrations);
  const [tab, setTab] = useState<"providers" | "monitors">("providers");
  const [detail, setDetail] = useState<OrgRegistration | null>(null);

  const setStatus = (id: string, status: ApprovalStatus) => {
    setRegs((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setDetail(null);
  };

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
                <button className="btn-secondary shrink-0" onClick={() => setDetail(r)}><FileText className="w-4 h-4" /> Review</button>
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

      {detail && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end" onClick={() => setDetail(null)}>
          <div className="w-full max-w-md h-full bg-white shadow-xl overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-slate-900">Review registration</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  {detail.name}
                  {detail.type === "Authorized Monitor" && detail.verified && <BadgeCheck className="w-4 h-4 text-green-600" />}
                </div>
                <span className={`badge mt-1 ${detail.type === "Homecare Provider" ? "badge-amber" : "badge-slate"}`}>{detail.type}</span>
              </div>

              <dl className="space-y-2 text-sm">
                <DRow label="Contact" value={detail.contact} />
                <DRow label="Email" value={detail.email} />
                <DRow label="Country" value={detail.country} />
                <DRow label="Submitted" value={detail.submittedOn} />
              </dl>

              {detail.type === "Homecare Provider" ? (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Credentials</h3>
                  <dl className="space-y-2 text-sm">
                    <DRow label="Business license" value={detail.license ?? "—"} />
                    <DRow label="Accreditation" value={detail.accreditation ?? "—"} />
                    <DRow label="BAA" value={detail.baaSigned ? "Signed" : "Not signed"} ok={detail.baaSigned} bad={!detail.baaSigned} />
                  </dl>
                  <div className="mt-3 space-y-2">
                    {["Business license.pdf", "Accreditation certificate.pdf", detail.baaSigned ? "BAA (signed).pdf" : null].filter(Boolean).map((d) => (
                      <div key={d as string} className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2">
                        <FileText className="w-4 h-4 text-slate-400" /> {d}
                      </div>
                    ))}
                    {!detail.baaSigned && <p className="text-xs text-red-600">BAA must be signed before approval.</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Identity</h3>
                  <dl className="space-y-2 text-sm">
                    <DRow label="Kind" value={detail.orgKind ?? "—"} />
                    <DRow label="NPI" value={detail.npi ?? "—"} />
                    <DRow label="Status" value={detail.verified ? "Verified" : "Unverified"} ok={detail.verified} />
                  </dl>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button className="btn-secondary flex-1" onClick={() => setStatus(detail.id, "rejected")}><X className="w-4 h-4" /> Reject</button>
                {detail.type === "Homecare Provider" && !detail.baaSigned ? (
                  <button className="btn-primary flex-1 opacity-50 cursor-not-allowed" disabled><Check className="w-4 h-4" /> BAA required</button>
                ) : (
                  <button className="btn-primary flex-1" onClick={() => setStatus(detail.id, "approved")}>
                    <Check className="w-4 h-4" /> {detail.type === "Homecare Provider" ? "Approve" : "Verify & approve"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DRow({ label, value, ok, bad }: { label: string; value: string; ok?: boolean; bad?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-medium text-right ${ok ? "text-green-600" : bad ? "text-red-600" : "text-slate-900"}`}>{value}</dd>
    </div>
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
