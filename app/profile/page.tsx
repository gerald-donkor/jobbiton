import { ProtectedShell } from "@/components/protected/ProtectedShell";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return <ProtectedShell title="Profile" userEmail={user.email} />;
}
