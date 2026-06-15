import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function DashboardNavbar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="relative mx-auto flex h-20 w-full items-center justify-between px-10">
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
        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-12 md:flex"
        >
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-20 items-center text-[14px] font-medium leading-5 transition-colors ${
                  isActive ? "text-text-primary" : "text-text-dark hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/profile"
            aria-label="Open profile"
            className="job-details-user-button"
          >
            <span aria-hidden="true" className="job-details-user-icon" />
          </Link>
          <SignOutButton variant="nav" />
        </div>
      </div>
    </header>
  );
}
