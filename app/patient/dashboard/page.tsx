import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import UsageChart from "@/components/UsageChart";
import ComplianceBadge from "@/components/ComplianceBadge";
import { Moon, Wind, Gauge, Activity } from "lucide-react";
import { currentPatient, generateSessions } from "@/lib/mock-data";

export default function PatientDashboard() {
  const sessions = generateSessions(30);
  const lastNight = sessions[sessions.length - 1];
  return (
    <>
      <PageHeader
        title={`Hi, ${currentPatient.name.split(" ")[0]}`}
        subtitle="Here's how your therapy is going."
        actions={<ComplianceBadge status={currentPatient.status} />}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Last night"
          value={`${lastNight.hours.toFixed(1)}h`}
          hint={`AHI ${lastNight.ahi.toFixed(1)}`}
          tone="good"
          icon={<Moon className="w-5 h-5" />}
        />
        <StatCard label="7-day avg" value={`${currentPatient.usageLast7d}h`} hint="hours/night" icon={<Activity className="w-5 h-5" />} />
        <StatCard label="30-day avg" value={`${currentPatient.usageLast30d}h`} hint="hours/night" icon={<Gauge className="w-5 h-5" />} />
        <StatCard
          label="Mask seal"
          value={`${currentPatient.maskSeal}%`}
          hint={`Leak ${currentPatient.leak} L/min`}
          icon={<Wind className="w-5 h-5" />}
        />
      </div>

      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-slate-900">Usage trend</h2>
          <div className="flex gap-2 text-xs">
            <button className="badge badge-slate">7d</button>
            <button className="badge bg-brand-50 text-brand-700">30d</button>
            <button className="badge badge-slate">90d</button>
          </div>
        </div>
        <UsageChart sessions={sessions} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Compliance progress</h2>
          <div className="text-sm text-slate-500 mb-2">
            {currentPatient.complianceDays} of 30 nights ≥ 4h ({Math.round((currentPatient.complianceDays / 30) * 100)}%)
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-green-500"
              style={{ width: `${(currentPatient.complianceDays / 30) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Medicare requires 4+ hours on 70% of nights in any 30-day window during the first 90 days.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Recent sessions</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium py-1">Date</th>
                <th className="text-right font-medium py-1">Hours</th>
                <th className="text-right font-medium py-1">AHI</th>
                <th className="text-right font-medium py-1">Leak</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(-5).reverse().map((s) => (
                <tr key={s.date} className="border-t border-slate-100">
                  <td className="py-2 text-slate-700">{s.date}</td>
                  <td className="py-2 text-right">{s.hours.toFixed(1)}</td>
                  <td className="py-2 text-right">{s.ahi.toFixed(1)}</td>
                  <td className="py-2 text-right">{s.leak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
