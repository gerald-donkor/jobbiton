"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandName } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";

type AuthProvider = "google" | "github";

const providers: Array<{
  id: AuthProvider;
  label: string;
  mark: "globe" | "branch";
}> = [
  {
    id: "google",
    label: "Continue with Google",
    mark: "globe",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    mark: "branch",
  },
];

function ProviderIcon({ mark }: { mark: "globe" | "branch" }) {
  if (mark === "globe") {
    return (
      <svg aria-hidden="true" className="size-4 text-accent" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 10h13M10 3.5c1.7 1.8 2.6 4 2.6 6.5s-.9 4.7-2.6 6.5M10 3.5C8.3 5.3 7.4 7.5 7.4 10s.9 4.7 2.6 6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-4 text-text-primary" viewBox="0 0 20 20" fill="none">
      <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14" cy="15" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 7v3.5c0 1.4 1.1 2.5 2.5 2.5H12M10 4h2.5C14 4 15 5 15 6.5V13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
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
    <section className="grid w-full max-w-[760px] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_14px_30px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] md:grid-cols-[1.08fr_0.92fr]">
      <div className="soft-gradient-panel flex min-h-[420px] flex-col justify-between border-b border-border px-8 py-8 md:border-r md:border-b-0 md:px-10">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium leading-4 text-text-secondary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_5%,transparent)]">
            <svg aria-hidden="true" className="size-3.5 text-accent" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.25 12.5 4v3.75c0 2.4-1.7 4.7-4.5 6-2.8-1.3-4.5-3.6-4.5-6V4L8 2.25Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
              <path d="m6.2 8 1.2 1.2 2.4-2.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            </svg>
            OAuth secured by InsForge
          </div>
          <h1 className="max-w-[350px] text-[44px] font-bold leading-[0.98] text-text-slate md:text-[48px]">
            Sign in and let the agent prep your next application.
          </h1>
          <p className="mt-6 max-w-[350px] text-[15px] leading-6 text-text-secondary">
            Connect with Google or GitHub to start building your profile, matching jobs, and creating tailored application materials.
          </p>
        </div>
        <p className="mt-8 text-[12px] leading-5 text-text-secondary">
          New users are routed to profile setup after sign-in.
        </p>
      </div>

      <div className="flex min-h-[420px] items-center px-8 py-10 md:px-8">
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
                <ProviderIcon mark={provider.mark} />
                {provider.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
