import { ComplianceStatus } from "@/lib/mock-data";

export default function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const map: Record<ComplianceStatus, { label: string; cls: string }> = {
    compliant: { label: "Compliant", cls: "badge-green" },
    "at-risk": { label: "At risk", cls: "badge-amber" },
    "non-compliant": { label: "Non-compliant", cls: "badge-red" },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
