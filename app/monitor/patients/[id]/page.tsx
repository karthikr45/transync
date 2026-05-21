import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ComplianceReport from "@/components/ComplianceReport";
import ThirtyDayWindow from "@/components/ThirtyDayWindow";
import ComplianceBadge from "@/components/ComplianceBadge";
import { patients, patientExtras, generateSessions, insuranceProviders, currentMonitorAccess } from "@/lib/mock-data";
import { ArrowLeft, Printer, Lock, Pencil, Send } from "lucide-react";

export default function MonitorPatientDetail({ params }: { params: { id: string } }) {
  const p = patients.find((x) => x.id === params.id);
  if (!p || !p.consentedInsurer) notFound();
  const ex = patientExtras[p.id];
  const sessions = generateSessions(90);
  const ins = insuranceProviders.find((i) => i.name === p.payer) ?? insuranceProviders[0];
  const access = currentMonitorAccess(p.id);
  const canWrite = access === "read-write";

  return (
    <>
      <Link href="/monitor/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title={p.name}
        subtitle={`Shared by ${p.provider} · DOB ${p.dob} · ${p.payer}`}
        actions={
          <>
            <ComplianceBadge status={p.status} />
            <span className={`badge ${canWrite ? "badge-amber" : "badge-slate"}`}>
              {canWrite ? "Read-write (clinical)" : "Read-only"}
            </span>
            <button className="btn-primary"><Printer className="w-4 h-4" /> Print to PDF</button>
          </>
        }
      />

      <div className={`card p-4 mb-5 flex items-center gap-3 ${canWrite ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-200"}`}>
        {canWrite ? <Pencil className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-slate-500" />}
        <div className="text-xs text-slate-600">
          {canWrite
            ? "You have clinical (read-write) access for this patient: review compliance and update notes, prescription, or request setting changes. Every action is logged."
            : "Read-only view. You can review compliance and export reports but cannot make changes. Every access is logged."}
        </div>
      </div>

      {canWrite && (
        <div className="card p-5 mb-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Clinical actions</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Prescription</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Mode</label>
                  <select className="input" defaultValue="CPAP"><option>CPAP</option><option>APAP</option><option>BiPAP</option></select>
                </div>
                <div><label className="label">Pressure (cmH₂O)</label><input className="input" defaultValue="10" /></div>
                <div><label className="label">Min</label><input className="input" defaultValue="8" /></div>
                <div><label className="label">Max</label><input className="input" defaultValue="14" /></div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary">Update prescription</button>
                <button className="btn-secondary"><Send className="w-4 h-4" /> Request setting change</button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Setting changes are sent to the Homecare Provider / device. Over-the-air write depends on device support.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Clinical note</h3>
              <textarea className="input min-h-[120px]" placeholder="Document efficacy review, titration decision, follow-up..." />
              <div className="mt-3"><button className="btn-primary">Save note</button></div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <ThirtyDayWindow sessions={sessions} rule={ins.compliance} />
      </div>

      <ComplianceReport sessions={sessions} />

      <p className="text-xs text-slate-400 mt-4">
        Patient ID {ex?.patientId} · Device {p.device} {p.serial}. Access level is set per patient by the Homecare Provider when sharing.
      </p>
    </>
  );
}
