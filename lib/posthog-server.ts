import { PostHog } from "posthog-node";
import type { PostHogEvent } from "@/lib/posthog-events";

export function createPostHogServer(): PostHog {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogServerEvent(event: PostHogEvent): Promise<void> {
  const posthog = createPostHogServer();

  try {
    posthog.capture({
      distinctId: event.distinctId,
      event: event.name,
      properties: event.properties,
    });
  } finally {
    await posthog.shutdown();
  }
}
