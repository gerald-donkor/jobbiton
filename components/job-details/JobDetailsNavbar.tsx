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
    <>
      <header className="navbar-glass fixed inset-x-0 top-0 z-50">
        <PostHogIdentify userId={userId} email={userEmail} name={userName} />
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-x-4 lg:gap-y-3">
          <div className="min-w-0 shrink-0">
            <BrandLogo />
          </div>
          <div className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-8">
            <nav
              aria-label="Main navigation"
              className="order-3 flex w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:order-none lg:w-auto lg:gap-8 lg:overflow-visible lg:pb-0"
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
            <div className="flex min-w-0 items-center justify-end gap-2 text-text-secondary sm:gap-3 lg:gap-5">
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
      <div aria-hidden="true" className="navbar-glass-spacer h-[120px] lg:h-16" />
    </>
  );
}
