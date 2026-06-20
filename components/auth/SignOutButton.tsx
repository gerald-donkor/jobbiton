"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      <Button
        onClick={handleSignOut}
        disabled={isPending}
        loading={isPending}
        loadingLabel="Signing out..."
        variant="nav"
        size="sm"
        className="px-0"
      >
        <span aria-hidden="true" className="job-details-signout-icon" />
        Sign out
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      loading={isPending}
      loadingLabel="Signing out..."
      variant="secondary"
      size="sm"
    >
      Sign out
    </Button>
  );
}
