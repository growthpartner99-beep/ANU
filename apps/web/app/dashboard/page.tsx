import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardState } from "@/components/dashboard/dashboard-state";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardState
        status="empty"
        title="Your dashboard is ready"
        description="Projects, knowledge, conversations, customize and billing are coming soon."
      />
    </DashboardShell>
  );
}
