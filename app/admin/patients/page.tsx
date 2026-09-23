"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { homeCareApi } from "@/lib/api";
import { patientFieldLabel, patientList } from "@/lib/admin-patients";
import type { AdminPatientsResult, ApiJson } from "@/lib/types.api";

function FieldValue({ value }: { value: ApiJson | undefined }) {
  if (value === undefined || value === null || value === "") return <span className="text-slate-400">—</span>;
  if (typeof value === "object") return (
    <details>
      <summary className="cursor-pointer text-brand-600">View details</summary>
      <pre className="mt-2 text-xs whitespace-pre-wrap break-words max-w-md">{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
  return <>{String(value)}</>;
}

export default function AdminPatients() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<AdminPatientsResult>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setData(null);
    homeCareApi.adminPatients({ page, limit }).then((result) => {
      if (active) setData(result);
    }).catch((e: unknown) => {
      if (active) setError(e instanceof Error ? e.message : "Failed to load patients.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [page, limit, refresh]);

  const list = patientList(data, page, limit);
  const reload = () => setRefresh((n) => n + 1);

  return (
    <>
      <PageHeader title="Patients" subtitle="All registered patients across the platform."
        actions={<button className="btn-secondary disabled:opacity-50" onClick={reload} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
        </button>} />
      <div className="card p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-600" aria-live="polite">
          {loading ? "Loading patients…" : error ? "Patients unavailable" : list.total !== undefined ? `${list.total} patients` : "Patient directory"}
        </span>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Patients per page
          <select className="input !w-auto" value={limit} disabled={loading}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      {error && <div role="alert" className="card p-4 mb-4 bg-red-50 border-red-100 text-red-800 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm">{error}</span>
        <button className="btn-secondary" onClick={reload}>Retry</button>
      </div>}
      <div aria-busy={loading}>
        {loading && <div role="status" className="card p-8 text-center text-slate-500">Loading patients…</div>}
        {!loading && !error && list.rows && (list.rows.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">No patients found on this page.</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Patients, page {page}</caption>
              <thead className="bg-slate-50 text-xs text-slate-500"><tr>
                {list.columns.map((key) => <th key={key} scope="col" className="text-left font-medium px-5 py-3 whitespace-nowrap">{patientFieldLabel(key)}</th>)}
              </tr></thead>
              <tbody>{list.rows.map((patient, index) => (
                <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                  {list.columns.map((key) => <td key={key} className="px-5 py-3 align-top min-w-[140px] max-w-md break-words">
                    <FieldValue value={patient[key]} />
                  </td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        ))}
        {!loading && !error && list.rows === null && (
          <div className="card p-4">
            <h2 className="font-medium mb-3">Patient details</h2>
            <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
      <nav aria-label="Patient pagination" className="flex items-center justify-between mt-4 gap-3 text-sm text-slate-500">
        <span>Page {page}{list.totalPages ? ` of ${list.totalPages}` : ""}</span>
        <div className="flex gap-2">
          <button className="btn-secondary disabled:opacity-50" disabled={loading || page === 1} onClick={() => setPage((n) => n - 1)}>Previous</button>
          <button className="btn-secondary disabled:opacity-50" disabled={loading || !!error || !list.hasNext} onClick={() => setPage((n) => n + 1)}>Next</button>
        </div>
      </nav>
      {!loading && !error && list.rows !== null && <details className="card p-4 mt-4">
        <summary className="cursor-pointer text-sm font-medium">Response details</summary>
        <pre className="mt-3 text-xs whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
      </details>}
    </>
  );
}
