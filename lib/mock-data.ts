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

// ---------- Org & reference data (Phase 1) ----------

export type OrgRole = "IT Administrator" | "Full Access User" | "Read-Only User";

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  status: "active" | "invited";
  lastActive: string;
};

export const orgUsers: OrgUser[] = [
  { id: "u1", name: "Sarah Kim", email: "skim@northside.com", role: "IT Administrator", status: "active", lastActive: "2026-05-06 09:02" },
  { id: "u2", name: "James Rivera", email: "jrivera@northside.com", role: "Full Access User", status: "active", lastActive: "2026-05-06 08:40" },
  { id: "u3", name: "Donna Webb", email: "dwebb@northside.com", role: "Read-Only User", status: "active", lastActive: "2026-05-05 16:11" },
  { id: "u4", name: "Mark Ellis", email: "mellis@northside.com", role: "Full Access User", status: "invited", lastActive: "—" },
];

export type CareMonitor = {
  id: string;
  name: string;
  kind: "Referring Physician" | "Prescribing Physician" | "Other Clinician";
  npi: string;
  institution: string;
};

export const careMonitors: CareMonitor[] = [
  { id: "cm1", name: "Dr. Helen Park", kind: "Prescribing Physician", npi: "1841299104", institution: "Lakeside Sleep Center" },
  { id: "cm2", name: "Dr. Alan Cho", kind: "Referring Physician", npi: "1730455821", institution: "Northgate Pulmonology" },
  { id: "cm3", name: "Dr. Priya Nair", kind: "Prescribing Physician", npi: "1992017345", institution: "Lakeside Sleep Center" },
  { id: "cm4", name: "RN Teresa Gould", kind: "Other Clinician", npi: "—", institution: "Northside Homecare" },
];

export type ReplacementSchedule = {
  maskDays: number;
  tubeDays: number;
  filterDays: number;
  preReminderDays: number;
  postReminderDays: number;
  remindersOn: boolean;
  patientEmailOn: boolean;
};

export type InsuranceProvider = {
  id: string;
  name: string;
  compliance: { minHoursPerNight: number; minNightsPercent: number; windowDays: number };
  schedule: ReplacementSchedule;
};

export const insuranceProviders: InsuranceProvider[] = [
  {
    id: "ins1",
    name: "Medicare",
    compliance: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
    schedule: { maskDays: 90, tubeDays: 90, filterDays: 14, preReminderDays: 7, postReminderDays: 14, remindersOn: true, patientEmailOn: true },
  },
  {
    id: "ins2",
    name: "Medicaid",
    compliance: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
    schedule: { maskDays: 180, tubeDays: 180, filterDays: 30, preReminderDays: 7, postReminderDays: 10, remindersOn: true, patientEmailOn: false },
  },
  {
    id: "ins3",
    name: "BlueCross",
    compliance: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
    schedule: { maskDays: 90, tubeDays: 90, filterDays: 30, preReminderDays: 10, postReminderDays: 14, remindersOn: true, patientEmailOn: true },
  },
  {
    id: "ins4",
    name: "Patient Pay",
    compliance: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
    schedule: { maskDays: 180, tubeDays: 180, filterDays: 60, preReminderDays: 14, postReminderDays: 0, remindersOn: false, patientEmailOn: false },
  },
];

export type MaskType = { id: string; sku: string; name: string; style: "Nasal" | "Nasal Pillow" | "Full Face" };

export const maskTypes: MaskType[] = [
  { id: "m1", sku: "TR-NS-01", name: "Transcend Nasal Mask", style: "Nasal" },
  { id: "m2", sku: "TR-NP-02", name: "Transcend Nasal Pillow", style: "Nasal Pillow" },
  { id: "m3", sku: "TR-FF-03", name: "Transcend Full Face", style: "Full Face" },
];

// ---------- Devices (Phase 2 / 10) ----------

export type Device = {
  serial: string;
  model: string;
  firmware: string;
  registeredOn: string;
  assignedPatientId: string | null;
  installDate: string | null;
  status: "active" | "inactive";
};

export const devices: Device[] = [
  { serial: "TR-MC3-88421", model: "Transcend miniCPAP 3", firmware: "v3.2.1", registeredOn: "2026-01-10", assignedPatientId: "p001", installDate: "2026-01-12", status: "active" },
  { serial: "TR-MC3-77105", model: "Transcend miniCPAP 3", firmware: "v3.2.1", registeredOn: "2026-01-18", assignedPatientId: "p002", installDate: "2026-01-20", status: "active" },
  { serial: "TR-MC3-61320", model: "Transcend miniCPAP 3", firmware: "v3.1.9", registeredOn: "2026-02-02", assignedPatientId: "p003", installDate: "2026-02-04", status: "active" },
  { serial: "TR-MC3-90211", model: "Transcend miniCPAP 3", firmware: "v3.2.1", registeredOn: "2026-02-12", assignedPatientId: "p004", installDate: "2026-02-14", status: "active" },
  { serial: "TR-MC3-44872", model: "Transcend miniCPAP 3", firmware: "v3.2.0", registeredOn: "2026-02-20", assignedPatientId: "p005", installDate: "2026-02-22", status: "active" },
  { serial: "TR-MC3-55119", model: "Transcend miniCPAP 3", firmware: "v3.2.1", registeredOn: "2026-03-01", assignedPatientId: "p006", installDate: "2026-03-03", status: "active" },
  { serial: "TR-MC3-70004", model: "Transcend miniCPAP 3", firmware: "v3.2.1", registeredOn: "2026-04-28", assignedPatientId: null, installDate: null, status: "active" },
  { serial: "TR-MC3-70128", model: "Transcend miniCPAP 3", firmware: "v3.2.1", registeredOn: "2026-05-02", assignedPatientId: null, installDate: null, status: "active" },
];

// ---------- Patient enrichment (Phase 3 / 5) ----------

export type ConsentStatus = "pending" | "approved";

export type PatientExtra = {
  patientId: string; // DME internal reference
  endOfDayCutoff: string; // e.g. "12:00 PM"
  consent: ConsentStatus;
  referringPhysicianId?: string;
  prescribingPhysicianId?: string;
  otherMonitorId?: string;
  authorizedMonitors: { id: string; name: string; institution: string; grantedOn: string }[];
  notes: { id: string; author: string; date: string; text: string }[];
};

export const patientExtras: Record<string, PatientExtra> = {
  p001: {
    patientId: "NS-1001", endOfDayCutoff: "12:00 PM", consent: "approved",
    referringPhysicianId: "cm2", prescribingPhysicianId: "cm1",
    authorizedMonitors: [{ id: "am1", name: "BlueCross Claims", institution: "BlueCross", grantedOn: "2026-02-04" }],
    notes: [
      { id: "n1", author: "Sarah Kim", date: "2026-04-15", text: "Reviewed pressure setting; patient reports better sleep." },
    ],
  },
  p002: {
    patientId: "NS-1002", endOfDayCutoff: "12:00 PM", consent: "approved",
    prescribingPhysicianId: "cm3",
    authorizedMonitors: [{ id: "am2", name: "BlueCross Claims", institution: "BlueCross", grantedOn: "2026-02-10" }],
    notes: [{ id: "n2", author: "Sarah Kim", date: "2026-04-30", text: "Called patient about mask leak. Replacing cushion on next visit." }],
  },
  p003: {
    patientId: "NS-1003", endOfDayCutoff: "06:00 AM", consent: "approved",
    referringPhysicianId: "cm2", prescribingPhysicianId: "cm1",
    authorizedMonitors: [], notes: [],
  },
  p004: {
    patientId: "NS-1004", endOfDayCutoff: "12:00 PM", consent: "approved",
    prescribingPhysicianId: "cm3", authorizedMonitors: [], notes: [],
  },
  p005: {
    patientId: "NS-1005", endOfDayCutoff: "12:00 PM", consent: "approved",
    prescribingPhysicianId: "cm1",
    authorizedMonitors: [{ id: "am3", name: "BlueCross Claims", institution: "BlueCross", grantedOn: "2026-03-01" }],
    notes: [],
  },
  p006: {
    patientId: "NS-1006", endOfDayCutoff: "12:00 PM", consent: "pending",
    prescribingPhysicianId: "cm3", authorizedMonitors: [], notes: [],
  },
};

// ---------- Compliance computations (Phase 7) ----------

export type WindowResult = {
  found: boolean;
  windowStart?: string;
  windowEnd?: string;
  compliantNights: number;
  totalNights: number;
  requiredNights: number;
};

// Medicare-style: any consecutive `windowDays` within the lookback where
// >= minNightsPercent of nights had >= minHoursPerNight hours.
export function find30DayWindow(
  sessions: Session[],
  rule = { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 }
): WindowResult {
  const { minHoursPerNight, minNightsPercent, windowDays } = rule;
  const requiredNights = Math.ceil((minNightsPercent / 100) * windowDays);
  for (let start = 0; start + windowDays <= sessions.length; start++) {
    const win = sessions.slice(start, start + windowDays);
    const compliant = win.filter((s) => s.hours >= minHoursPerNight).length;
    if (compliant >= requiredNights) {
      return {
        found: true,
        windowStart: win[0].date,
        windowEnd: win[win.length - 1].date,
        compliantNights: compliant,
        totalNights: windowDays,
        requiredNights,
      };
    }
  }
  const last = sessions.slice(-windowDays);
  return {
    found: false,
    compliantNights: last.filter((s) => s.hours >= minHoursPerNight).length,
    totalNights: Math.min(windowDays, sessions.length),
    requiredNights,
  };
}

export type FullReport = {
  totalDays: number;
  daysUsed: number;
  totalHours: number;
  avgHours: number;
  medianHours: number;
  p90Pressure: number;
  p95Pressure: number;
  buckets: { lt4: number; h4to6: number; h6to8: number; gte8: number; notUsed: number };
  ahi: number;
  apneaIndex: number;
  hypopneaIndex: number;
  leakAvg: number;
  leakMedian: number;
  leakP90: number;
  leakP95: number;
};

export function fullComplianceReport(sessions: Session[]): FullReport {
  const n = sessions.length;
  const hours = sessions.map((s) => s.hours).sort((a, b) => a - b);
  const leaks = sessions.map((s) => s.leak).sort((a, b) => a - b);
  const totalHours = sessions.reduce((a, s) => a + s.hours, 0);
  const used = sessions.filter((s) => s.hours > 0);
  const pct = (arr: number[], p: number) => arr[Math.min(arr.length - 1, Math.floor((p / 100) * arr.length))] ?? 0;
  return {
    totalDays: n,
    daysUsed: used.length,
    totalHours: +totalHours.toFixed(1),
    avgHours: +(totalHours / n).toFixed(1),
    medianHours: +pct(hours, 50).toFixed(1),
    p90Pressure: 10.4,
    p95Pressure: 11.2,
    buckets: {
      lt4: sessions.filter((s) => s.hours > 0 && s.hours < 4).length,
      h4to6: sessions.filter((s) => s.hours >= 4 && s.hours < 6).length,
      h6to8: sessions.filter((s) => s.hours >= 6 && s.hours < 8).length,
      gte8: sessions.filter((s) => s.hours >= 8).length,
      notUsed: sessions.filter((s) => s.hours === 0).length,
    },
    ahi: +(sessions.reduce((a, s) => a + s.ahi, 0) / n).toFixed(1),
    apneaIndex: +(sessions.reduce((a, s) => a + s.ahi, 0) / n * 0.6).toFixed(1),
    hypopneaIndex: +(sessions.reduce((a, s) => a + s.ahi, 0) / n * 0.4).toFixed(1),
    leakAvg: +(leaks.reduce((a, b) => a + b, 0) / n).toFixed(0),
    leakMedian: +pct(leaks, 50).toFixed(0),
    leakP90: +pct(leaks, 90).toFixed(0),
    leakP95: +pct(leaks, 95).toFixed(0),
  };
}

export type GroupPeriod = "24h" | "7d" | "30d" | "90d";

export function groupCompliance(period: GroupPeriod) {
  const days = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  return patients
    .filter((p) => patientExtras[p.id]?.consent === "approved")
    .map((p) => {
      const sessions = generateSessions(days);
      const totalHours = sessions.reduce((a, s) => a + s.hours, 0);
      const fourPlus = sessions.filter((s) => s.hours >= 4).length;
      const pctCompliant = Math.round((fourPlus / days) * 100);
      return {
        id: p.id,
        name: p.name,
        patientId: patientExtras[p.id].patientId,
        totalDays: days,
        totalHours: +totalHours.toFixed(1),
        fourPlusSessions: fourPlus,
        ahi: p.ahi,
        compliant: pctCompliant >= 70,
        pctCompliant,
      };
    });
}
