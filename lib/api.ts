// Direct client → backend API. The browser calls API_BASE_URL directly
// from .env (NEXT_PUBLIC_API_BASE_URL). Bearer tokens come from
// localStorage via lib/auth.ts. On 401 we try a refresh once, then
// either retry or surface the error and redirect to /login.

import { API_BASE_URL } from "./env";
import { clearSession, getRefreshToken, getToken, getUserKind, setSession, getCurrentUser, getCurrentEndUser } from "./auth";
import type {
  ApiEnvelope, LoginDto, LoginResult, RegisterDto, AccountUser,
  DeviceUploadDto, DeviceUploadResult, DeviceUsersQuery, DeviceUsersResult,
  ClaimedDevicesResponse,
  ComplianceReportDto, ComplianceReportResult,
  SignUpOtpDto, ValidateOtpDto, CreateUserDto, EndUserLoginDto, EndUser,
  LastSyncQuery, LastSyncResult, SessionQuery, DataBySessionResult,
  ReportBySessionQuery, ReportBySessionResult, BarChartResponse,
  MetadataResponse, MarketsResponse,
  RecipientType, ShareRecipientsResponse, CreateShareDto, Share, MySharesResponse,
  DeleteAccountDto, DeleteAccountResult,
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

type ErrorBody = { statusCode?: number; error?: string; message?: unknown; status?: string };

function parseErrorMessage(body: ErrorBody | null, fallback: string): { message: string; fields?: Record<string, string[]> } {
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

// ---- Token refresh: at-most-once concurrent ----

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${refresh}`,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const body = (await res.json().catch(() => null)) as
      | { accessToken?: string }
      | { result?: { token?: string } }
      | null;
    let newToken: string | undefined;
    if (body && "accessToken" in body && typeof body.accessToken === "string") newToken = body.accessToken;
    else if (body && "result" in body && body.result && typeof body.result.token === "string") newToken = body.result.token;
    if (!newToken) return false;
    const kind = getUserKind();
    if (!kind) return false;
    const user = kind === "home-care" ? getCurrentUser() : getCurrentEndUser();
    if (!user) return false;
    setSession(newToken, refresh, user, kind);
    return true;
  } catch { return false; }
}

async function ensureRefresh(): Promise<boolean> {
  if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const here = window.location.pathname + window.location.search;
  if (/^\/(provider|monitor|admin|patient)\//.test(window.location.pathname)) {
    window.location.assign(`/login?next=${encodeURIComponent(here)}`);
  } else {
    window.location.assign("/login");
  }
}

type FetchOpts = RequestInit & { _retry?: boolean; _skipAuth?: boolean; _skipAuthRedirect?: boolean };

async function apiFetch<T>(path: string, init: FetchOpts = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError("API base URL is not configured.", 0);

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("ngrok-skip-browser-warning", "true");
  if (!init._skipAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new ApiError("Network error — could not reach the server.", 0);
  }

  if (res.status === 401 && !init._retry && !init._skipAuth) {
    const ok = await ensureRefresh();
    if (ok) return apiFetch<T>(path, { ...init, _retry: true });
    if (!init._skipAuthRedirect) { clearSession(); redirectToLogin(); }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  let body: unknown = null;
  try { body = await res.json(); } catch { /* empty */ }

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

// ---------- Home Care endpoints ----------

export const homeCareApi = {
  register: (dto: RegisterDto) =>
    apiFetch<AccountUser>("/home-care/register", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),
  login: (dto: LoginDto) =>
    apiFetch<LoginResult>("/home-care/login", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),

  listPending: () => apiFetch<AccountUser[]>("/home-care/pending"),
  approve: (id: string) => apiFetch<AccountUser>(`/home-care/approve/${id}`, { method: "POST" }),
  reject: (id: string, reason?: string) =>
    apiFetch<AccountUser>(`/home-care/reject/${id}`, { method: "POST", body: JSON.stringify({ reason }) }),

  uploadDevices: (dto: DeviceUploadDto) =>
    apiFetch<DeviceUploadResult>("/home-care/devices/upload", { method: "POST", body: JSON.stringify(dto) }),
  listDevices: () => apiFetch<ClaimedDevicesResponse>("/home-care/devices/list"),
  listDeviceUsers: (query: DeviceUsersQuery = {}) =>
    apiFetch<DeviceUsersResult>(`/home-care/devices/users${qs(query as unknown as Record<string, unknown>)}`),
  complianceReport: (dto: ComplianceReportDto) =>
    apiFetch<ComplianceReportResult>("/home-care/devices/compliance-report", { method: "POST", body: JSON.stringify(dto) }),

  // Admin
  markets: () => apiFetch<MarketsResponse>("/home-care/admin/markets"),
};

// ---------- End User endpoints ----------

export const endUserApi = {
  signUpOtp: (dto: SignUpOtpDto) =>
    apiFetch<null>("/auth/signUp-otp", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),
  validateOtp: (dto: ValidateOtpDto) =>
    apiFetch<boolean>("/auth/validate-otp", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),
  createUser: (dto: CreateUserDto) =>
    apiFetch<EndUser>("/users/create-user", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),
  login: (dto: EndUserLoginDto) =>
    apiFetch<EndUser>("/auth/login", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),
  getByEmail: (email: string) =>
    apiFetch<EndUser>(`/users/getByEmail/${encodeURIComponent(email)}`),

  // Patient → recipients / shares (uses end-user JWT)
  listShareRecipients: (type?: RecipientType) =>
    apiFetch<ShareRecipientsResponse>(`/home-care/share-recipients${qs({ type })}`),
  createShare: (dto: CreateShareDto) =>
    apiFetch<Share>("/home-care/shares", { method: "POST", body: JSON.stringify(dto) }),
  listMyShares: () => apiFetch<MySharesResponse>("/home-care/shares/mine"),
  revokeShare: (id: string) =>
    apiFetch<Share>(`/home-care/shares/${encodeURIComponent(id)}/revoke`, { method: "POST" }),

  // Account deletion (public per docs, but we have the email from the session)
  deleteAccount: (dto: DeleteAccountDto) =>
    apiFetch<DeleteAccountResult>("/users/delete-account", {
      method: "POST", body: JSON.stringify(dto), _skipAuth: true, _skipAuthRedirect: true,
    }),

  // Public signup metadata (occupations, CPAP usage options etc.)
  getMetadata: () =>
    apiFetch<MetadataResponse>("/metadata", { _skipAuth: true, _skipAuthRedirect: true }),

  getLastSyncDate: (q: LastSyncQuery) =>
    apiFetch<LastSyncResult>(`/event/getLastSyncDate${qs(q as unknown as Record<string, unknown>)}`),
  getDataBySession: (q: SessionQuery) =>
    apiFetch<DataBySessionResult>(`/event/getDataBySession${qs(q as unknown as Record<string, unknown>)}`),
  reportBySession: (q: ReportBySessionQuery) =>
    apiFetch<ReportBySessionResult>(`/event/reportBySession${qs(q as unknown as Record<string, unknown>)}`),

  // Bar-chart trend endpoints (same SessionQuery shape as getDataBySession)
  getAverageTime: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(`/event/getAverageTime${qs(q as unknown as Record<string, unknown>)}`),
  getAverageLeak: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(`/event/getAverageLeak${qs(q as unknown as Record<string, unknown>)}`),
  getAverageAHI: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(`/event/getAverageAHI${qs(q as unknown as Record<string, unknown>)}`),
  getAverageSleepScore: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(`/event/getAverageSleepScore${qs(q as unknown as Record<string, unknown>)}`),
  getAverageMaskRemoved: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(`/event/getAverageMaskRemoved${qs(q as unknown as Record<string, unknown>)}`),
};
