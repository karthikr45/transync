"use client";
import { useEffect, useRef, useState } from "react";
import { deviceWorkflowApi, workflowError, type Choice, type WorkflowContext } from "@/lib/device-workflow";

export function useWorkflowContext() {
  const [context, setContext] = useState<WorkflowContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setContext(null); setError(null);
    deviceWorkflowApi.context().then((result) => {
      if (result.contractVersion !== 1 || !Array.isArray(result.permissions)) throw new Error("Device management needs an update. Please contact Transcend support.");
      if (active) setContext(result);
    }).catch((e) => { if (active) setError(workflowError(e)); });
    return () => { active = false; };
  }, [attempt]);
  return { context, error, retry: () => setAttempt((n) => n + 1) };
}

export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return <div role="alert" className="card p-4 mb-4 border-red-200 bg-red-50 text-red-800 flex flex-wrap items-center gap-3">
    <span className="flex-1 text-sm">{message}</span>{retry && <button type="button" className="btn-secondary" onClick={retry}>Retry</button>}
  </div>;
}

export function useMutation() {
  const keys = useRef(new Map<string, string>());
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  async function run(path: string, payload: Record<string, unknown>) {
    if (busyRef.current) throw new Error("An action is already in progress.");
    const fingerprint = JSON.stringify([path, payload]);
    let key = keys.current.get(fingerprint);
    if (!key) { key = crypto.randomUUID(); keys.current.set(fingerprint, key); }
    busyRef.current = true; setBusy(true);
    try {
      const result = await deviceWorkflowApi.mutate(path, payload, key);
      if (!result || typeof result.message !== "string") throw new Error("The server did not confirm this action. Refresh to check its status before retrying.");
      keys.current.delete(fingerprint);
      return result;
    } finally { busyRef.current = false; setBusy(false); }
  }
  return { run, busy };
}

export function ChoicePicker({ kind, label, value, onChange }: {
  kind: "organizations" | "patients"; label: string; value: string; onChange: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true; setLoading(true); setError(null);
    const timer = setTimeout(() => {
      deviceWorkflowApi.choices(kind, search.trim()).then((result) => {
        if (!Array.isArray(result.items)) throw new Error("Could not read the available choices.");
        if (active) setItems(result.items);
      }).catch((e) => { if (active) { setItems([]); setError(workflowError(e)); } })
        .finally(() => { if (active) setLoading(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [kind, search]);
  return <div className="space-y-2">
    <label className="block text-sm">Search {label.toLowerCase()}
      <input className="input mt-1" value={search} placeholder="Type a name to search…" onChange={(e) => { setSearch(e.target.value); onChange(""); }} />
    </label>
    <label className="block text-sm">{label}
      <select aria-label={label} className="input mt-1" required value={value} disabled={loading || !!error} onChange={(e) => onChange(e.target.value)}>
        <option value="">{loading ? "Loading…" : "Select one"}</option>
        {items.map((item) => <option key={item.id} value={item.id}>{item.name}{item.detail ? ` — ${item.detail}` : ""}</option>)}
      </select>
    </label>
    {!loading && !error && !items.length && <p className="text-xs text-slate-500">No eligible matches. Try another name.</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
