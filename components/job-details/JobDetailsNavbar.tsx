import Link from "next/link";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/58 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)] backdrop-blur-xl">
      <PostHogIdentify userId={userId} email={userEmail} name={userName} />
      <div className="mx-auto flex min-h-16 w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
        <BrandLogo />
        <div className="contents lg:flex lg:items-center lg:gap-8">
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center gap-2 overflow-x-auto lg:order-none lg:w-auto lg:gap-8"
          >
            <Link
              href="/dashboard"
              className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-[14px] font-medium leading-5 text-text-dark transition-colors hover:bg-surface-secondary hover:text-accent lg:h-auto lg:rounded-none lg:px-0 lg:hover:bg-transparent"
            >
              Dashboard
            </Link>
            <Link
              href="/find-jobs"
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-accent-muted px-3 text-[14px] font-medium leading-5 text-accent lg:h-auto lg:bg-transparent lg:px-0"
            >
              Find Jobs
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-[14px] font-medium leading-5 text-text-dark transition-colors hover:bg-surface-secondary hover:text-accent lg:h-auto lg:rounded-none lg:px-0 lg:hover:bg-transparent"
            >
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-text-secondary sm:gap-5">
            <ThemeToggle />
            <span aria-hidden="true" className="job-details-user-control hidden lg:inline-flex">
              <span className="job-details-user-icon" />
            </span>
            <div className="hidden lg:block">
              <SignOutButton variant="nav" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
