import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import UsageChart from "@/components/UsageChart";
import ComplianceBadge from "@/components/ComplianceBadge";
import { patients, generateSessions, alerts } from "@/lib/mock-data";
import { ArrowLeft, Download, MessageSquare, Bell } from "lucide-react";

export default function PatientDetail({ params }: { params: { id: string } }) {
  const p = patients.find((x) => x.id === params.id);
  if (!p) notFound();
  const sessions = generateSessions(30);
  const patientAlerts = alerts.filter((a) => a.patientId === p.id);

  return (
    <>
      <Link href="/provider/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title={p.name}
        subtitle={`${p.email} · DOB ${p.dob} · ${p.payer}`}
        actions={
          <>
            <ComplianceBadge status={p.status} />
            <button className="btn-secondary"><MessageSquare className="w-4 h-4" /> Send reminder</button>
            <button className="btn-primary"><Download className="w-4 h-4" /> Export report</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="7d avg" value={`${p.usageLast7d}h`} />
        <StatCard label="30d avg" value={`${p.usageLast30d}h`} />
        <StatCard label="AHI" value={p.ahi.toFixed(1)} hint="events/hr" />
        <StatCard label="Compliance" value={`${p.complianceDays}/30`} hint="nights ≥ 4h" />
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Usage trend (30 days)</h2>
        <UsageChart sessions={sessions} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Therapy details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Device" value={p.device} />
            <Row label="Serial" value={p.serial} />
            <Row label="Prescription" value={p.prescription} />
            <Row label="Mask seal" value={`${p.maskSeal}%`} />
            <Row label="Leak" value={`${p.leak} L/min`} />
            <Row label="Last sync" value={p.lastSync} />
          </dl>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Active alerts</h2>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          {patientAlerts.length === 0 ? (
            <div className="text-sm text-slate-500">No active alerts.</div>
          ) : (
            <ul className="space-y-3">
              {patientAlerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      a.severity === "high" ? "bg-red-500" : a.severity === "medium" ? "bg-amber-500" : "bg-slate-400"
                    }`}
                  />
                  <div>
                    <div className="text-sm text-slate-800">{a.message}</div>
                    <div className="text-xs text-slate-500">{a.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Clinical notes</h2>
        <textarea className="input min-h-[80px]" placeholder="Add a note about this patient (only visible to your team)..." />
        <div className="mt-3 flex justify-end"><button className="btn-primary">Save note</button></div>
        <ul className="mt-4 space-y-3">
          <li className="border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-500">2026-04-30 · Sarah Kim, RT</div>
            <p className="text-sm text-slate-800 mt-0.5">Called patient about mask leak. Replacing cushion on next visit.</p>
          </li>
          <li className="border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-500">2026-04-15 · Sarah Kim, RT</div>
            <p className="text-sm text-slate-800 mt-0.5">Reviewed pressure setting; patient reports better sleep.</p>
          </li>
        </ul>
      </div>
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
