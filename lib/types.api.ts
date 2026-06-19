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
