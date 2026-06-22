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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/58 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-10">
        <BrandLogo />
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-2 overflow-x-auto lg:order-none lg:w-auto lg:justify-center lg:gap-12"
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
        <div className="flex items-center gap-3 lg:gap-6">
          <ThemeToggle />
          <Link
            href="/profile"
            aria-label="Open profile"
            className="job-details-user-button hidden lg:inline-flex"
          >
            <span aria-hidden="true" className="job-details-user-icon" />
          </Link>
          <div className="hidden lg:block">
            <SignOutButton variant="nav" />
          </div>
        </div>
      </div>
    </header>
  );
}
