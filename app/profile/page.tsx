import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { requireUser } from "@/lib/auth";
import { createInsforgeServer } from "@/lib/insforge-server";
import { normalizeProfileRow } from "@/lib/profile";

export default async function ProfilePage() {
  const user = await requireUser();
  const insforge = await createInsforgeServer();
  const { data: profileRow, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[ProfilePage] Unable to load profile", error);
  }

  const profile = normalizeProfileRow(error ? null : profileRow, user);

  return (
    <ProfilePageContent
      userId={user.id}
      userEmail={user.email}
      userName={user.profile?.name}
      profile={profile}
    />
  );
}
