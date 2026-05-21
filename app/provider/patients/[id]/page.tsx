"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import UsageChart from "@/components/UsageChart";
import ComplianceBadge from "@/components/ComplianceBadge";
import ThirtyDayWindow from "@/components/ThirtyDayWindow";
import {
  patients, patientExtras, generateSessions, devices, careMonitors, alerts, noteTypes,
} from "@/lib/mock-data";
import {
  ArrowLeft, FileBarChart, Plus, X, Clock, CalendarCheck, ArrowRightLeft, Ban, Mail,
} from "lucide-react";

type Modal = null | "assign" | "monitor" | "deactivate";

export default function ProviderPatientDetail() {
  const params = useParams();
  const id = String(params.id);
  const p = patients.find((x) => x.id === id);
  if (!p) notFound();
  const ex = patientExtras[p.id];
  const pending = ex?.consent === "pending";
  const sessions = generateSessions(90);
  const device = devices.find((d) => d.assignedPatientId === p.id);
  const unassigned = devices.filter((d) => !d.assignedPatientId && d.status === "active");
  const patientAlerts = alerts.filter((a) => a.patientId === p.id);

  const [modal, setModal] = useState<Modal>(null);
  const [showWindow, setShowWindow] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState(noteTypes[0]);
  const [followUp, setFollowUp] = useState("");
  const [monitorQuery, setMonitorQuery] = useState("");
  const [grantAccess, setGrantAccess] = useState<"read-only" | "read-write">("read-only");

  const monitorResults = monitorQuery.trim()
    ? [
        { id: "r1", name: "BlueCross Claims", institution: "BlueCross", upi: "MON-7K3-92H" },
        { id: "r2", name: "Dr. Helen Park", institution: "Lakeside Sleep Center", upi: "MON-4F1-20A" },
        { id: "r3", name: "SleepWell Monitoring", institution: "SleepWell Inc.", upi: "MON-9C8-55B" },
      ].filter(
        (m) =>
          m.name.toLowerCase().includes(monitorQuery.toLowerCase()) ||
          m.institution.toLowerCase().includes(monitorQuery.toLowerCase()) ||
          m.upi.toLowerCase().includes(monitorQuery.toLowerCase())
      )
    : [];

  const cm = (cid?: string) => careMonitors.find((c) => c.id === cid);

  return (
    <>
      <Link href="/provider/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title={p.name}
        subtitle={`Patient ID ${ex?.patientId} · DOB ${p.dob} · ${p.payer}`}
        actions={
          pending ? (
            <span className="badge badge-amber">Pending consent</span>
          ) : (
            <>
              <ComplianceBadge status={p.status} />
              <Link href={`/provider/patients/${p.id}/report`} className="btn-secondary"><FileBarChart className="w-4 h-4" /> Full report</Link>
              <button className="btn-primary" onClick={() => setShowWindow((v) => !v)}><CalendarCheck className="w-4 h-4" /> 30-day window</button>
            </>
          )
        }
      />

      {pending && (
        <div className="card p-4 mb-5 flex items-start gap-3 bg-amber-50 border-amber-100">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900 flex-1">
            <strong>Awaiting patient consent.</strong> Compliance data is hidden until {p.name} approves monitoring via the confirmation email.
          </div>
          <button className="btn-secondary"><Mail className="w-4 h-4" /> Resend email</button>
        </div>
      )}

      {!pending && showWindow && (
        <div className="mb-5"><ThirtyDayWindow sessions={sessions} /></div>
      )}

      {!pending && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="7d avg" value={`${p.usageLast7d}h`} />
            <StatCard label="30d avg" value={`${p.usageLast30d}h`} />
            <StatCard label="AHI" value={p.ahi.toFixed(1)} hint="events/hr" />
            <StatCard label="Compliance" value={`${p.complianceDays}/30`} hint="nights ≥ 4h" />
          </div>
          <div className="card p-5 mt-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Usage trend (90 days)</h2>
            <UsageChart sessions={sessions} />
          </div>
        </>
      )}

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        {/* Devices */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Devices</h2>
            <button className="btn-secondary" onClick={() => setModal("assign")}><Plus className="w-4 h-4" /> Assign</button>
          </div>
          {device ? (
            <dl className="space-y-2 text-sm">
              <Row label="Serial" value={device.serial} />
              <Row label="Model" value={device.model} />
              <Row label="Firmware" value={device.firmware} />
              <Row label="Install date" value={device.installDate ?? "—"} />
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No device assigned.</p>
          )}
        </div>

        {/* Care monitors */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Care monitors</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Referring physician" value={cm(ex?.referringPhysicianId)?.name ?? "—"} />
            <Row label="Prescribing physician" value={cm(ex?.prescribingPhysicianId)?.name ?? "—"} />
            <Row label="Other monitor" value={cm(ex?.otherMonitorId)?.name ?? "—"} />
          </dl>
          <p className="text-xs text-slate-500 mt-3">Informational tags — these do not grant data access.</p>
        </div>

        {/* Authorized monitors */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Authorized monitors</h2>
            <button className="btn-secondary" onClick={() => setModal("monitor")}><Plus className="w-4 h-4" /> Add</button>
          </div>
          {ex?.authorizedMonitors.length ? (
            <ul className="space-y-2">
              {ex.authorizedMonitors.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm border-t border-slate-100 pt-2 first:border-0 first:pt-0">
                  <div>
                    <div className="text-slate-800 font-medium flex items-center gap-2">
                      {m.name}
                      <span className={`badge ${m.access === "read-write" ? "badge-amber" : "badge-slate"}`}>
                        {m.access === "read-write" ? "Read-write" : "Read-only"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{m.institution} · granted {m.grantedOn}</div>
                  </div>
                  <button className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No authorized monitors. Grants read-only access to an external clinician or payer.</p>
          )}
        </div>

        {/* Patient functions */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Patient functions</h2>
          <div className="space-y-2">
            <button className="btn-secondary w-full justify-start" onClick={() => setShowWindow(true)} disabled={pending}>
              <CalendarCheck className="w-4 h-4" /> View 30-day compliance window
            </button>
            <Link href={`/provider/patients/${p.id}/transfer`} className="btn-secondary w-full justify-start">
              <ArrowRightLeft className="w-4 h-4" /> Transfer patient
            </Link>
            <button className="btn-danger w-full justify-start" onClick={() => setModal("deactivate")}>
              <Ban className="w-4 h-4" /> Deactivate patient
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Notes</h2>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">Note type</label>
            <select className="input" value={noteType} onChange={(e) => setNoteType(e.target.value as typeof noteType)}>
              {noteTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Follow-up date (optional)</label>
            <input className="input" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
        </div>
        <textarea
          className="input min-h-[80px]"
          maxLength={500}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note (500 char max, visible to your team only)..."
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">{noteText.length}/500</span>
          <button className="btn-primary" onClick={() => { setNoteText(""); setFollowUp(""); }}>Save note</button>
        </div>
        <ul className="mt-4 space-y-3">
          {(ex?.notes ?? []).map((n) => (
            <li key={n.id} className="border-t border-slate-100 pt-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="badge badge-slate">Clinical</span>
                {n.date} · {n.author}
              </div>
              <p className="text-sm text-slate-800 mt-0.5">{n.text}</p>
            </li>
          ))}
          {!ex?.notes.length && <li className="text-sm text-slate-500">No notes yet.</li>}
        </ul>
      </div>

      {!pending && patientAlerts.length > 0 && (
        <div className="card p-5 mt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Active alerts</h2>
          <ul className="space-y-3">
            {patientAlerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${a.severity === "high" ? "bg-red-500" : "bg-amber-500"}`} />
                <div><div className="text-sm text-slate-800">{a.message}</div><div className="text-xs text-slate-500">{a.date}</div></div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modal && (
        <Dialog onClose={() => setModal(null)}>
          {modal === "assign" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Assign device</h2>
              <p className="text-sm text-slate-500 mt-1">Only unassigned registered devices are listed. Install date is recorded today.</p>
              <select className="input mt-4">
                {unassigned.length ? unassigned.map((d) => <option key={d.serial}>{d.serial}</option>) : <option>No unassigned devices</option>}
              </select>
              <DialogActions onClose={() => setModal(null)} confirm="Add device" />
            </>
          )}
          {modal === "monitor" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Add authorized monitor</h2>
              <p className="text-sm text-slate-500 mt-1">The monitor must already have a registered Authorized Monitor account. Search by Provider ID, name, or institution.</p>

              <div className="mt-4">
                <label className="label">Access level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGrantAccess("read-only")}
                    className={`text-left rounded-lg border p-3 transition ${grantAccess === "read-only" ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <div className="text-sm font-medium text-slate-900">Read-only</div>
                    <div className="text-xs text-slate-500 mt-0.5">View compliance & reports. For payers / monitoring services.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrantAccess("read-write")}
                    className={`text-left rounded-lg border p-3 transition ${grantAccess === "read-write" ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <div className="text-sm font-medium text-slate-900">Read-write (clinical)</div>
                    <div className="text-xs text-slate-500 mt-0.5">Plus notes, prescription & setting-change requests. For clinicians.</div>
                  </button>
                </div>
              </div>

              <input
                className="input mt-4"
                placeholder="e.g. MON-7K3-92H or 'BlueCross'"
                value={monitorQuery}
                onChange={(e) => setMonitorQuery(e.target.value)}
                autoFocus
              />
              <div className="mt-3 space-y-2 max-h-56 overflow-auto">
                {monitorResults.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.institution} · {m.upi}</div>
                    </div>
                    <button className="btn-primary !py-1 !px-3 text-xs" onClick={() => setModal(null)}>Grant</button>
                  </div>
                ))}
                {monitorQuery && monitorResults.length === 0 && (
                  <p className="text-sm text-slate-500 py-2">No registered monitors match. They must register an Authorized Monitor account first.</p>
                )}
                {!monitorQuery && <p className="text-xs text-slate-400 py-2">Start typing to search registered monitors.</p>}
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-secondary" onClick={() => setModal(null)}>Close</button>
              </div>
            </>
          )}
          {modal === "deactivate" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Deactivate patient</h2>
              <p className="text-sm text-red-700 mt-2 bg-red-50 rounded-lg p-3">
                All device associations are lost when a patient is deactivated. The record is retained and can be found by enabling &quot;Inactive patients&quot;.
              </p>
              <DialogActions onClose={() => setModal(null)} confirm="Deactivate" danger />
            </>
          )}
        </Dialog>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right">{value}</dd>
    </div>
  );
}

function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function DialogActions({ onClose, confirm, danger }: { onClose: () => void; confirm: string; danger?: boolean }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button className="btn-secondary" onClick={onClose}>Cancel</button>
      <button className={danger ? "btn-danger" : "btn-primary"} onClick={onClose}>{confirm}</button>
    </div>
  );
}
