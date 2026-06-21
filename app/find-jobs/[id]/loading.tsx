import { RouteLoadingShell } from "@/components/loading/RouteLoadingShell";

export default function JobDetailsLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Role details"
      title="Opening job details"
      description="Loading the role summary, workflow, company context, and application tools."
      variant="details"
    />
  );
}
