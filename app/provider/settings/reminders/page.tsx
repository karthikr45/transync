import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { patients, patientExtras, devices, insuranceProviders } from "@/lib/mock-data";

type Reminder = { patient: string; pid: string; item: string; due: string; state: "due-soon" | "overdue" | "ok" };

function buildReminders(): Reminder[] {
  const out: Reminder[] = [];
  patients.slice(0, 4).forEach((p, idx) => {
    const ex = patientExtras[p.id];
    const dev = devices.find((d) => d.assignedPatientId === p.id);
    if (!ex || ex.consent !== "approved" || !dev?.installDate) return;
    const ins = insuranceProviders.find((i) => i.name === p.payer) ?? insuranceProviders[0];
    const items: [string, number][] = [
      ["Mask cushion", ins.schedule.maskDays],
      ["Tubing", ins.schedule.tubeDays],
      ["Filter", ins.schedule.filterDays],
    ];
    items.forEach(([item, days], j) => {
      const due = new Date(dev.installDate as string);
      due.setDate(due.getDate() + days * (1 + idx % 2));
      const state: Reminder["state"] = j === 0 ? "overdue" : j === 1 ? "due-soon" : "ok";
      out.push({ patient: p.name, pid: p.id, item, due: due.toISOString().slice(0, 10), state });
    });
  });
  return out;
}

export default function RemindersSettings() {
  const reminders = buildReminders();
  return (
    <>
      <Link href="/provider/settings" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Replacement reminders"
        subtitle="Upcoming consumable replacements, driven by each patient's insurer schedule."
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-5 py-2">Patient</th>
              <th className="text-left font-medium px-5 py-2">Item</th>
              <th className="text-left font-medium px-5 py-2">Due date</th>
              <th className="text-left font-medium px-5 py-2">State</th>
              <th className="text-right font-medium px-5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-5 py-3">
                  <Link href={`/provider/patients/${r.pid}`} className="text-slate-900 font-medium hover:text-brand-600">{r.patient}</Link>
                </td>
                <td className="px-5 py-3 text-slate-700">{r.item}</td>
                <td className="px-5 py-3 text-slate-600">{r.due}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${r.state === "overdue" ? "badge-red" : r.state === "due-soon" ? "badge-amber" : "badge-green"}`}>
                    {r.state === "overdue" ? "Overdue" : r.state === "due-soon" ? "Due soon" : "On track"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right"><button className="btn-secondary">Mark shipped</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
