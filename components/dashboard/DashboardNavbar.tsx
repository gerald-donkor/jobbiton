import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function DashboardNavbar() {
  return (
    <>
      <header className="navbar-glass fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex min-h-20 w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-x-4 lg:gap-y-3 lg:px-10">
          <div className="min-w-0 shrink-0">
            <BrandLogo />
          </div>
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:order-none lg:w-auto lg:justify-center lg:gap-12 lg:overflow-visible lg:pb-0"
          >
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-[14px] font-medium leading-5 transition-colors lg:h-20 lg:rounded-none lg:px-0 ${
                    isActive
                      ? "bg-accent-muted text-accent lg:bg-transparent lg:text-text-primary"
                      : "text-text-dark hover:bg-surface-secondary hover:text-accent lg:hover:bg-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex min-w-0 max-w-[58vw] items-center justify-end gap-2 sm:max-w-none sm:gap-3 lg:gap-6">
            <ThemeToggle />
            <Link
              href="/profile"
              aria-label="Open profile"
              className="job-details-user-button hidden lg:inline-flex"
            >
              <span aria-hidden="true" className="job-details-user-icon" />
            </Link>
            <div className="min-w-0">
              <SignOutButton variant="nav" />
            </div>
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="navbar-glass-spacer h-[120px] lg:h-20" />
    </>
  );
}
