import type { RecipientType, Share } from "@/lib/types.api";
export const TYPE_LABEL: Record<RecipientType, string> = {
  home_care_provider: "Homecare Provider",
  authorized_monitor: "Authorized Monitor",
};

export function badgeFor(status: Share["status"]): string {
  switch (status) {
    case "accepted":
      return "badge-green";
    case "pending":
      return "badge-amber";
    case "declined":
    case "revoked":
      return "badge-slate";
  }
}
