import { RouteLoadingShell } from "@/components/loading/RouteLoadingShell";

export default function FindJobsLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Discovery"
      title="Loading matched roles"
      description="Preparing the search controls, saved results, and comparison-ready job list."
      variant="jobs"
    />
  );
}
