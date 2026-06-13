"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { insforge } from "@/lib/insforge-client";
import { posthog } from "@/lib/posthog-client";

type SignOutButtonProps = {
  variant?: "button" | "nav";
};

export function SignOutButton({ variant = "button" }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    const { error } = await insforge.auth.signOut();

    if (error) {
      console.error("[SignOutButton] Sign out failed", error);
      setIsPending(false);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session", {
      method: "DELETE",
    });

    if (!sessionResponse.ok) {
      console.error("[SignOutButton] Session cookie clear failed", await sessionResponse.text());
    }

    posthog.reset();
    router.replace("/login");
    router.refresh();
  }

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="inline-flex items-center gap-2 text-[14px] font-medium leading-5 text-text-secondary transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true" className="job-details-signout-icon" />
        {isPending ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="button-secondary button-primary-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
