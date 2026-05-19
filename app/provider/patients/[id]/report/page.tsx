import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ComplianceReport from "@/components/ComplianceReport";
import ThirtyDayWindow from "@/components/ThirtyDayWindow";
import { patients, patientExtras, generateSessions } from "@/lib/mock-data";
import { ArrowLeft, Printer } from "lucide-react";

export default function FullReportPage({ params }: { params: { id: string } }) {
  const p = patients.find((x) => x.id === params.id);
  if (!p) notFound();
  const ex = patientExtras[p.id];
  const sessions = generateSessions(90);

  return (
    <>
      <Link href={`/provider/patients/${p.id}`} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patient
      </Link>
      <PageHeader
        title="Full Compliance Report"
        subtitle={`${p.name} · Patient ID ${ex?.patientId} · ${p.device} ${p.serial}`}
        actions={
          <>
            <div className="flex items-center gap-2 text-sm">
              <input className="input !py-1.5" type="date" defaultValue="2026-02-19" />
              <span className="text-slate-400">→</span>
              <input className="input !py-1.5" type="date" defaultValue="2026-05-19" />
              <button className="btn-secondary">Submit</button>
            </div>
            <button className="btn-primary"><Printer className="w-4 h-4" /> Print to PDF</button>
          </>
        }
      />

      <div className="mb-5"><ThirtyDayWindow sessions={sessions} /></div>
      <ComplianceReport sessions={sessions} />

      <div className="card p-5 mt-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Compliance Detail (night by night)</h3>
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium py-1">Date</th>
              <th className="text-right font-medium py-1">Hours</th>
              <th className="text-right font-medium py-1">AHI</th>
              <th className="text-right font-medium py-1">Leak (L/min)</th>
              <th className="text-right font-medium py-1">Mask seal</th>
              <th className="text-right font-medium py-1">≥ 4h</th>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(-14).reverse().map((s) => (
              <tr key={s.date} className="border-t border-slate-100">
                <td className="py-2 text-slate-700">{s.date}</td>
                <td className="py-2 text-right">{s.hours.toFixed(1)}</td>
                <td className="py-2 text-right">{s.ahi.toFixed(1)}</td>
                <td className="py-2 text-right">{s.leak}</td>
                <td className="py-2 text-right">{s.maskSeal}%</td>
                <td className="py-2 text-right">
                  <span className={`badge ${s.hours >= 4 ? "badge-green" : "badge-red"}`}>{s.hours >= 4 ? "Yes" : "No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-400 mt-3">Showing last 14 nights. Full range exports in the PDF.</p>
      </div>
    </>
  );
}
