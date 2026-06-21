import { RouteLoadingShell } from "@/components/loading/RouteLoadingShell";

export default function DashboardLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Workspace"
      title="Loading dashboard"
      description="Gathering profile progress, active jobs, and recent application activity."
      variant="dashboard"
    />
  );
}
