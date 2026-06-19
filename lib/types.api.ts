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
