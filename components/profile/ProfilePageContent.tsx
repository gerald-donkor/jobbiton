import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Navbar } from "@/components/layout/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
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
    <div className="min-h-screen bg-background/68">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar
        activeHref="/profile"
        ctaSlot={<SignOutButton variant="profileNav" />}
      />
      <PageIntro
        eyebrow="Profile launchpad"
        title="One profile powers the whole search."
        copy="Set the source of truth once, then let extraction, resume generation, job matching, and company research reuse it across the product."
      />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-background/56 px-4 py-6 text-text-primary backdrop-blur-[2px] sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[940px] flex-col gap-6">
          <Reveal>
            <ProfileEditor profile={profile} />
          </Reveal>
        </div>
      </main>
    </div>
  );
}
