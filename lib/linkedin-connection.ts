export const linkedinConnectionStatuses = [
  "not_connected",
  "profile_linked",
  "oauth_connected",
] as const;

export type LinkedInConnectionStatus =
  (typeof linkedinConnectionStatuses)[number];

export type LinkedInConnection = {
  connectedAt: string;
  hasSavedProfileUrl: boolean;
  oauthConfigured: boolean;
  status: LinkedInConnectionStatus;
};

const linkedinStatusField = "jobpilot_linkedin_connection_status";
const linkedinConnectedAtField = "jobpilot_linkedin_connected_at";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readRecord(
  value: unknown,
): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? Reflect.ownKeys(value).reduce<Record<string, unknown>>((record, key) => {
        if (typeof key === "string") {
          record[key] = Reflect.get(value, key);
        }

        return record;
      }, {})
    : null;
}

function normalizeStatus(value: string): LinkedInConnectionStatus {
  for (const status of linkedinConnectionStatuses) {
    if (status === value) {
      return status;
    }
  }

  return "not_connected";
}

export function getLinkedInConnectionStatusFields(status: LinkedInConnectionStatus) {
  return {
    [linkedinStatusField]: status,
    [linkedinConnectedAtField]:
      status === "not_connected" ? "" : new Date().toISOString(),
  };
}

export function clearLinkedInConnectionStatusFields() {
  return {
    [linkedinStatusField]: "not_connected",
    [linkedinConnectedAtField]: "",
  };
}

export function hasLinkedInOAuthConfig(): boolean {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() &&
      process.env.LINKEDIN_CLIENT_SECRET?.trim(),
  );
}

export function getLinkedInRedirectUri(origin: string): string {
  const configuredRedirectUri = process.env.LINKEDIN_REDIRECT_URI?.trim();

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  return new URL("/api/linkedin/callback", origin).toString();
}

export function getLinkedInScopes(): string {
  const configuredScopes = process.env.LINKEDIN_OAUTH_SCOPES?.trim();

  if (configuredScopes) {
    return configuredScopes;
  }

  return "openid profile";
}

export function getLinkedInConnection(
  authProfile: unknown,
  linkedinUrl: string,
): LinkedInConnection {
  const profile = readRecord(authProfile);
  const rawStatus = profile ? readString(profile[linkedinStatusField]) : "";
  const connectedAt = profile
    ? readString(profile[linkedinConnectedAtField])
    : "";

  return {
    connectedAt,
    hasSavedProfileUrl: Boolean(linkedinUrl.trim()),
    oauthConfigured: hasLinkedInOAuthConfig(),
    status: normalizeStatus(rawStatus),
  };
}
