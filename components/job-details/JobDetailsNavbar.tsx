import Image from "next/image";
import Link from "next/link";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { SignOutButton } from "@/components/auth/SignOutButton";

type JobDetailsNavbarProps = {
  userId: string;
  userEmail: string;
  userName?: string | null;
};

export function JobDetailsNavbar({
  userId,
  userEmail,
  userName,
}: JobDetailsNavbarProps) {
  return (
    <header className="border-b border-border bg-surface">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6">
        <Link
          href="/"
          aria-label="JobPilot home"
          className="inline-flex items-center"
        >
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={148}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center gap-8">
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 md:flex"
          >
            <Link
              href="/dashboard"
              className="text-[14px] font-medium leading-5 text-text-dark transition-colors hover:text-accent"
            >
              Dashboard
            </Link>
            <Link
              href="/find-jobs"
              className="text-[14px] font-medium leading-5 text-accent"
            >
              Find Jobs
            </Link>
            <Link
              href="/profile"
              className="text-[14px] font-medium leading-5 text-text-dark transition-colors hover:text-accent"
            >
              Profile
            </Link>
          </nav>
          <div className="hidden items-center gap-5 text-text-secondary sm:flex">
            <span aria-hidden="true" className="job-details-user-control">
              <span className="job-details-user-icon" />
            </span>
            <SignOutButton variant="nav" />
          </div>
        </div>
      </div>
    </header>
  );
}
