import type { ClientStatus, UserType } from "@/lib/types.api";
export type TypeFilter = "all" | UserType;

export type StatusFilter = "all" | ClientStatus;

export const PAGE_SIZE = 25;

export const TYPE_LABEL: Record<UserType, string> = {
  home_care_provider: "Homecare Provider",
  authorized_monitor: "Authorized Monitor",
};

export const STATUS_LABEL: Record<ClientStatus, string> = {
  pending: "Pending",
  approved: "Active",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const STATUS_BADGE: Record<ClientStatus, string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
  suspended: "badge-red",
};
