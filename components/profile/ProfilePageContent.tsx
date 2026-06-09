import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import type { ProfileValues } from "@/lib/profile";

type ProfilePageContentProps = {
  userId: string;
  userEmail: string;
  userName?: string | null;
  profile: ProfileValues;
};

export function ProfilePageContent({
  userId,
  userEmail,
  userName,
  profile,
}: ProfilePageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-background px-6 py-8 text-text-primary">
        <div className="mx-auto flex w-full max-w-[940px] flex-col gap-6">
          <ProfileEditor profile={profile} />
        </div>
      </main>
    </div>
  );
}
