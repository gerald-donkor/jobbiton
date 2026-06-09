import { ProtectedShell } from "@/components/protected/ProtectedShell";
import { requireUser } from "@/lib/auth";

export default async function JobDetailsPage() {
  const user = await requireUser();

  return <ProtectedShell title="Job Details" userId={user.id} userEmail={user.email} userName={user.profile?.name} />;
}
