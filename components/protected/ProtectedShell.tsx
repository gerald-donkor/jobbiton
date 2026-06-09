import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type ProtectedShellProps = {
  title: string;
  userId: string;
  userEmail: string;
  userName?: string | null;
};

export function ProtectedShell({ title, userId, userEmail, userName }: ProtectedShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-224px)] w-full max-w-[1440px] items-center justify-center border-x border-border bg-background px-6 py-16 text-text-primary">
        <section className="w-full max-w-[560px] rounded-md border border-border bg-surface px-6 py-7 shadow-[0_20px_50px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] sm:px-8">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">Authenticated</p>
          <h1 className="text-[32px] font-semibold leading-10 text-text-primary">{title}</h1>
          <p className="mt-3 text-[15px] leading-6 text-text-secondary">{userEmail}</p>
          <div className="mt-8">
            <SignOutButton />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
