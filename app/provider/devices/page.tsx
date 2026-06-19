"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Plus, Search, X, AlertTriangle, Check } from "lucide-react";
import { devices, patients } from "@/lib/mock-data";
import { homeCareApi, ApiError } from "@/lib/api";
import type { DeviceUploadResult } from "@/lib/types.api";

export default function DevicesPage() {
  const [q, setQ] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [ids, setIds] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeviceUploadResult | null>(null);
  const patientName = (pid: string | null) => patients.find((p) => p.id === pid)?.name ?? "—";

  const list = devices.filter((d) => !q || d.serial.toLowerCase().includes(q.toLowerCase()));

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
    } catch (e) {
      setError((e as ApiError).message || "Upload failed.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader
        title="Devices"
        subtitle="Claim device IDs your team is authorized to monitor."
        actions={<button className="btn-primary" onClick={() => { setShowReg(true); setIds(""); setResult(null); setError(null); }}><Plus className="w-4 h-4" /> Claim device IDs</button>}
      />

      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search by serial..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 text-xs text-slate-500">
          Local catalog (mock). The API doesn&apos;t expose a list of claimed devices; claim status is confirmed by patient list activity.
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Serial</th>
              <th className="text-left font-medium px-5 py-2">Model</th>
              <th className="text-left font-medium px-5 py-2">Firmware</th>
              <th className="text-left font-medium px-5 py-2">Registered</th>
              <th className="text-left font-medium px-5 py-2">Assigned to</th>
              <th className="text-left font-medium px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.serial} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/provider/devices/${d.serial}`} className="text-slate-900 font-medium font-mono text-xs hover:text-brand-600">{d.serial}</Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{d.model}</td>
                <td className="px-5 py-3 text-slate-600">{d.firmware}</td>
                <td className="px-5 py-3 text-slate-600">{d.registeredOn}</td>
                <td className="px-5 py-3 text-slate-700">
                  {d.assignedPatientId ? patientName(d.assignedPatientId) : <span className="badge badge-slate">Unassigned</span>}
                </td>
                <td className="px-5 py-3"><span className={`badge ${d.status === "active" ? "badge-green" : "badge-red"}`}>{d.status}</span></td>
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
