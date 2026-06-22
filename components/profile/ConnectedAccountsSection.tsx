import type { LinkedInConnectionStatus } from "@/lib/linkedin-connection";

type ConnectedAccountsSectionProps = {
  connectedAt: string;
  connectHref: string;
  hasSavedLinkedInUrl: boolean;
  isPending: boolean;
  isSuccess: boolean;
  message: string;
  oauthConfigured: boolean;
  status: LinkedInConnectionStatus;
  onDisconnect: () => Promise<void>;
  onUseSavedProfile: () => Promise<void>;
};

function getStatusLabel(status: LinkedInConnectionStatus): string {
  switch (status) {
    case "oauth_connected":
      return "OAuth connected";
    case "profile_linked":
      return "Using saved profile URL";
    default:
      return "Not connected";
  }
}

function getStatusHint({
  connectedAt,
  oauthConfigured,
  status,
}: Pick<
  ConnectedAccountsSectionProps,
  "connectedAt" | "oauthConfigured" | "status"
>): string {
  if (status === "oauth_connected") {
    const formattedDate = connectedAt
      ? new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
          year: "numeric",
        }).format(new Date(connectedAt))
      : "";

    return connectedAt
      ? `Verified on ${formattedDate}`
      : "Verified account connection";
  }

  if (status === "profile_linked") {
    return "Using your saved LinkedIn profile URL as the account source.";
  }

  if (!oauthConfigured) {
    return "OAuth is not configured yet. You can still use a saved LinkedIn URL.";
  }

  return "Connect LinkedIn to let the agent use account-aware workflows later.";
}

export function ConnectedAccountsSection({
  connectedAt,
  connectHref,
  hasSavedLinkedInUrl,
  isPending,
  isSuccess,
  message,
  oauthConfigured,
  status,
  onDisconnect,
  onUseSavedProfile,
}: ConnectedAccountsSectionProps) {
  const primaryButtonClass =
    "inline-flex min-h-[38px] w-full items-center justify-center rounded-md px-4 py-2 text-center text-[14px] font-medium leading-5 transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";
  const secondaryButtonClass =
    "inline-flex min-h-[38px] w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-center text-[14px] font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

  return (
    <section className="rounded-xl border border-border bg-surface px-6 py-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
        Connected Accounts
      </h2>
      <p className="mt-1 text-[14px] font-normal leading-5 text-text-secondary">
        Connect LinkedIn to let the agent handle manual apply with LinkedIn
        workflows.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-info-lightest">
              <span className="linkedin-mini-mark" aria-hidden="true">
                in
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-medium leading-5 text-text-primary">
                LinkedIn
              </p>
              <p className="text-[12px] font-normal leading-4 text-text-muted">
                {getStatusLabel(status)}
              </p>
              <p className="text-[12px] font-normal leading-4 text-text-secondary">
                {getStatusHint({ connectedAt, oauthConfigured, status })}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            {status === "oauth_connected" ? (
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={isPending}
                onClick={() => {
                  void onDisconnect();
                }}
              >
                Disconnect
              </button>
            ) : status === "profile_linked" ? (
              <>
                <a
                  href={oauthConfigured ? connectHref : undefined}
                  aria-disabled={!oauthConfigured || isPending}
                  className={`${primaryButtonClass} ${
                    oauthConfigured
                      ? "bg-linkedin text-linkedin-foreground hover:bg-info-dark"
                      : "bg-border text-text-secondary"
                  }`}
                  onClick={(event) => {
                    if (!oauthConfigured || isPending) {
                      event.preventDefault();
                    }
                  }}
                >
                  Upgrade to OAuth
                </a>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={isPending}
                  onClick={() => {
                    void onDisconnect();
                  }}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <a
                  href={oauthConfigured ? connectHref : undefined}
                  aria-disabled={!oauthConfigured || isPending}
                  className={`${primaryButtonClass} ${
                    oauthConfigured
                      ? "bg-linkedin text-linkedin-foreground hover:bg-info-dark"
                      : "bg-border text-text-secondary"
                  }`}
                  onClick={(event) => {
                    if (!oauthConfigured || isPending) {
                      event.preventDefault();
                    }
                  }}
                >
                  Connect LinkedIn
                </a>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={!hasSavedLinkedInUrl || isPending}
                  onClick={() => {
                    void onUseSavedProfile();
                  }}
                >
                  Use saved URL
                </button>
              </>
            )}
          </div>
        </div>

        {message ? (
          <p
            className={`mt-4 text-[13px] font-medium leading-5 ${
              isSuccess ? "text-success" : "text-error"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
