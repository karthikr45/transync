"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, RefreshCw, ShieldCheck, Stethoscope, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { endUserApi, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { RecipientType, Share, ShareRecipient } from "@/lib/types.api";

const TYPE_LABEL: Record<RecipientType, string> = {
  home_care_provider: "Homecare Provider",
  authorized_monitor: "Authorized Monitor",
};

export default function PatientSharing() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { shares } = await endUserApi.listMyShares();
      setShares(shares);
    } catch (err) {
      setError((err as ApiError).message || "Could not load shares.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function revoke(id: string) {
    if (!confirm("Revoke this recipient's access? They will lose data access immediately.")) return;
    try {
      await endUserApi.revokeShare(id);
      setShares((s) => s.map((x) => (x.id === id ? { ...x, status: "revoked" } : x)));
    } catch (err) {
      alert((err as ApiError).message || "Could not revoke share.");
    }
  }

  return (
    <>
      <PageHeader
        title="Data sharing"
        subtitle="Choose who can see your therapy data. Revoke access anytime."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <button onClick={() => setShowInvite(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Invite
            </button>
          </div>
        }
      />

      {error && (
        <div role="alert" className="card p-3 mb-4 bg-red-50 border-red-100 text-red-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Recipient</th>
              <th className="text-left font-medium px-5 py-2">Type</th>
              <th className="text-left font-medium px-5 py-2">Granted</th>
              <th className="text-left font-medium px-5 py-2">Valid till</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shares.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">No active shares yet. Invite a provider or monitor to get started.</td></tr>
            )}
            {shares.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-5 py-3 flex items-center gap-2 text-slate-800">
                  {s.recipientType === "home_care_provider" ? (
                    <Stethoscope className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  )}
                  {s.recipientName}
                </td>
                <td className="px-5 py-3 text-slate-600">{TYPE_LABEL[s.recipientType]}</td>
                <td className="px-5 py-3 text-slate-600">{formatDate(s.grantedAt)}</td>
                <td className="px-5 py-3 text-slate-600">{formatDate(s.validTill)}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${badgeFor(s.status)}`}>{s.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  {s.status === "pending" || s.status === "accepted" ? (
                    <button className="btn-secondary" onClick={() => revoke(s.id)}>
                      <X className="w-4 h-4" /> Revoke
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onCreated={(share) => {
            setShares((s) => [share, ...s.filter((x) => x.id !== share.id)]);
            setShowInvite(false);
          }}
        />
      )}
    </>
  );
}

function badgeFor(status: Share["status"]): string {
  switch (status) {
    case "accepted": return "badge-green";
    case "pending": return "badge-amber";
    case "declined":
    case "revoked": return "badge-slate";
  }
}

function InviteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: Share) => void }) {
  const [type, setType] = useState<RecipientType | "">("");
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [validTill, setValidTill] = useState("");
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecipientId("");
    setRecipients([]);
    if (!type) return;
    setLoadingRecipients(true);
    setError(null);
    endUserApi.listShareRecipients(type)
      .then(({ recipients }) => setRecipients(recipients))
      .catch((err) => setError((err as ApiError).message || "Could not load recipients."))
      .finally(() => setLoadingRecipients(false));
  }, [type]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId || !validTill) return;
    setSubmitting(true);
    setError(null);
    try {
      const share = await endUserApi.createShare({ recipientId, validTill });
      onCreated(share);
    } catch (err) {
      setError((err as ApiError).message || "Could not create share.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="card p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-slate-900">Invite recipient</h2>
        <p className="text-sm text-slate-500 mt-1">They&apos;ll be able to view your therapy data until the date you set.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="invite-type">Recipient type</label>
            <select
              id="invite-type"
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as RecipientType | "")}
              required
            >
              <option value="">Select a type…</option>
              <option value="home_care_provider">Homecare Provider</option>
              <option value="authorized_monitor">Authorized Monitor</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="invite-recipient">Recipient</label>
            <select
              id="invite-recipient"
              className="input"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={!type || loadingRecipients || recipients.length === 0}
              required
            >
              <option value="">
                {loadingRecipients
                  ? "Loading…"
                  : !type
                  ? "Pick a type first"
                  : recipients.length === 0
                  ? "No recipients available"
                  : "Select a recipient…"}
              </option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="invite-valid">Access valid until</label>
            <input
              id="invite-valid"
              className="input"
              type="date"
              min={today}
              value={validTill}
              onChange={(e) => setValidTill(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-3 p-2 rounded bg-red-50 border border-red-100 text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-primary disabled:opacity-50" disabled={submitting || !recipientId || !validTill}>
            {submitting ? "Sending…" : "Send invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
