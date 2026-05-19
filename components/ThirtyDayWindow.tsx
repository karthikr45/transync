import { Session, find30DayWindow } from "@/lib/mock-data";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ThirtyDayWindow({
  sessions,
  rule = { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
}: {
  sessions: Session[];
  rule?: { minHoursPerNight: number; minNightsPercent: number; windowDays: number };
}) {
  const w = find30DayWindow(sessions, rule);
  return (
    <div className={`card p-5 border ${w.found ? "border-green-200" : "border-red-200"}`}>
      <div className="flex items-start gap-3">
        {w.found ? (
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            {w.found ? `${rule.windowDays}-day Compliance Window found` : `No ${rule.windowDays}-day Compliance Window found`}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Rule: ≥ {rule.minHoursPerNight} h on at least {rule.minNightsPercent}% of nights
            ({w.requiredNights} of {rule.windowDays}) within any consecutive {rule.windowDays}-day window in the last 90 days.
          </p>
          {w.found ? (
            <p className="text-sm text-slate-700 mt-2">
              Qualifying window: <strong>{w.windowStart} → {w.windowEnd}</strong> ·{" "}
              {w.compliantNights}/{w.totalNights} compliant nights.
            </p>
          ) : (
            <p className="text-sm text-slate-700 mt-2">
              Best window: {w.compliantNights}/{w.totalNights} compliant nights (needs {w.requiredNights}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
