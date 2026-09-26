// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).

import UiTable from "@/components/ui/Table";
import UiButton from "@/components/ui/Button";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";

import { buildReminders } from "./model";

export default function RemindersSettings() {
  const reminders = buildReminders();
  return (
    <>
      <Link
        href="/provider/settings"
        className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to settings
      </Link>
      <PageHeader
        title="Replacement reminders"
        subtitle="Upcoming consumable replacements, driven by each patient's insurer schedule."
      />

      <div className="card overflow-hidden">
        <UiTable className="w-full text-sm">
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
                  <Link
                    href={`/provider/patients/${r.pid}`}
                    className="text-slate-900 font-medium hover:text-brand-600"
                  >
                    {r.patient}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-700">{r.item}</td>
                <td className="px-5 py-3 text-slate-600">{r.due}</td>
                <td className="px-5 py-3">
                  <span
                    className={`badge ${r.state === "overdue" ? "badge-red" : r.state === "due-soon" ? "badge-amber" : "badge-green"}`}
                  >
                    {r.state === "overdue"
                      ? "Overdue"
                      : r.state === "due-soon"
                        ? "Due soon"
                        : "On track"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <UiButton variant="secondary" type="submit" className="btn-secondary">
                    Mark shipped
                  </UiButton>
                </td>
              </tr>
            ))}
          </tbody>
        </UiTable>
      </div>
    </>
  );
}
