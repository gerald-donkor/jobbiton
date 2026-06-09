import posthog from "posthog-js";
import type { PostHogEvent } from "@/lib/posthog-events";

let isPostHogInitialized = false;

export function initPostHog(): void {
  if (typeof window === "undefined" || isPostHogInitialized) {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogKey || !posthogHost) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[posthog-client] Missing PostHog environment variables");
    }
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
  });

  isPostHogInitialized = true;
}

export function capturePostHogEvent(event: PostHogEvent): void {
  initPostHog();
  posthog.capture(event.name, event.properties);
}

export { posthog };
