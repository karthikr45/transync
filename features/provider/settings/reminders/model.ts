import { patients, patientExtras, devices, insuranceProviders } from "@/lib/mock-data";
export type Reminder = {
  patient: string;
  pid: string;
  item: string;
  due: string;
  state: "due-soon" | "overdue" | "ok";
};

export function buildReminders(): Reminder[] {
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
      due.setDate(due.getDate() + days * (1 + (idx % 2)));
      const state: Reminder["state"] = j === 0 ? "overdue" : j === 1 ? "due-soon" : "ok";
      out.push({ patient: p.name, pid: p.id, item, due: due.toISOString().slice(0, 10), state });
    });
  });
  return out;
}
