import type { ShareStatus } from "@/lib/types.api";
export function badgeFor(status: ShareStatus): string {
  switch (status) {
    case "accepted":
      return "badge-green";
    case "pending":
      return "badge-amber";
    case "declined":
      return "badge-red";
    case "revoked":
      return "badge-slate";
  }
}
