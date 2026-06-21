import { RouteLoadingShell } from "@/components/loading/RouteLoadingShell";

export default function CompareLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Comparison"
      title="Loading comparison"
      description="Arranging selected roles, match context, and decision notes."
      variant="compare"
    />
  );
}
