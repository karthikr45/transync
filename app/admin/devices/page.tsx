// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
import WorkflowDirectory from "@/features/device-management/components/workflow-directory";

export default function Page() {
  return <WorkflowDirectory area="registry" mode="admin" />;
}
