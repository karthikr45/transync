// Client API. Every call goes through our same-origin Next.js Route
// Handlers; tokens never reach the browser. The proxy refreshes silently
// on 401, and on 401 here we redirect to /login.

import type {
  ApiEnvelope, RegisterDto, AccountUser,
  DeviceUploadDto, DeviceUploadResult, DeviceUsersQuery, DeviceUsersResult,
  ComplianceReportDto, ComplianceReportResult,
  SignUpOtpDto, ValidateOtpDto, CreateUserDto, EndUser,
  LastSyncQuery, LastSyncResult, SessionQuery, DataBySessionResult,
  ReportBySessionQuery, ReportBySessionResult,
} from "./types.api";

export class ApiError extends Error {
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
  constructor(message: string, statusCode: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

type ErrorBody = {
  statusCode?: number;
  error?: string;
  message?: unknown;
  status?: string;
};

function parseErrorMessage(body: ErrorBody | null, fallback: string) {
  if (!body) return { message: fallback };
  if (body.error === "Validation Failed" && body.message && typeof body.message === "object") {
    const fields = body.message as Record<string, string[]>;
    const first = Object.values(fields).flat()[0];
    return { message: first ?? "Validation failed", fields };
  }
  if (typeof body.message === "string") return { message: body.message };
  return { message: fallback };
}

function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

type FetchOpts = RequestInit & { _skipAuthRedirect?: boolean };

async function clientFetch<T>(path: string, init: FetchOpts = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Network error — could not reach the server.", 0);
  }

  let body: unknown = null;
  try { body = await res.json(); } catch { /* empty */ }

  if (res.status === 401) {
    if (!init._skipAuthRedirect && typeof window !== "undefined" && /^\/(provider|monitor|admin|patient)\//.test(window.location.pathname)) {
      const here = window.location.pathname + window.location.search;
      window.location.assign(`/login?next=${encodeURIComponent(here)}`);
    }
    const { message } = parseErrorMessage(body as ErrorBody, "Session expired.");
    throw new ApiError(message, 401);
  }

  if (!res.ok) {
    const { message, fields } = parseErrorMessage(body as ErrorBody, res.statusText || "Request failed");
    const code = (body as ErrorBody)?.statusCode ?? res.status;
    throw new ApiError(message, code, fields);
  }

  if (body && typeof body === "object" && "status" in body) {
    const env = body as ApiEnvelope<T>;
    if (env.status === "Failure" || env.status === "Error") {
      throw new ApiError(env.message || "Request failed", env.statusCode ?? 400);
    }
    return env.result;
  }
  return body as T;
}

function proxyGet<T>(path: string) {
  return clientFetch<T>(`/api/proxy${path}`, { method: "GET" });
}
function proxyPost<T>(path: string, body?: unknown) {
  return clientFetch<T>(`/api/proxy${path}`, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// ---------- Home Care ----------

export const homeCareApi = {
  register: (dto: RegisterDto) =>
    clientFetch<AccountUser>("/api/auth/register/home-care", { method: "POST", body: JSON.stringify(dto), _skipAuthRedirect: true }),

  login: (dto: { email: string; password: string }) =>
    clientFetch<{ user: AccountUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ kind: "home-care", ...dto }),
      _skipAuthRedirect: true,
    }),

  listPending: () => proxyGet<AccountUser[]>("/home-care/pending"),
  approve: (id: string) => proxyPost<AccountUser>(`/home-care/approve/${id}`),
  reject: (id: string, reason?: string) => proxyPost<AccountUser>(`/home-care/reject/${id}`, { reason }),

  uploadDevices: (dto: DeviceUploadDto) =>
    proxyPost<DeviceUploadResult>("/home-care/devices/upload", dto),
  listDeviceUsers: (query: DeviceUsersQuery = {}) =>
    proxyGet<DeviceUsersResult>(`/home-care/devices/users${qs(query as unknown as Record<string, unknown>)}`),
  complianceReport: (dto: ComplianceReportDto) =>
    proxyPost<ComplianceReportResult>("/home-care/devices/compliance-report", dto),
};

// ---------- End User ----------

export const endUserApi = {
  signUpOtp: (dto: SignUpOtpDto) =>
    clientFetch<null>("/api/auth/register/patient/otp", { method: "POST", body: JSON.stringify(dto), _skipAuthRedirect: true }),
  validateOtp: (dto: ValidateOtpDto) =>
    clientFetch<boolean>("/api/auth/register/patient/verify", { method: "POST", body: JSON.stringify(dto), _skipAuthRedirect: true }),
  createUser: (dto: CreateUserDto) =>
    clientFetch<{ user: EndUser }>("/api/auth/register/patient/create", { method: "POST", body: JSON.stringify(dto), _skipAuthRedirect: true }),
  login: (dto: { email: string; password: string }) =>
    clientFetch<{ user: EndUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ kind: "end-user", ...dto }),
      _skipAuthRedirect: true,
    }),

  getLastSyncDate: (q: LastSyncQuery) =>
    proxyGet<LastSyncResult>(`/event/getLastSyncDate${qs(q as unknown as Record<string, unknown>)}`),
  getDataBySession: (q: SessionQuery) =>
    proxyGet<DataBySessionResult>(`/event/getDataBySession${qs(q as unknown as Record<string, unknown>)}`),
  reportBySession: (q: ReportBySessionQuery) =>
    proxyGet<ReportBySessionResult>(`/event/reportBySession${qs(q as unknown as Record<string, unknown>)}`),
};
