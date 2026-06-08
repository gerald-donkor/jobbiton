import { ProtectedShell } from "@/components/protected/ProtectedShell";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return <ProtectedShell title="Dashboard" userEmail={user.email} />;
}
