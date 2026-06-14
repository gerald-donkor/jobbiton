import Image from "next/image";
import Link from "next/link";

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
    <header className="border-b border-border bg-surface">
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
        <nav aria-label="Main navigation" className="hidden items-center gap-12 md:flex">
          {navItems.map((item) => {
            const isActive = item.href === activeHref;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative inline-flex h-16 items-center gap-2 text-[14px] font-medium leading-5 transition-colors ${
                  isActive ? "text-accent" : "text-text-dark hover:text-accent"
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
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
        {showCta ? (
          <Link
            href={ctaHref}
            className="button-primary button-primary-sm"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
