"use client";

import { useEffect } from "react";
import { initPostHog, posthog } from "@/lib/posthog-client";

type PostHogIdentifyProps = {
  userId: string;
  email: string;
  name?: string | null;
};

export function PostHogIdentify({ userId, email, name }: PostHogIdentifyProps) {
  useEffect(() => {
    initPostHog();
    posthog.identify(userId, {
      email,
      ...(name ? { name } : {}),
    });
  }, [userId, email, name]);

  return null;
}
