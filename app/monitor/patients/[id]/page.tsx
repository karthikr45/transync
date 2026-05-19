import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ComplianceReport from "@/components/ComplianceReport";
import ThirtyDayWindow from "@/components/ThirtyDayWindow";
import ComplianceBadge from "@/components/ComplianceBadge";
import { patients, patientExtras, generateSessions, insuranceProviders } from "@/lib/mock-data";
import { ArrowLeft, Printer, Lock } from "lucide-react";

export default function MonitorPatientDetail({ params }: { params: { id: string } }) {
  const p = patients.find((x) => x.id === params.id);
  if (!p || !p.consentedInsurer) notFound();
  const ex = patientExtras[p.id];
  const sessions = generateSessions(90);
  const ins = insuranceProviders.find((i) => i.name === p.payer) ?? insuranceProviders[0];

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
            <button className="btn-primary"><Printer className="w-4 h-4" /> Print to PDF</button>
          </>
        }
      />

      <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
        <Lock className="w-4 h-4 text-slate-500" />
        <div className="text-xs text-slate-600">
          Read-only view. Every access is logged in the audit trail per HIPAA requirements.
        </div>
      </div>

      <div className="mb-5">
        <ThirtyDayWindow sessions={sessions} rule={ins.compliance} />
      </div>

      <ComplianceReport sessions={sessions} />

      <p className="text-xs text-slate-400 mt-4">
        Patient ID {ex?.patientId} · Device {p.device} {p.serial}. As an Authorized Monitor you cannot edit
        patient records, manage devices, or change sharing.
      </p>
    </>
  );
}
