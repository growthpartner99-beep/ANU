import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardState } from "@/components/dashboard/dashboard-state";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardState status="loading" />
    </DashboardShell>
  );
}
