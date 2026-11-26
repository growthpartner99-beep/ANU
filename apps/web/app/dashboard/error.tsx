"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardState } from "@/components/dashboard/dashboard-state";

export default function DashboardError() {
  return (
    <DashboardShell>
      <DashboardState status="error" />
    </DashboardShell>
  );
}
