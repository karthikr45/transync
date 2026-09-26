import { apiFetch, qs } from "@/lib/http/client";
import type {
  LoginDto,
  LoginResult,
  RegisterDto,
  AccountUser,
  DeviceUsersQuery,
  DeviceUsersResult,
  ClaimedDevicesResponse,
  ComplianceReportDto,
  ComplianceReportResult,
  MarketsResponse,
  AdminDashboardResult,
  AdminActivityResult,
  AdminActivityQuery,
  AdminClientsResult,
  AdminClientsQuery,
  AdminSuspendDto,
  AdminPatientsQuery,
  AdminPatientsResult,
  AdminSuspendResult,
  AdminReinstateResult,
  IncomingSharesResponse,
  SharedReportDto,
  ProviderDashboardResult,
  ProviderWorklistResult,
  ProviderWorklistQuery,
  ProviderReportsResult,
  ProviderReportsQuery,
} from "@/lib/types.api";

export const homeCareApi = {
  register: (dto: RegisterDto) =>
    apiFetch<AccountUser>("/home-care/register", {
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
    }),
  login: (dto: LoginDto) =>
    apiFetch<LoginResult>("/home-care/portal/login", {
      method: "POST",
      body: JSON.stringify(dto),
      _skipAuth: true,
      _skipAuthRedirect: true,
    }),

  listPending: () => apiFetch<AccountUser[]>("/home-care/pending"),
  approve: (id: string) => apiFetch<AccountUser>(`/home-care/approve/${id}`, { method: "POST" }),
  reject: (id: string, reason?: string) =>
    apiFetch<AccountUser>(`/home-care/reject/${id}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  listDevices: () => apiFetch<ClaimedDevicesResponse>("/home-care/devices/list"),
  listDeviceUsers: (query: DeviceUsersQuery = {}) =>
    apiFetch<DeviceUsersResult>(
      `/home-care/devices/users${qs(query as unknown as Record<string, unknown>)}`,
    ),
  complianceReport: (dto: ComplianceReportDto) =>
    apiFetch<ComplianceReportResult>("/home-care/devices/compliance-report", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // Provider console
  providerDashboard: () => apiFetch<ProviderDashboardResult>("/home-care/provider/dashboard"),
  providerWorklist: (query: ProviderWorklistQuery = {}) =>
    apiFetch<ProviderWorklistResult>(
      `/home-care/provider/worklist${qs(query as unknown as Record<string, unknown>)}`,
    ),
  providerReports: (query: ProviderReportsQuery = {}) =>
    apiFetch<ProviderReportsResult>(
      `/home-care/provider/reports${qs(query as unknown as Record<string, unknown>)}`,
    ),

  // Admin
  markets: () => apiFetch<MarketsResponse>("/home-care/admin/markets"),
  adminDashboard: () => apiFetch<AdminDashboardResult>("/home-care/admin/dashboard"),
  adminRecentActivity: (query: AdminActivityQuery = {}) =>
    apiFetch<AdminActivityResult>(
      `/home-care/admin/recent-activity${qs(query as unknown as Record<string, unknown>)}`,
    ),
  adminPatients: (query: AdminPatientsQuery = {}) =>
    apiFetch<AdminPatientsResult>(
      `/home-care/admin/patients${qs(query as unknown as Record<string, unknown>)}`,
    ),
  adminClients: (query: AdminClientsQuery = {}) =>
    apiFetch<AdminClientsResult>(
      `/home-care/admin/clients${qs(query as unknown as Record<string, unknown>)}`,
    ),
  adminSuspendClient: (id: string, dto: AdminSuspendDto = {}) =>
    apiFetch<AdminSuspendResult>(`/home-care/admin/clients/${encodeURIComponent(id)}/suspend`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  adminReinstateClient: (id: string) =>
    apiFetch<AdminReinstateResult>(`/home-care/admin/clients/${encodeURIComponent(id)}/reinstate`, {
      method: "POST",
    }),

  // Recipient-side data sharing (provider/monitor sees patient grants)
  listIncomingShares: () => apiFetch<IncomingSharesResponse>("/home-care/shares/incoming"),
  acceptShare: (id: string) =>
    apiFetch<{ id: string; status: string }>(`/home-care/shares/${encodeURIComponent(id)}/accept`, {
      method: "POST",
    }),
  declineShare: (id: string) =>
    apiFetch<{ id: string; status: string }>(
      `/home-care/shares/${encodeURIComponent(id)}/decline`,
      { method: "POST" },
    ),
  sharedReport: (id: string, dto: SharedReportDto) =>
    apiFetch<ComplianceReportResult>(`/home-care/shares/${encodeURIComponent(id)}/report`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};

// ---------- End User endpoints ----------
