import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import UsageChart from "@/components/UsageChart";
import ComplianceBadge from "@/components/ComplianceBadge";
import { patients, generateSessions, insuranceThresholds } from "@/lib/mock-data";
import { ArrowLeft, Download, Lock } from "lucide-react";

export default function InsurancePatientDetail({ params }: { params: { id: string } }) {
  const p = patients.find((x) => x.id === params.id);
  if (!p || !p.consentedInsurer) notFound();
  const sessions = generateSessions(30);
  const t = (insuranceThresholds as Record<string, { minHoursPerNight: number; minNightsPercent: number; windowDays: number }>)[p.payer ?? "Medicare"] ?? insuranceThresholds.Medicare;
  const requiredDays = Math.ceil((t.minNightsPercent / 100) * t.windowDays);
  const meets = p.complianceDays >= requiredDays;

  return (
    <>
      <Link href="/insurance/patients" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patients
      </Link>
      <PageHeader
        title={p.name}
        subtitle={`${p.payer} · DOB ${p.dob}`}
        actions={
          <>
            <ComplianceBadge status={p.status} />
            <button className="btn-primary"><Download className="w-4 h-4" /> Export PDF</button>
          </>
        }
      />

      <div className="card p-4 mb-5 flex items-center gap-3 bg-slate-50 border-slate-200">
        <Lock className="w-4 h-4 text-slate-500" />
        <div className="text-xs text-slate-600">
          Read-only view. Every access is logged in the audit trail per HIPAA requirements.
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="30d avg use" value={`${p.usageLast30d}h`} hint="hours/night" />
        <StatCard
          label="Days ≥ 4h"
          value={`${p.complianceDays}/${t.windowDays}`}
          hint={`${t.minNightsPercent}% required (${requiredDays} nights)`}
          tone={meets ? "good" : "bad"}
        />
        <StatCard label="AHI" value={p.ahi.toFixed(1)} hint="events/hr" />
        <StatCard label="Plan threshold" value={`${t.minHoursPerNight}h`} hint={`${t.windowDays}-day window`} />
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Usage trend (30 days)</h2>
        <UsageChart sessions={sessions} threshold={t.minHoursPerNight} />
      </div>

      <div className="card p-5 mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Compliance summary</h2>
        <p className={`text-sm ${meets ? "text-green-700" : "text-red-700"} font-medium`}>
          {meets ? "Patient meets plan compliance threshold." : "Patient does not currently meet plan compliance threshold."}
        </p>
        <dl className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <Row label="Device" value={p.device} />
          <Row label="Serial" value={p.serial} />
          <Row label="Prescription" value={p.prescription} />
          <Row label="Last sync" value={p.lastSync} />
          <Row label="Window" value={`${t.windowDays} days`} />
          <Row label="Required nights" value={`${requiredDays}/${t.windowDays}`} />
        </dl>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium mt-0.5">{value}</dd>
    </div>
  );
}
