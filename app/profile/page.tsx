import { ProtectedShell } from "@/components/protected/ProtectedShell";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return <ProtectedShell title="Profile" userId={user.id} userEmail={user.email} userName={user.profile?.name} />;
}
