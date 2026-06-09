import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { ConnectedAccountsSection } from "@/components/profile/ConnectedAccountsSection";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ProfileInformationForm } from "@/components/profile/ProfileInformationForm";
import { ResumeSection } from "@/components/profile/ResumeSection";

type ProfilePageContentProps = {
  userId: string;
  userEmail: string;
  userName?: string | null;
};

export function ProfilePageContent({
  userId,
  userEmail,
  userName,
}: ProfilePageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] border-x border-border bg-background px-6 py-8 text-text-primary">
        <div className="mx-auto flex w-full max-w-[692px] flex-col gap-6">
          <ProfileAttentionBanner />
          <ConnectedAccountsSection />
          <ResumeSection />
          <ProfileInformationForm />
        </div>
      </main>
    </div>
  );
}
