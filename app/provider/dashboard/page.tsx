import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import StatCard from "@/components/StatCard";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Users, AlertTriangle, ShieldCheck, HardDrive, Check, ArrowRight, Clock } from "lucide-react";
import { patients, alerts, devices, patientExtras } from "@/lib/mock-data";

export default function ProviderDashboard() {
  const total = patients.length;
  const compliant = patients.filter((p) => p.status === "compliant").length;
  const atRisk = patients.filter((p) => p.status === "at-risk").length;
  const non = patients.filter((p) => p.status === "non-compliant").length;
  const unassigned = devices.filter((d) => !d.assignedPatientId && d.status === "active").length;
  const pendingConsent = patients.filter((p) => patientExtras[p.id]?.consent === "pending");

  const checklist = [
    { label: "Configure organization users", href: "/provider/settings/users", done: true },
    { label: "Set up insurance providers & replacement schedules", href: "/provider/settings/insurance", done: true },
    { label: "Add care monitors (physicians)", href: "/provider/settings/care-monitors", done: true },
    { label: "Register your first device", href: "/provider/devices", done: true },
    { label: "Create your first patient", href: "/provider/patients/new", done: true },
  ];
  const remaining = checklist.filter((c) => !c.done).length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Northside Homecare — compliance overview." />
      <MockBanner />

      {remaining > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-900">Get set up ({checklist.length - remaining}/{checklist.length})</h2>
          <div className="mt-3 space-y-2">
            {checklist.map((c) => (
              <Link key={c.label} href={c.href} className="flex items-center gap-3 text-sm hover:bg-slate-50 rounded-lg px-2 py-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${c.done ? "bg-green-100 text-green-600" : "border border-slate-300"}`}>
                  {c.done && <Check className="w-3 h-3" />}
                </span>
                <span className={c.done ? "text-slate-400 line-through" : "text-slate-700"}>{c.label}</span>
                {!c.done && <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total patients" value={total} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Compliant" value={compliant} hint={`${Math.round((compliant / total) * 100)}%`} tone="good" icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="At risk / non-compliant" value={atRisk + non} tone="bad" icon={<AlertTriangle className="w-5 h-5" />} />
        <StatCard label="Unassigned devices" value={unassigned} icon={<HardDrive className="w-5 h-5" />} />
      </div>

      {pendingConsent.length > 0 && (
        <div className="card p-4 mt-6 flex items-start gap-3 bg-amber-50 border-amber-100">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>{pendingConsent.length} patient(s) awaiting consent.</strong> Compliance data is hidden until the patient approves monitoring by email.{" "}
            {pendingConsent.map((p, i) => (
              <span key={p.id}>
                <Link href={`/provider/patients/${p.id}`} className="underline font-medium">{p.name}</Link>
                {i < pendingConsent.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Patients needing attention</h2>
            <Link href="/provider/patients" className="text-sm text-brand-600">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr><th className="text-left font-medium py-1">Patient</th><th className="text-right font-medium py-1">Usage 7d</th><th className="text-right font-medium py-1">Status</th></tr>
            </thead>
            <tbody>
              {patients.filter((p) => p.status !== "compliant").map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2"><Link href={`/provider/patients/${p.id}`} className="text-slate-800 font-medium hover:text-brand-600">{p.name}</Link></td>
                  <td className="py-2 text-right">{p.usageLast7d}h</td>
                  <td className="py-2 text-right"><ComplianceBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent alerts</h2>
            <Link href="/provider/alerts" className="text-sm text-brand-600">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${a.severity === "high" ? "bg-red-500" : a.severity === "medium" ? "bg-amber-500" : "bg-slate-400"}`} />
                <div className="flex-1">
                  <Link href={`/provider/patients/${a.patientId}`} className="text-sm font-medium text-slate-800 hover:text-brand-600">{a.patientName}</Link>
                  <div className="text-xs text-slate-600">{a.message}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
