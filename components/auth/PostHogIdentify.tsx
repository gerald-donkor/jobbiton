"use client";

import { useEffect } from "react";
import { posthog } from "@/lib/posthog-client";

type PostHogIdentifyProps = {
  userId: string;
  email: string;
  name?: string | null;
};

export function PostHogIdentify({ userId, email, name }: PostHogIdentifyProps) {
  useEffect(() => {
    posthog.identify(userId, {
      email,
      ...(name ? { name } : {}),
    });
  }, [userId, email, name]);

  return null;
}
