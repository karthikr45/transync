"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Phone, Activity, RefreshCw, Mail, Check, AlertTriangle,
} from "lucide-react";
import { homeCareApi, ApiError } from "@/lib/api";
import type {
  ProviderWorklistResult, WorklistAction, WorklistCategory, WorklistItem,
} from "@/lib/types.api";

const PAGE_SIZE = 25;

type CategoryMeta = {
  title: string;
  tone: "red" | "amber" | "blue";
  icon: React.ReactNode;
};

const CATEGORIES: Record<WorklistCategory, CategoryMeta> = {
  non_compliant: { title: "Non-compliant — call patient", tone: "red", icon: <Phone className="w-4 h-4" /> },
  at_risk:       { title: "At risk — review trend",       tone: "amber", icon: <Activity className="w-4 h-4" /> },
  missed_sync:   { title: "Missed device sync",           tone: "amber", icon: <RefreshCw className="w-4 h-4" /> },
  awaiting_consent: { title: "Awaiting patient consent",  tone: "blue",  icon: <Mail className="w-4 h-4" /> },
};

const ACTION_LABEL: Record<WorklistAction, string> = {
  call: "Call",
  review: "Review",
  contact: "Contact",
  resend: "Resend",
};

export default function ProviderWorklist() {
  const [data, setData] = useState<ProviderWorklistResult | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setDone((d) => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function load(nextOffset = offset) {
    setLoading(true); setError(null);
    try {
      setData(await homeCareApi.providerWorklist({ limit: PAGE_SIZE, offset: nextOffset }));
    } catch (err) {
      setError((err as ApiError).message || "Could not load worklist.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(0); }, []);

  const grouped = useMemo(() => {
    const map: Partial<Record<WorklistCategory, WorklistItem[]>> = {};
    for (const item of data?.items ?? []) {
      (map[item.category] ??= []).push(item);
    }
    return map;
  }, [data]);

  const openCount = (data?.items?.length ?? 0) - done.size;

  function itemKey(item: WorklistItem, idx: number) {
    return `${item.category}-${item.patientName}-${idx}`;
  }

  const toneCls = (t: CategoryMeta["tone"]) =>
    t === "red" ? "text-red-600 bg-red-50"
    : t === "amber" ? "text-amber-600 bg-amber-50"
    : "text-brand-600 bg-brand-50";

  return (
    <>
      <PageHeader
        title="Worklist"
        subtitle="Your daily action queue — who needs attention today."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => load(offset)} disabled={loading} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <span className="badge badge-slate">{openCount} open · {done.size} done</span>
          </div>
        }
      />

      {error && (
        <div role="alert" className="card p-3 mb-4 bg-red-50 border-red-100 text-red-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}

      {!loading && data && data.items.length === 0 && (
        <div className="card p-8 text-center text-sm text-slate-500">All clear — no actions needed.</div>
      )}

      <div className="space-y-5">
        {(Object.keys(CATEGORIES) as WorklistCategory[]).map((cat) => {
          const items = grouped[cat] ?? [];
          if (items.length === 0) return null;
          const meta = CATEGORIES[cat];
          const openInGroup = items.filter((_, i) => !done.has(itemKey(items[i], i))).length;
          return (
            <div key={cat} className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${toneCls(meta.tone)}`}>{meta.icon}</span>
                <h2 className="text-sm font-semibold text-slate-900">{meta.title}</h2>
                <span className="badge badge-slate ml-1">{openInGroup}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {items.map((t, i) => {
                  const id = itemKey(t, i);
                  const isDone = done.has(id);
                  return (
                    <li key={id} className={`px-5 py-3 flex items-center gap-3 ${isDone ? "opacity-50" : ""}`}>
                      <button
                        onClick={() => toggle(id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isDone ? "bg-green-600 border-green-600 text-white" : "border-slate-300"}`}
                        aria-pressed={isDone}
                        aria-label={isDone ? "Mark as not done" : "Mark as done"}
                      >
                        {isDone && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                          {t.patientName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{t.detail}</div>
                      </div>
                      <button className="btn-secondary shrink-0" onClick={() => toggle(id)}>
                        {ACTION_LABEL[t.suggestedAction] ?? t.suggestedAction}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>Showing {data.offset + 1}–{Math.min(data.offset + data.items.length, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset === 0 || loading}
              onClick={() => { const n = Math.max(0, offset - PAGE_SIZE); setOffset(n); load(n); }}
            >
              Previous
            </button>
            <button
              className="btn-secondary text-sm disabled:opacity-50"
              disabled={offset + PAGE_SIZE >= data.total || loading}
              onClick={() => { const n = offset + PAGE_SIZE; setOffset(n); load(n); }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
