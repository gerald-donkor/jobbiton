import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <ProfilePageContent
      userId={user.id}
      userEmail={user.email}
      userName={user.profile?.name}
    />
  );
}
