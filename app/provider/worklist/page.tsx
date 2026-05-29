"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Phone, Activity, RefreshCw, Mail, Package, CalendarClock, Check } from "lucide-react";
import { patients, patientExtras, alerts } from "@/lib/mock-data";

type Task = {
  id: string;
  patientId: string;
  patientName: string;
  detail: string;
  action: string;
};

type Group = {
  key: string;
  title: string;
  tone: "red" | "amber" | "blue" | "slate";
  icon: React.ReactNode;
  tasks: Task[];
};

export default function ProviderWorklist() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setDone((d) => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const approved = patients.filter((p) => patientExtras[p.id]?.consent === "approved");

  const groups: Group[] = [
    {
      key: "noncompliant",
      title: "Non-compliant — call patient",
      tone: "red",
      icon: <Phone className="w-4 h-4" />,
      tasks: approved.filter((p) => p.status === "non-compliant").map((p) => ({
        id: `nc-${p.id}`, patientId: p.id, patientName: p.name,
        detail: `${p.usageLast7d}h/night avg · ${p.complianceDays}/30 compliant nights`, action: "Call",
      })),
    },
    {
      key: "atrisk",
      title: "At risk — review trend",
      tone: "amber",
      icon: <Activity className="w-4 h-4" />,
      tasks: approved.filter((p) => p.status === "at-risk").map((p) => ({
        id: `ar-${p.id}`, patientId: p.id, patientName: p.name,
        detail: `Trending below threshold (${p.usageLast7d}h/night)`, action: "Review",
      })),
    },
    {
      key: "missed",
      title: "Missed device sync",
      tone: "amber",
      icon: <RefreshCw className="w-4 h-4" />,
      tasks: alerts.filter((a) => a.type === "missed-sync").map((a) => ({
        id: `ms-${a.id}`, patientId: a.patientId, patientName: a.patientName,
        detail: a.message, action: "Contact",
      })),
    },
    {
      key: "consent",
      title: "Awaiting patient consent",
      tone: "blue",
      icon: <Mail className="w-4 h-4" />,
      tasks: patients.filter((p) => patientExtras[p.id]?.consent === "pending").map((p) => ({
        id: `pc-${p.id}`, patientId: p.id, patientName: p.name,
        detail: "Consent email not yet approved — data hidden", action: "Resend",
      })),
    },
    {
      key: "resupply",
      title: "Resupply due",
      tone: "slate",
      icon: <Package className="w-4 h-4" />,
      tasks: [
        { id: "rs-p001", patientId: "p001", patientName: "John Carter", detail: "Mask cushion overdue (Medicare 90-day)", action: "Order" },
        { id: "rs-p003", patientId: "p003", patientName: "David Nguyen", detail: "Filter due in 3 days", action: "Order" },
      ],
    },
    {
      key: "followup",
      title: "Follow-ups due",
      tone: "blue",
      icon: <CalendarClock className="w-4 h-4" />,
      tasks: [
        { id: "fu-p002", patientId: "p002", patientName: "Maria Lopez", detail: "Mask refit scheduled — confirm cushion replaced", action: "Open" },
      ],
    },
  ];

  const allTasks = groups.flatMap((g) => g.tasks);
  const openCount = allTasks.filter((t) => !done.has(t.id)).length;

  const toneCls = (t: Group["tone"]) =>
    t === "red" ? "text-red-600 bg-red-50" : t === "amber" ? "text-amber-600 bg-amber-50" : t === "blue" ? "text-brand-600 bg-brand-50" : "text-slate-600 bg-slate-100";

  return (
    <>
      <PageHeader
        title="Worklist"
        subtitle="Your daily action queue — who needs attention today."
        actions={<span className="badge badge-slate">{openCount} open · {done.size} done</span>}
      />

      <div className="space-y-5">
        {groups.map((g) => {
          const open = g.tasks.filter((t) => !done.has(t.id));
          if (g.tasks.length === 0) return null;
          return (
            <div key={g.key} className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${toneCls(g.tone)}`}>{g.icon}</span>
                <h2 className="text-sm font-semibold text-slate-900">{g.title}</h2>
                <span className="badge badge-slate ml-1">{open.length}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {g.tasks.map((t) => {
                  const isDone = done.has(t.id);
                  return (
                    <li key={t.id} className={`px-5 py-3 flex items-center gap-3 ${isDone ? "opacity-50" : ""}`}>
                      <button
                        onClick={() => toggle(t.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isDone ? "bg-green-600 border-green-600 text-white" : "border-slate-300"}`}
                      >
                        {isDone && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <Link href={`/provider/patients/${t.patientId}`} className={`text-sm font-medium hover:text-brand-600 ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                          {t.patientName}
                        </Link>
                        <div className="text-xs text-slate-500 truncate">{t.detail}</div>
                      </div>
                      <button className="btn-secondary shrink-0" onClick={() => toggle(t.id)}>{t.action}</button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Tasks are generated from compliance status, sync gaps, consent state, and per-payer resupply schedules — the
        &quot;management by exception&quot; view. Checking an item marks it done for this session.
      </p>
    </>
  );
}
