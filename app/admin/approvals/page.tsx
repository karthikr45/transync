"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Check, X, ShieldCheck, FileText, AlertTriangle, RefreshCw } from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AccountUser } from "@/lib/types.api";

export default function AdminApprovals() {
  const [regs, setRegs] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"providers" | "monitors">("providers");
  const [detail, setDetail] = useState<AccountUser | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await homeCareApi.listPending();
      setRegs(data);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load pending registrations.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function doApprove(id: string) {
    setActing(id);
    try {
      await homeCareApi.approve(id);
      setRegs((r) => r.filter((x) => x._id !== id));
      setDetail(null);
    } catch (e) {
      setError((e as ApiError).message || "Approve failed.");
    } finally { setActing(null); }
  }

  async function doReject(id: string, reason: string) {
    setActing(id);
    try {
      await homeCareApi.reject(id, reason || undefined);
      setRegs((r) => r.filter((x) => x._id !== id));
      setDetail(null);
      setRejectReason("");
    } catch (e) {
      setError((e as ApiError).message || "Reject failed.");
    } finally { setActing(null); }
  }

  const pendingProviders = regs.filter((r) => r.userType === "home_care_provider");
  const pendingMonitors = regs.filter((r) => r.userType === "authorized_monitor");
  const list = tab === "providers" ? pendingProviders : pendingMonitors;

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="Review and activate new Home Care registrations."
        actions={<button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>}
      />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      <div className="card p-3 mb-4 flex gap-2">
        <button onClick={() => setTab("providers")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${tab === "providers" ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}>
          Homecare Providers <span className="ml-1 badge badge-amber">{pendingProviders.length}</span>
        </button>
        <button onClick={() => setTab("monitors")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${tab === "monitors" ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-slate-200 text-slate-600"}`}>
          Authorized Monitors <span className="ml-1 badge badge-slate">{pendingMonitors.length}</span>
        </button>
      </div>

      <div className="card p-4 mb-4 text-xs text-slate-600 bg-slate-50 border-slate-200 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          {tab === "providers"
            ? "Verify business license, accreditation and BAA outside this UI before approving — the API does not enforce them."
            : "Verify identity (NPI / institution) before approving. Monitors see no data until they claim device IDs and a user record exists for that device."}
        </span>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : list.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">No pending {tab === "providers" ? "providers" : "monitors"}.</div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">
                    {r.firstName} {r.lastName}
                    {r.userType === "home_care_provider" && r.companyName && <span className="text-slate-500 font-normal"> · {r.companyName}</span>}
                    {r.userType === "authorized_monitor" && r.institutionName && <span className="text-slate-500 font-normal"> · {r.institutionName}</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.email} · {r.country ?? "—"} · submitted {r.createdAt ? formatDate(r.createdAt) : "—"}</div>

                  {r.userType === "home_care_provider" ? (
                    <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <Cell label="Company" value={r.companyName ?? "—"} />
                      <Cell label="Account #" value={r.accountNumber ?? "—"} />
                      <Cell label="Phone" value={r.phone ?? "—"} />
                    </dl>
                  ) : (
                    <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <Cell label="Institution" value={r.institutionName ?? "—"} />
                      <Cell label="Unique ID" value={r.uniqueIdentifier ?? "—"} />
                      <Cell label="Phone" value={r.phone ?? "—"} />
                    </dl>
                  )}
                </div>
                <button className="btn-secondary shrink-0" onClick={() => setDetail(r)}><FileText className="w-4 h-4" /> Review</button>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn-secondary" disabled={!!acting} onClick={() => doReject(r._id, "")}>
                  <X className="w-4 h-4" /> Reject
                </button>
                <button className="btn-primary" disabled={!!acting} onClick={() => doApprove(r._id)}>
                  <Check className="w-4 h-4" /> Approve
                </button>
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
                <div className="text-lg font-semibold text-slate-900">{detail.firstName} {detail.lastName}</div>
                <span className={`badge mt-1 ${detail.userType === "home_care_provider" ? "badge-amber" : "badge-slate"}`}>
                  {detail.userType === "home_care_provider" ? "Homecare Provider" : "Authorized Monitor"}
                </span>
              </div>

              <dl className="space-y-2 text-sm">
                <DRow label="Email" value={detail.email} />
                <DRow label="Username" value={detail.userName} />
                <DRow label="Title" value={detail.title ?? "—"} />
                <DRow label="Phone" value={detail.phone ?? "—"} />
                <DRow label="Submitted" value={detail.createdAt ? formatDateTime(detail.createdAt) : "—"} />
              </dl>

              {detail.userType === "home_care_provider" ? (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Corporate</h3>
                  <dl className="space-y-2 text-sm">
                    <DRow label="Company name" value={detail.companyName ?? "—"} />
                    <DRow label="Account number" value={detail.accountNumber ?? "—"} />
                    <DRow label="Address" value={`${detail.address1 ?? ""} ${detail.address2 ?? ""}`.trim() || "—"} />
                    <DRow label="City / State" value={`${detail.city ?? "—"} / ${detail.stateProvince ?? "—"}`} />
                    <DRow label="Postal" value={detail.postalCode ?? "—"} />
                    <DRow label="Country" value={detail.country ?? "—"} />
                  </dl>
                </div>
              ) : (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Identity & Contact</h3>
                  <dl className="space-y-2 text-sm">
                    <DRow label="Institution" value={detail.institutionName ?? "—"} />
                    <DRow label="Unique identifier" value={detail.uniqueIdentifier ?? "—"} />
                    <DRow label="Address" value={`${detail.address1 ?? ""} ${detail.address2 ?? ""}`.trim() || "—"} />
                    <DRow label="City / State" value={`${detail.city ?? "—"} / ${detail.stateProvince ?? "—"}`} />
                    <DRow label="Country" value={detail.country ?? "—"} />
                  </dl>
                </div>
              )}

              <div>
                <label className="label">Rejection reason (optional)</label>
                <input className="input" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Shown to the client at login if rejected." />
              </div>

              <div className="flex gap-2 pt-2">
                <button className="btn-secondary flex-1" disabled={!!acting} onClick={() => doReject(detail._id, rejectReason)}>
                  <X className="w-4 h-4" /> Reject
                </button>
                <button className="btn-primary flex-1" disabled={!!acting} onClick={() => doApprove(detail._id)}>
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-right text-slate-900">{value}</dd>
    </div>
  );
}
