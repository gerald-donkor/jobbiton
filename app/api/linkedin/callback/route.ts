import { NextRequest, NextResponse } from "next/server";
import {
  getLinkedInConnectionStatusFields,
  getLinkedInRedirectUri,
  hasLinkedInOAuthConfig,
} from "@/lib/linkedin-connection";
import { createInsforgeServer } from "@/lib/insforge-server";

const linkedinStateCookieName = "jobpilot_linkedin_oauth_state";

function getProfileUrl(request: NextRequest, result: string): URL {
  const profileUrl = new URL("/profile", request.url);
  profileUrl.searchParams.set("linkedin", result);
  return profileUrl;
}

function mapLinkedInProviderError(error: string): string {
  switch (error) {
    case "access_denied":
      return "oauth_cancelled";
    case "invalid_scope_error":
      return "oauth_invalid_scope";
    default:
      return "oauth_provider_error";
  }
}

async function exchangeLinkedInCode({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string } | null> {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("[api/linkedin/callback] Token exchange failed", responseText);
    return null;
  }

  const data: unknown = await response.json();
  const accessToken =
    data && typeof data === "object"
      ? Reflect.get(data, "access_token")
      : undefined;

  if (typeof accessToken !== "string") {
    return null;
  }

  return {
    accessToken,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!hasLinkedInOAuthConfig()) {
      return NextResponse.redirect(getProfileUrl(request, "oauth_unavailable"));
    }

    const returnedState = request.nextUrl.searchParams.get("state");
    const expectedState = request.cookies.get(linkedinStateCookieName)?.value;
    const error = request.nextUrl.searchParams.get("error");
    const errorDescription =
      request.nextUrl.searchParams.get("error_description") ?? "";
    const code = request.nextUrl.searchParams.get("code");

    if (error) {
      console.error("[api/linkedin/callback] Provider returned OAuth error", {
        error,
        errorDescription,
      });
      const response = NextResponse.redirect(
        getProfileUrl(request, mapLinkedInProviderError(error)),
      );
      response.cookies.delete(linkedinStateCookieName);
      return response;
    }

    if (!returnedState || !expectedState || returnedState !== expectedState) {
      const response = NextResponse.redirect(getProfileUrl(request, "state_mismatch"));
      response.cookies.delete(linkedinStateCookieName);
      return response;
    }

    if (!code) {
      const response = NextResponse.redirect(getProfileUrl(request, "oauth_failed"));
      response.cookies.delete(linkedinStateCookieName);
      return response;
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();

    if (userError || !user) {
      console.error("[api/linkedin/callback] Missing authenticated user", userError);
      const response = NextResponse.redirect(new URL("/login?next=/profile", request.url));
      response.cookies.delete(linkedinStateCookieName);
      return response;
    }

    const redirectUri = getLinkedInRedirectUri(request.nextUrl.origin);
    const token = await exchangeLinkedInCode({ code, redirectUri });

    if (!token?.accessToken) {
      const response = NextResponse.redirect(getProfileUrl(request, "oauth_failed"));
      response.cookies.delete(linkedinStateCookieName);
      return response;
    }

    const { error: updateError } = await insforge.auth.setProfile(
      getLinkedInConnectionStatusFields("oauth_connected"),
    );

    if (updateError) {
      console.error("[api/linkedin/callback] LinkedIn connection save failed", updateError);
      const response = NextResponse.redirect(getProfileUrl(request, "oauth_failed"));
      response.cookies.delete(linkedinStateCookieName);
      return response;
    }

    const response = NextResponse.redirect(getProfileUrl(request, "connected"));
    response.cookies.delete(linkedinStateCookieName);
    return response;
  } catch (error) {
    console.error("[api/linkedin/callback]", error);
    const response = NextResponse.redirect(getProfileUrl(request, "oauth_failed"));
    response.cookies.delete(linkedinStateCookieName);
    return response;
  }
}
