"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandName } from "@/components/layout/BrandLogo";
import { ProcessOverlay } from "@/components/loading/ProcessOverlay";
import { Button } from "@/components/ui/button";

type AuthProvider = "google" | "github";

const providers: Array<{
  id: AuthProvider;
  label: string;
}> = [
  {
    id: "google",
    label: "Continue with Google",
  },
  {
    id: "github",
    label: "Continue with GitHub",
  },
];

// Official brand marks. The Google "G" is locked to its trademarked palette,
// which is why these are the one place raw color values are allowed.
function ProviderIcon({ provider }: { provider: AuthProvider }) {
  if (provider === "google") {
    return (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17Z" />
        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z" />
        <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z" />
        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-4 text-text-primary" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function getAuthErrorMessage(error: string | null): string | null {
  if (!error) {
    return null;
  }

  if (error === "oauth_start" || error === "oauth_provider") {
    return "We could not start that sign-in method. Please try again.";
  }

  if (error === "oauth" || error === "oauth_callback") {
    return "The provider could not complete sign in. Please try again.";
  }

  return "We could not save your sign-in session. Please try again.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
  const callbackError = getAuthErrorMessage(searchParams.get("error"));
  const [errorMessage, setErrorMessage] = useState<string | null>(callbackError);
  const nextPath = searchParams.get("next");

  function handleOAuth(provider: AuthProvider) {
    setPendingProvider(provider);
    setErrorMessage(null);
    const oauthUrl = new URL("/api/auth/oauth/start", window.location.origin);
    oauthUrl.searchParams.set("provider", provider);

    if (nextPath) {
      oauthUrl.searchParams.set("next", nextPath);
    }

    window.location.assign(oauthUrl.toString());
  }

  return (
    <section className="relative grid w-full max-w-[760px] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_14px_30px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] md:grid-cols-[1.08fr_0.92fr]">
      <ProcessOverlay
        active={pendingProvider !== null}
        variant="auth"
        title="Opening secure sign in"
        description={`Connecting to ${
          pendingProvider === "github" ? "GitHub" : "Google"
        } and preparing your session.`}
        steps={[
          {
            title: "Starting OAuth",
            detail: "Creating the secure provider request.",
          },
          {
            title: "Opening provider",
            detail: "Handing you off to the selected sign-in provider.",
          },
          {
            title: "Securing session",
            detail: "Preparing the callback that stores your app session.",
          },
        ]}
      />
      <div className="soft-gradient-panel flex min-h-[340px] flex-col justify-between border-b border-border px-5 py-7 sm:px-8 sm:py-8 md:min-h-[420px] md:border-r md:border-b-0 md:px-10">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium leading-4 text-text-secondary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)]">
            <svg aria-hidden="true" className="size-3.5 text-accent" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.25 12.5 4v3.75c0 2.4-1.7 4.7-4.5 6-2.8-1.3-4.5-3.6-4.5-6V4L8 2.25Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
              <path d="m6.2 8 1.2 1.2 2.4-2.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            </svg>
            OAuth secured by InsForge
          </div>
          <h1 className="max-w-[350px] text-[36px] font-bold leading-[1.02] text-text-slate sm:text-[44px] md:text-[48px] md:leading-[0.98]">
            Sign in and let the agent prep your next application.
          </h1>
          <p className="mt-6 max-w-[350px] text-[15px] leading-6 text-text-secondary">
            Connect with Google or GitHub to start building your profile, matching jobs, and creating tailored application materials.
          </p>
        </div>
      </div>

      <div className="flex min-h-[320px] items-center px-5 py-8 sm:px-8 sm:py-10 md:min-h-[420px] md:px-8">
        <div className="w-full">
          <p className="text-[12px] font-medium leading-5 text-text-secondary">Welcome to</p>
          <h2 className="mt-1 text-[24px] font-semibold leading-8 text-text-primary">
            <BrandName />
          </h2>
          <p className="mt-3 text-[13px] leading-5 text-text-secondary">
            Choose your preferred provider to continue.
          </p>

          {errorMessage ? (
            <p className="mt-5 rounded-md border border-error bg-surface px-4 py-3 text-[13px] font-medium leading-5 text-error">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-6 space-y-3">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                onClick={() => handleOAuth(provider.id)}
                disabled={pendingProvider !== null}
                loading={pendingProvider === provider.id}
                loadingLabel="Opening..."
                variant="secondary"
                size="md"
                className="w-full gap-3"
              >
                <ProviderIcon provider={provider.id} />
                {provider.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
