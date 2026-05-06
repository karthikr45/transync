export type ComplianceStatus = "compliant" | "at-risk" | "non-compliant";

export type Patient = {
  id: string;
  name: string;
  email: string;
  dob: string;
  prescription: string;
  device: string;
  serial: string;
  lastSync: string;
  usageLast7d: number; // hours/night avg
  usageLast30d: number;
  ahi: number;
  leak: number;
  maskSeal: number;
  complianceDays: number; // days >= 4hrs in last 30
  status: ComplianceStatus;
  payer?: string;
  provider?: string;
  consentedProvider?: boolean;
  consentedInsurer?: boolean;
};

export type Session = {
  date: string;
  hours: number;
  ahi: number;
  leak: number;
  maskSeal: number;
};

export type Alert = {
  id: string;
  patientId: string;
  patientName: string;
  type: "low-usage" | "high-leak" | "missed-sync" | "high-ahi";
  message: string;
  date: string;
  severity: "low" | "medium" | "high";
};

export type AuditEntry = {
  id: string;
  user: string;
  role: string;
  action: string;
  patientId: string;
  patientName: string;
  timestamp: string;
};

export const patients: Patient[] = [
  {
    id: "p001",
    name: "John Carter",
    email: "john.carter@example.com",
    dob: "1968-04-12",
    prescription: "CPAP 10 cmH2O",
    device: "Transcend miniCPAP 3",
    serial: "TR-MC3-88421",
    lastSync: "2026-05-05 22:14",
    usageLast7d: 6.8,
    usageLast30d: 6.5,
    ahi: 2.1,
    leak: 12,
    maskSeal: 96,
    complianceDays: 28,
    status: "compliant",
    payer: "Medicare",
    provider: "Northside Homecare",
    consentedProvider: true,
    consentedInsurer: true,
  },
  {
    id: "p002",
    name: "Maria Lopez",
    email: "maria.lopez@example.com",
    dob: "1972-09-30",
    prescription: "APAP 8-14 cmH2O",
    device: "Transcend miniCPAP 3",
    serial: "TR-MC3-77105",
    lastSync: "2026-05-05 06:42",
    usageLast7d: 4.2,
    usageLast30d: 3.9,
    ahi: 4.6,
    leak: 22,
    maskSeal: 88,
    complianceDays: 19,
    status: "at-risk",
    payer: "BlueCross",
    provider: "Northside Homecare",
    consentedProvider: true,
    consentedInsurer: true,
  },
  {
    id: "p003",
    name: "David Nguyen",
    email: "d.nguyen@example.com",
    dob: "1955-01-22",
    prescription: "CPAP 12 cmH2O",
    device: "Transcend miniCPAP 3",
    serial: "TR-MC3-61320",
    lastSync: "2026-04-29 23:01",
    usageLast7d: 1.5,
    usageLast30d: 2.4,
    ahi: 8.2,
    leak: 38,
    maskSeal: 72,
    complianceDays: 9,
    status: "non-compliant",
    payer: "Medicare",
    provider: "Northside Homecare",
    consentedProvider: true,
    consentedInsurer: true,
  },
  {
    id: "p004",
    name: "Aisha Patel",
    email: "aisha.p@example.com",
    dob: "1980-11-04",
    prescription: "APAP 6-12 cmH2O",
    device: "Transcend miniCPAP 3",
    serial: "TR-MC3-90211",
    lastSync: "2026-05-05 23:50",
    usageLast7d: 7.4,
    usageLast30d: 7.1,
    ahi: 1.8,
    leak: 8,
    maskSeal: 98,
    complianceDays: 30,
    status: "compliant",
    payer: "Aetna",
    provider: "Northside Homecare",
    consentedProvider: true,
    consentedInsurer: false,
  },
  {
    id: "p005",
    name: "Robert Hayes",
    email: "r.hayes@example.com",
    dob: "1962-06-17",
    prescription: "CPAP 9 cmH2O",
    device: "Transcend miniCPAP 3",
    serial: "TR-MC3-44872",
    lastSync: "2026-05-04 22:08",
    usageLast7d: 5.6,
    usageLast30d: 5.2,
    ahi: 3.4,
    leak: 18,
    maskSeal: 91,
    complianceDays: 24,
    status: "compliant",
    payer: "BlueCross",
    provider: "Northside Homecare",
    consentedProvider: true,
    consentedInsurer: true,
  },
  {
    id: "p006",
    name: "Linda Schmidt",
    email: "l.schmidt@example.com",
    dob: "1971-02-19",
    prescription: "APAP 7-13 cmH2O",
    device: "Transcend miniCPAP 3",
    serial: "TR-MC3-55119",
    lastSync: "2026-05-03 21:42",
    usageLast7d: 3.6,
    usageLast30d: 4.1,
    ahi: 5.1,
    leak: 26,
    maskSeal: 84,
    complianceDays: 17,
    status: "at-risk",
    payer: "Medicare",
    provider: "Northside Homecare",
    consentedProvider: true,
    consentedInsurer: true,
  },
];

export const currentPatient = patients[0];

export function generateSessions(days = 30): Session[] {
  const out: Session[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const seed = (i * 37) % 10;
    out.push({
      date: d.toISOString().slice(0, 10),
      hours: Math.max(0, 6.5 + (seed - 5) * 0.4),
      ahi: 1.5 + (seed % 4) * 0.3,
      leak: 8 + seed,
      maskSeal: 92 + (seed % 6),
    });
  }
  return out;
}

export const alerts: Alert[] = [
  {
    id: "a1",
    patientId: "p003",
    patientName: "David Nguyen",
    type: "low-usage",
    message: "Avg usage 1.5h/night last 7 days (below 4h threshold)",
    date: "2026-05-05",
    severity: "high",
  },
  {
    id: "a2",
    patientId: "p003",
    patientName: "David Nguyen",
    type: "high-leak",
    message: "Mask leak averaging 38 L/min — replacement may be due",
    date: "2026-05-04",
    severity: "high",
  },
  {
    id: "a3",
    patientId: "p002",
    patientName: "Maria Lopez",
    type: "low-usage",
    message: "Trending below compliance threshold (4.2h/night)",
    date: "2026-05-05",
    severity: "medium",
  },
  {
    id: "a4",
    patientId: "p006",
    patientName: "Linda Schmidt",
    type: "missed-sync",
    message: "No data sync for 2 days",
    date: "2026-05-05",
    severity: "medium",
  },
  {
    id: "a5",
    patientId: "p003",
    patientName: "David Nguyen",
    type: "high-ahi",
    message: "AHI trending above 8 — therapy review recommended",
    date: "2026-05-03",
    severity: "high",
  },
];

export const auditLog: AuditEntry[] = [
  { id: "l1", user: "claims@bluecross.com", role: "Insurance", action: "Viewed compliance report", patientId: "p001", patientName: "John Carter", timestamp: "2026-05-06 09:14" },
  { id: "l2", user: "claims@bluecross.com", role: "Insurance", action: "Exported PDF report", patientId: "p005", patientName: "Robert Hayes", timestamp: "2026-05-06 09:11" },
  { id: "l3", user: "nurse@northside.com", role: "Provider", action: "Added clinical note", patientId: "p002", patientName: "Maria Lopez", timestamp: "2026-05-06 08:42" },
  { id: "l4", user: "claims@bluecross.com", role: "Insurance", action: "Viewed patient detail", patientId: "p002", patientName: "Maria Lopez", timestamp: "2026-05-06 08:30" },
  { id: "l5", user: "nurse@northside.com", role: "Provider", action: "Sent reminder", patientId: "p003", patientName: "David Nguyen", timestamp: "2026-05-05 17:21" },
];

export const insuranceThresholds = {
  Medicare: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
  BlueCross: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
  Aetna: { minHoursPerNight: 4, minNightsPercent: 65, windowDays: 30 },
};
