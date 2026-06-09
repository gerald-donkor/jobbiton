import { ProtectedShell } from "@/components/protected/ProtectedShell";
import { requireUser } from "@/lib/auth";

export default async function FindJobsPage() {
  const user = await requireUser();

  return <ProtectedShell title="Find Jobs" userId={user.id} userEmail={user.email} userName={user.profile?.name} />;
}
