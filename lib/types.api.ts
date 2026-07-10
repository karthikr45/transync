// Types derived from the Home Care API documentation v1.0.

export type UserType = "home_care_provider" | "authorized_monitor";
export type AccountRole = "user" | "super_admin";
export type AccountStatus = "pending" | "approved" | "rejected";

export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  result: T;
  status: "Success" | "Failure" | "Error";
  timestamp: string;
  errorCode: string;
}

export interface RegisterDto {
  userType: UserType;
  firstName: string;
  lastName: string;
  title?: string;
  userName: string;
  email: string;
  confirmEmail: string;
  timeZone: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  phone: string;
  companyName?: string;
  accountNumber?: string;
  uniqueIdentifier?: string;
  institutionName?: string;
  password: string;
  confirmPassword: string;
}

export interface AccountUser {
  _id: string;
  userType: UserType;
  role: AccountRole;
  status: AccountStatus;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  title?: string;
  timeZone?: string;
  companyName?: string;
  accountNumber?: string;
  uniqueIdentifier?: string;
  institutionName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  stateProvince?: string;
  postalCode?: string;
  phone?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: AccountUser;
}

export interface RejectDto {
  reason?: string;
}

export interface DeviceUploadDto {
  deviceIds: string[];
}

export interface DeviceUploadResult {
  received: number;
  inserted: number;
  skipped: number;
  invalid: number;
  deviceIds: string[];
}

export interface DeviceUsersQuery {
  ComplianceStartDate?: string;
  ComplianceEndDate?: string;
  LIMIT?: number;
  OFFSET?: number;
  timeZoneName?: string;
}

export interface DeviceUser {
  _id: string;
  emailHashed: string;
  deviceId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  country?: string;
  state?: string;
  mobile?: string;
  timeZone?: string;
  createdAt?: string;
  treatmentStartDate?: string | null;
  treatmentEndDate?: string | null;
  daysUsedOver4Hours?: number;
}

export interface DeviceUsersResult {
  total: number;
  limit: number;
  offset: number;
  users: DeviceUser[];
}

// ---------- /home-care/devices/list ----------
export type ClaimedDeviceStatus = "active" | "unassigned";
export interface ClaimedDevice {
  deviceId: string;
  model: string | null;
  firmware: string | null;
  endUserName: string | null;
  firstSyncDate: string | null;
  claimedAt: string;
  status: ClaimedDeviceStatus;
}
export interface ClaimedDevicesResponse {
  total: number;
  devices: ClaimedDevice[];
}

export interface ComplianceReportDto {
  deviceId: string;
  emailHashed: string;
  ComplianceStartDate?: string;
  ComplianceEndDate?: string;
  timeZoneName?: string;
}

export interface ComplianceReportResult {
  HeaderMetrics: {
    reportId: string;
    name: string;
    birthday: string;
    age: number;
    daysFromTo: number;
  };
  AnalysisSummaryMetrics: {
    averageAHI: number | null;
    averageUsageTime: number | null;
    averagePressure: number | null;
    averageLeak: number | null;
  };
  AhiMetrics: {
    ahi: number | null;
    obstructiveApneas: number | null;
    obstructiveHypopneas: number | null;
    leak: number | null;
  };
  UsageMetrics: {
    daysUsed: number | null;
    daysUsedOver4Hours: number | null;
    averageUsageTimePerTotalDays: number | null;
    maxUsageTime: number | null;
    daysNotUsed: number | null;
    daysUsedUnder4Hours: number | null;
    averageUsageTimePerUsedDays: number | null;
  };
  BreathingEventMetrics: {
    ahi: number | null;
    obstructiveApneas: number | null;
    obstructiveHypopneas: number | null;
    centralApneas: number | null;
    centralHypopneas: number | null;
    averageApneaDuration: number | null;
    ifl: number | null;
    snoring: number | null;
  };
  PressureMetrics: {
    averagePressure: number | null;
    maxPressure: number | null;
    p90Pressure: number | null;
  };
  LeakMetrics: {
    averageLeak: number | null;
    maxLeak: number | null;
    p90Leak: number | null;
    leakLimitExceedance: number | null;
  };
  DeviceSettingsMetrics: {
    mode: string | null;
    ramp: number | null;
    maskLeak: number | null;
    therapyPressure: { min: number; max: number } | null;
    rampStartPressure: number | null;
    analysisParameter: string | null;
    comfortControlPlusLevel: number | null;
    tubingType: string | null;
    heatedHumidifier: boolean | null;
    heatedTube: boolean | null;
  };
}

// ---------- End User API ----------

export interface SignUpOtpDto { email: string; name: string; }
export interface ValidateOtpDto { email: string; otp: number; }

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string;
  state: string;
  country: string;
  mobile: string;
  cpapUser: string;
  transcendDevice: string;
  occupation: string;
  gender?: string;
  city?: string;
  pincode?: number;
  countryCode?: string;
  profileImage?: string;
  provider?: string;
  providerEmail?: string;
  dealerName?: string;
  devicePurchased?: string;
  timeZone?: string;
  deviceId?: string;
  eventCount?: number;
  isFirmwareUpdate?: boolean;
}

export interface EndUserLoginDto { email: string; password: string; }

export interface EndUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  mobile?: string;
  cpapUser?: string;
  transcendDevice?: string;
  deviceId?: string;
  timeZone?: string;
  occupation?: string;
  provider?: string;
  providerEmail?: string;
  token: string;
  refreshToken: string;
  lastEvent?: string;
  lastSyncDate?: string;
  lastSettingSyncDate?: string;
  pPolicy?: boolean;
}

export type SessionWindow = 0 | 1 | 2 | 3 | 4 | 5;

export interface LastSyncQuery { email: string; deviceId: string; }
export interface LastSyncResult {
  lastEvent: string;
  lastSyncDate: string;
  lastSettingSyncDate?: string;
}

export interface SessionQuery {
  email: string;
  deviceId: string;
  session: SessionWindow;
  timeZone?: number;
  timeZoneName?: string;
}

export interface DataBySessionResult {
  ahi: number;
  avgLeak: number;
  usageHours: number;
  maskRemoved: number;
  sleepScore: number;
}

export interface ReportBySessionQuery extends SessionQuery {
  startDate?: string;
  endDate?: string;
}

export interface ReportBySessionResult {
  datesOfReport: string;
  usage: number;
  numberOfDays: number;
  notUsed: number;
  averageHoursPerNight: number;
  greaterThanFour: number;
  greaterThanSix: number;
  apnea: number;
  hypopnea: number;
  AHI: number;
  apneaDuration: number;
  apneaPercentage: number;
  apneaAvgLength: number;
  longestApnea: number;
  flowLtdIndex: number;
  snoreIndex: number;
  minPressure: number;
  maxPressure: number;
  averagePressure: number;
  ninetyFivePercentilePressure: number;
  averageLeak: number;
  ninetyFivePercentileLeak: number;
  sleepScore: number;
  avgMaskRemoved: number;
  leakAvgRange: number;
}

export interface EventGraphDto { label: string; value: number; }

// Bar-chart endpoints (event/getAverage*) — permissive: API may return
// EventGraphDto[] directly or { data: EventGraphDto[] }, so we normalise
// at the call site.
export type BarChartResponse = EventGraphDto[] | { data?: EventGraphDto[]; values?: number[]; labels?: string[] };

export interface TotalRuntimeDto { totalRunningTime: number }

export interface GeneratePdfDto {
  email: string;
  deviceId: string;
  session: SessionWindow;
  timeZone?: number;
  timeZoneName?: string;
  startDate?: string;
  endDate?: string;
}

// ---------- /parameter/findOne (device parameters / patient settings) ----------
// The mobile app reads CPAP device parameters here to render the
// ---------- /parameter/getByEmailAndDeviceId (device parameters / patient settings) ----------
// The mobile app reads CPAP device parameters here to render the
// "Patient Settings" tab of the report. The current backend returns
// the device's actual field names verbatim:
//   minimumPressure / maximumPressure / startingPressure
//   startingRampPressure / rampDuration
//   EZEX (= AirRelief comfort control level)
// Older firmware / mock builds shipped slightly different names —
// kept as aliases so the consumer code keeps working everywhere.
export interface ParameterQuery { email: string; deviceId: string }
export interface ParameterResult {
  _id?: string;
  email?: string;
  deviceId?: string;
  // Pressure (current API)
  startingPressure?: number | null;
  minimumPressure?: number | null;
  maximumPressure?: number | null;
  startingRampPressure?: number | null;
  rampDuration?: number | null; // minutes
  EZEX?: number | null;
  // Pressure (legacy aliases)
  rampStartPressure?: number | null;
  minPressure?: number | null;
  maxPressure?: number | null;
  pressureMin?: number | null;
  pressureMax?: number | null;
  therapyPressureMin?: number | null;
  therapyPressureMax?: number | null;
  gentleRisePressure?: number | null;
  gentleRiseDuration?: number | null;
  ramp?: number | null;
  rampTime?: number | null;
  airRelief?: number | null;
  comfortControlPlusLevel?: number | null;
  // Mode / tubing / humidifier (not in the current response but kept
  // for future firmware that may report them).
  mode?: string | null;
  tubingType?: string | null;
  heatedHumidifier?: boolean | null;
  heatedTube?: boolean | null;
  // Pass through any other fields the API may return.
  [key: string]: unknown;
}
export interface SleepScoreEventDto {
  totalHoursRating: number;
  ahiRating: number;
  sessionsRating: number;
  snoreRating: number;
  flowLimitedRating: number;
  leakRating: number;
  sleepScore: number;
}

// ---------- /metadata (patient signup dropdowns) ----------
// Permissive: options may come as string[] OR { label, value }[] OR
// { name, code }[]. The client normalises via lib/options.ts.
export type MetadataOption = string | {
  label?: string;
  value?: string;
  name?: string;
  code?: string;
  id?: string;
};
export interface MetadataResponse {
  // Real API field names from /metadata
  occupation?: MetadataOption[];
  userExpList?: MetadataOption[];          // "How long CPAP user"
  devicePurposeList?: MetadataOption[];    // "How using Transcend"
  devicePurchaseList?: MetadataOption[];   // "Where purchased"
  // Other common keys we may use later
  transcendDevice?: MetadataOption[];
  gender?: MetadataOption[];
  timeZones?: MetadataOption[];
  // Misc non-option payloads also returned by /metadata
  clinicalMode?: { delayTime?: string; disable?: boolean };
  appUpdate?: { normalUpdate?: boolean; forceUpdate?: boolean; latestVersion?: string; updateMessage?: string; rm?: boolean };
  // Allow extra keys without TS noise
  [key: string]: unknown;
}

// ---------- /home-care/admin/markets ----------
export interface MarketSummary { total: number; providers: number; payers: number }
export interface MarketRow { country: string; providers: number; payers: number }
export interface MarketsResponse { summary: MarketSummary; markets: MarketRow[] }

// ---------- /home-care/admin/dashboard ----------
export interface AdminDashboardMetrics {
  pendingApprovals: number;
  activeProviders: number;
  activeMonitors: number;
  devices: { total: number; active: number };
}
export type AdminDashboardResult = AdminDashboardMetrics;

// ---------- /home-care/admin/recent-activity ----------
export type AdminActivityAction = "approved" | "rejected" | "suspended" | "reinstated";
export interface AdminActivityEntry {
  id: string;
  name: string;
  userType: UserType;
  action: AdminActivityAction | string;
  date: string;
  actor: string;
}
export interface AdminActivityResult { activity: AdminActivityEntry[] }
export interface AdminActivityQuery { limit?: number }

// ---------- /home-care/admin/clients ----------
export type ClientStatus = "pending" | "approved" | "rejected" | "suspended";
export interface AdminClientRow {
  id: string;
  name: string;
  contactEmail: string;
  userType: UserType;
  country: string;
  joinedAt: string;
  status: ClientStatus;
}
export interface AdminClientsResult {
  total: number;
  limit: number;
  offset: number;
  clients: AdminClientRow[];
}
export interface AdminClientsQuery {
  userType?: UserType;
  status?: ClientStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdminSuspendDto { reason?: string }
export interface AdminSuspendResult {
  _id: string;
  status: ClientStatus | string;
  suspendedBy?: string;
  suspendedAt?: string;
  suspendedReason?: string;
}
export interface AdminReinstateResult { _id: string; status: ClientStatus | string }

// ---------- /home-care/share-recipients & /home-care/shares ----------
export type RecipientType = "home_care_provider" | "authorized_monitor";
export type ShareStatus = "pending" | "accepted" | "declined" | "revoked";

export interface ShareRecipient {
  id: string;
  name: string;
  type: RecipientType;
  email: string;
}
export interface ShareRecipientsResponse { recipients: ShareRecipient[] }

export interface CreateShareDto {
  recipientId: string;
  validTill: string; // yyyy-MM-dd
}
export interface Share {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: RecipientType;
  status: ShareStatus;
  validTill: string;
  grantedAt: string;
}
export interface MySharesResponse { shares: Share[] }

// ---------- /home-care/provider/dashboard, /worklist, /reports ----------
export type ComplianceStatus = "compliant" | "at_risk" | "non_compliant";
export type ProviderAlertType = "low_usage" | "mask_leak" | "no_sync" | "ahi";
export type ProviderAlertSeverity = "high" | "medium";

export interface ProviderDashboardMetrics {
  totalPatients: number;
  compliant: number;
  compliantPct: number;
  atRiskOrNonCompliant: number;
  unassignedDevices: number;
  awaitingConsent: number;
}
export interface PatientNeedingAttention {
  name: string;
  usage7d: number;
  status: ComplianceStatus;
}
export interface ProviderAlert {
  patientName: string;
  type: ProviderAlertType;
  severity: ProviderAlertSeverity;
  message: string;
  date: string;
}
export interface ProviderDashboardResult {
  metrics: ProviderDashboardMetrics;
  patientsNeedingAttention: PatientNeedingAttention[];
  recentAlerts: ProviderAlert[];
}

export type WorklistCategory = "non_compliant" | "at_risk" | "missed_sync" | "awaiting_consent";
export type WorklistAction = "call" | "review" | "contact" | "resend";

export interface WorklistItem {
  category: WorklistCategory;
  patientName: string;
  detail: string;
  suggestedAction: WorklistAction;
}
export interface ProviderWorklistResult {
  total: number;
  open: number;
  limit: number;
  offset: number;
  summary: Partial<Record<WorklistCategory, number>>;
  items: WorklistItem[];
}
export interface ProviderWorklistQuery { limit?: number; offset?: number }

export type ComplianceWindow = "24h" | "7d" | "30d" | "90d";
export interface ProviderReportRow {
  patientId: string;
  name: string;
  deviceId: string;
  totalDays: number;
  therapyHours: number;
  sessionsOver4h: number;
  ahi: number;
  pctCompliant: number;
  compliant: boolean;
}
export interface ProviderReportsResult {
  window: ComplianceWindow;
  total: number;
  limit: number;
  offset: number;
  pageSummary: { compliant: number; total: number; pct: number };
  rows: ProviderReportRow[];
}
export interface ProviderReportsQuery {
  window?: ComplianceWindow;
  limit?: number;
  offset?: number;
}

// ---------- /home-care/shares/incoming (recipient side) ----------
export interface IncomingShare {
  id: string;
  patientName: string;
  patientEmailHashed: string;
  devices: string[];
  status: ShareStatus;
  validTill: string;
  requestedAt?: string;
  grantedAt?: string;
}
export interface IncomingSharesResponse {
  pending: IncomingShare[];
  shares: IncomingShare[];
}

export interface SharedReportDto {
  deviceId: string;
  ComplianceStartDate?: string;
  ComplianceEndDate?: string;
  timeZoneName?: string;
}

// ---------- /users/delete-account ----------
export interface DeleteAccountDto { email: string; deviceId: string }
export interface DeleteAccountResult {
  email: string;
  deviceId: string;
  AccountDeletionRequestDate: string;
}
