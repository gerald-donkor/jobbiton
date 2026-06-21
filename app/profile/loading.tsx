import { RouteLoadingShell } from "@/components/loading/RouteLoadingShell";

export default function ProfileLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Profile"
      title="Loading profile"
      description="Preparing your saved profile, resume tools, and preference fields."
      variant="profile"
    />
  );
}
