import { apiFetch, qs } from "@/lib/http/client";
import type {
  SignUpOtpDto,
  ValidateOtpDto,
  CreateUserDto,
  EndUserLoginDto,
  EndUser,
  LastSyncQuery,
  LastSyncResult,
  SessionQuery,
  DataBySessionResult,
  ReportBySessionQuery,
  ReportBySessionResult,
  BarChartResponse,
  SleepScoreEventDto,
  TotalRuntimeDto,
  GeneratePdfDto,
  ParameterQuery,
  ParameterResult,
  MetadataResponse,
  RecipientType,
  ShareRecipientsResponse,
  CreateShareDto,
  Share,
  MySharesResponse,
  DeleteAccountDto,
  DeleteAccountResult,
} from "@/lib/types.api";

export const endUserApi = {
  signUpOtp: (dto: SignUpOtpDto) =>
    apiFetch<null>("/auth/signUp-otp", {
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
    }),
  validateOtp: (dto: ValidateOtpDto) =>
    apiFetch<boolean>("/auth/validate-otp", {
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
    }),
  createUser: (dto: CreateUserDto) =>
    apiFetch<EndUser>("/users/create-user", {
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
    }),
  login: (dto: EndUserLoginDto) =>
    apiFetch<EndUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
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
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
    }),

  // Public signup metadata (occupations, CPAP usage options etc.)
  getMetadata: () =>
    apiFetch<MetadataResponse>("/metadata", { _skipAuth: true, _skipAuthRedirect: true }),

  getLastSyncDate: (q: LastSyncQuery) =>
    apiFetch<LastSyncResult>(
      `/event/getLastSyncDate${qs(q as unknown as Record<string, unknown>)}`,
    ),
  getDataBySession: (q: SessionQuery) =>
    apiFetch<DataBySessionResult>(
      `/event/getDataBySession${qs(q as unknown as Record<string, unknown>)}`,
    ),
  reportBySession: (q: ReportBySessionQuery) =>
    apiFetch<ReportBySessionResult>(
      `/event/reportBySession${qs(q as unknown as Record<string, unknown>)}`,
    ),

  // Bar-chart trend endpoints (same SessionQuery shape as getDataBySession)
  getAverageTime: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(
      `/event/getAverageTime${qs(q as unknown as Record<string, unknown>)}`,
    ),
  getAverageLeak: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(
      `/event/getAverageLeak${qs(q as unknown as Record<string, unknown>)}`,
    ),
  getAverageAHI: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(
      `/event/getAverageAHI${qs(q as unknown as Record<string, unknown>)}`,
    ),
  getAverageSleepScore: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(
      `/event/getAverageSleepScore${qs(q as unknown as Record<string, unknown>)}`,
    ),
  getAverageMaskRemoved: (q: SessionQuery) =>
    apiFetch<BarChartResponse>(
      `/event/getAverageMaskRemoved${qs(q as unknown as Record<string, unknown>)}`,
    ),

  // Sleep-score breakdown + total run time
  getSleepScore: (q: SessionQuery) =>
    apiFetch<SleepScoreEventDto>(
      `/event/getSleepScore${qs(q as unknown as Record<string, unknown>)}`,
    ),
  getSessionSleepScore: (q: SessionQuery) =>
    apiFetch<SleepScoreEventDto>(
      `/event/getSessionSleepScore${qs(q as unknown as Record<string, unknown>)}`,
    ),
  totalRunningTime: (q: SessionQuery) =>
    apiFetch<TotalRuntimeDto>(
      `/event/totalRunningTime${qs(q as unknown as Record<string, unknown>)}`,
    ),

  // Device parameters / patient settings (powers the Settings section
  // of the patient compliance report).
  getParameter: (q: ParameterQuery) =>
    apiFetch<ParameterResult>(
      `/parameter/getByEmailAndDeviceId${qs(q as unknown as Record<string, unknown>)}`,
    ),

  // Server-side PDF generation for reportBySession. Returns a URL to the
  // generated PDF in blob storage (the API's result is the URL string,
  // not the file itself) — GET with query params, per the server's
  // /api-json spec.
  generatePdf: (dto: GeneratePdfDto): Promise<string> =>
    apiFetch<string>(`/event/generatePdf${qs(dto as unknown as Record<string, unknown>)}`),

  // Same payload shape, but the report includes the daily event log —
  // mirrors the mobile app's "download with daily log" option.
  getReportWithDailyLog: (dto: GeneratePdfDto): Promise<string> =>
    apiFetch<string>(
      `/event/getReportWithDailyLog${qs(dto as unknown as Record<string, unknown>)}`,
    ),
};
