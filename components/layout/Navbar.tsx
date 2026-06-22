import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Find Jobs", href: "/find-jobs", icon: "search" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

type NavbarProps = {
  activeHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  showNavIcons?: boolean;
  showCta?: boolean;
};

export function Navbar({
  activeHref,
  ctaHref = "/login",
  ctaLabel = "Start for free",
  showNavIcons = false,
  showCta = true,
}: NavbarProps) {
  return (
    <>
      <header className="navbar-glass fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
          <BrandLogo />
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center gap-2 overflow-x-auto lg:order-none lg:w-auto lg:justify-center lg:gap-12"
          >
            {navItems.map((item) => {
              const isActive = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-[14px] font-medium leading-5 transition-colors lg:h-16 lg:rounded-none lg:px-0 ${
                    isActive
                      ? "bg-accent-muted text-accent lg:bg-transparent"
                      : "text-text-dark hover:bg-surface-secondary hover:text-accent lg:hover:bg-transparent"
                  }`}
                >
                  {showNavIcons ? (
                    <span
                      aria-hidden="true"
                      className={`nav-icon nav-icon-${item.icon}`}
                    />
                  ) : null}
                  {item.label}
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 hidden h-0.5 bg-accent lg:block"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {showCta ? (
              <Link
                href={ctaHref}
                className="button-primary button-primary-sm px-3 sm:px-5"
              >
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="h-[105px] lg:h-16" />
    </>
  );
}
