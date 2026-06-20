"use client";

import type { ButtonHTMLAttributes } from "react";

type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-checked" | "role"
> & {
  checked: boolean;
};

export function Switch({
  checked,
  className = "",
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-surface-secondary transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:bg-accent ${className}`}
      data-state={checked ? "checked" : "unchecked"}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-surface shadow-[0_2px_6px_color-mix(in_srgb,var(--color-overlay)_16%,transparent)] transition-transform data-[state=checked]:translate-x-5"
        data-state={checked ? "checked" : "unchecked"}
      />
    </button>
  );
}
