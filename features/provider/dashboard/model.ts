import type { ComplianceStatus } from "@/lib/types.api";
export const STATUS_UI: Record<ComplianceStatus, "compliant" | "at-risk" | "non-compliant"> = {
  compliant: "compliant",
  at_risk: "at-risk",
  non_compliant: "non-compliant",
};
