"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Search, RefreshCw, AlertTriangle, FileBarChart } from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import type { DeviceUser } from "@/lib/types.api";

const LIMIT = 50;

export default function ProviderPatients() {
  const [users, setUsers] = useState<DeviceUser[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextOffset = 0) {
    setLoading(true); setError(null);
    try {
      const data = await homeCareApi.listDeviceUsers({ LIMIT, OFFSET: nextOffset });
      setUsers(data.users);
      setTotal(data.total);
      setOffset(data.offset);
    } catch (e) {
      setError((e as ApiError).message || "Failed to load users.");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(0); }, []);

  const filtered = users.filter((u) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (u.firstName ?? "").toLowerCase().includes(s) ||
      (u.lastName ?? "").toLowerCase().includes(s) ||
      (u.email ?? "").toLowerCase().includes(s) ||
      u.deviceId.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Users (patients) recorded against your claimed devices."
        actions={
          <button className="btn-secondary" onClick={() => load(offset)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
      />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search name, email, device ID..." />
        </div>
        <span className="text-xs text-slate-500 px-2">Showing {filtered.length} of {total}</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-5 py-2">Email</th>
              <th className="text-left font-medium px-5 py-2">Device</th>
              <th className="text-left font-medium px-5 py-2">DOB</th>
              <th className="text-right font-medium px-5 py-2">Days ≥4h (30d)</th>
              <th className="text-left font-medium px-5 py-2">Compliant</th>
              <th className="text-right font-medium px-5 py-2">Report</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No users for your claimed devices.</td></tr>
            ) : (
              filtered.map((u) => {
                const days = u.daysUsedOver4Hours ?? 0;
                const compliant = days >= 21; // 70% of 30
                return (
                  <tr key={u._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="text-slate-900 font-medium">
                        {u.firstName ?? ""} {u.lastName ?? ""}{!u.firstName && !u.lastName ? "(unknown)" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{u.deviceId}</td>
                    <td className="px-5 py-3 text-slate-600">{u.dob ?? "—"}</td>
                    <td className="px-5 py-3 text-right">{days}/30</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${compliant ? "badge-green" : "badge-red"}`}>{compliant ? "Yes" : "No"}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/provider/patients/${u._id}/report?deviceId=${encodeURIComponent(u.deviceId)}&emailHashed=${encodeURIComponent(u.emailHashed)}&name=${encodeURIComponent(`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim())}${u.email ? `&email=${encodeURIComponent(u.email)}` : ""}${u.timeZone ? `&tz=${encodeURIComponent(u.timeZone)}` : ""}`}
                        className="text-slate-400 hover:text-brand-600 inline-flex"
                      >
                        <FileBarChart className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span>Offset {offset} · Limit {LIMIT}</span>
        <div className="flex gap-2">
          <button className="btn-secondary" disabled={loading || offset === 0} onClick={() => load(Math.max(0, offset - LIMIT))}>Previous</button>
          <button className="btn-secondary" disabled={loading || offset + users.length >= total} onClick={() => load(offset + LIMIT)}>Next</button>
        </div>
      </div>
    </>
  );
}
