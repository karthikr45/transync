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
// Shape is intentionally permissive — backend can return any string[]
// keyed by field name, and the frontend will use what it recognises.
export interface MetadataResponse {
  occupation?: string[];
  cpapUser?: string[];
  transcendDevice?: string[];
  devicePurchased?: string[];
  transcendUsage?: string[];
  gender?: string[];
  timeZones?: string[];
  [key: string]: string[] | undefined;
}

// ---------- /home-care/admin/markets ----------
export interface MarketSummary { total: number; providers: number; payers: number }
export interface MarketRow { country: string; providers: number; payers: number }
export interface MarketsResponse { summary: MarketSummary; markets: MarketRow[] }
