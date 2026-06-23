"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Plus, Search, X, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { ClaimedDevice, DeviceUploadResult } from "@/lib/types.api";

export default function DevicesPage() {
  const [q, setQ] = useState("");
  const [devices, setDevices] = useState<ClaimedDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [showReg, setShowReg] = useState(false);
  const [ids, setIds] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeviceUploadResult | null>(null);

  async function load() {
    setLoading(true);
    setListError(null);
    try {
      const r = await homeCareApi.listDevices();
      setDevices(r.devices);
      setTotal(r.total);
    } catch (e) {
      setListError((e as ApiError).message || "Could not load devices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = devices.filter((d) =>
    !q ||
    d.deviceId.toLowerCase().includes(q.toLowerCase()) ||
    (d.endUserName ?? "").toLowerCase().includes(q.toLowerCase()) ||
    (d.model ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  async function submitClaim() {
    setError(null); setResult(null);
    const deviceIds = ids
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (deviceIds.length === 0) { setError("Enter at least one device ID."); return; }
    setBusy(true);
    try {
      const r = await homeCareApi.uploadDevices({ deviceIds });
      setResult(r);
      load();
    } catch (e) {
      setError((e as ApiError).message || "Upload failed.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader
        title="Devices"
        subtitle={loading ? "Loading…" : `${total} device${total === 1 ? "" : "s"} claimed by your organisation.`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <button className="btn-primary" onClick={() => { setShowReg(true); setIds(""); setResult(null); setError(null); }}>
              <Plus className="w-4 h-4" /> Claim device IDs
            </button>
          </div>
        }
      />

      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search by device ID, model or patient…" />
        </div>
      </div>

      {listError && (
        <div role="alert" className="card p-3 mb-4 bg-red-50 border-red-100 text-red-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {listError}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Device ID</th>
              <th className="text-left font-medium px-5 py-2">Model</th>
              <th className="text-left font-medium px-5 py-2">Firmware</th>
              <th className="text-left font-medium px-5 py-2">Claimed</th>
              <th className="text-left font-medium px-5 py-2">First sync</th>
              <th className="text-left font-medium px-5 py-2">Assigned to</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && !listError && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">
                {devices.length === 0 ? "No devices claimed yet. Use ‘Claim device IDs’ to add some." : "No devices match your search."}
              </td></tr>
            )}
            {filtered.map((d) => (
              <tr key={d.deviceId} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/provider/devices/${encodeURIComponent(d.deviceId)}`} className="text-slate-900 font-medium font-mono text-xs hover:text-brand-600">
                    {d.deviceId}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{d.model ?? "—"}</td>
                <td className="px-5 py-3 text-slate-600">{d.firmware ?? "—"}</td>
                <td className="px-5 py-3 text-slate-600">{formatDateTime(d.claimedAt) || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{formatDateTime(d.firstSyncDate) || "—"}</td>
                <td className="px-5 py-3 text-slate-700">
                  {d.endUserName
                    ? d.endUserName
                    : <span className="badge badge-slate">Unassigned</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`badge ${d.status === "active" ? "badge-green" : "badge-slate"}`}>{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReg && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={() => !busy && setShowReg(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Claim device IDs</h2>
              <button onClick={() => setShowReg(false)} disabled={busy} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-slate-500 mt-1">Enter one or more device IDs (one per line, or comma-separated).</p>
            <textarea
              className="input mt-4 min-h-[110px] font-mono text-xs"
              placeholder="DEV-1001&#10;DEV-1002"
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              disabled={busy}
            />
            <p className="text-xs text-slate-500 mt-2">Claims are trust-on-upload. Already-claimed IDs are skipped.</p>

            {error && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
            {result && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-900 flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div>Received {result.received} · inserted {result.inserted} · skipped {result.skipped} · invalid {result.invalid}.</div>
                  <div className="text-xs text-green-800 mt-0.5 font-mono break-all">{result.deviceIds.join(", ")}</div>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowReg(false)} disabled={busy}>Close</button>
              <button className="btn-primary" onClick={submitClaim} disabled={busy}>
                {busy ? "Uploading…" : "Claim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
