"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { insforge } from "@/lib/insforge-client";

export function SignOutButton() {
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

    router.replace("/login");
    router.refresh();
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
