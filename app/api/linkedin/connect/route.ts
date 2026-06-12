import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getLinkedInRedirectUri,
  getLinkedInScopes,
  hasLinkedInOAuthConfig,
} from "@/lib/linkedin-connection";
import { createInsforgeServer } from "@/lib/insforge-server";

const linkedinStateCookieName = "jobpilot_linkedin_oauth_state";

function getProfileUrl(request: NextRequest, result?: string): URL {
  const profileUrl = new URL("/profile", request.url);

  if (result) {
    profileUrl.searchParams.set("linkedin", result);
  }

  return profileUrl;
}

export async function GET(request: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();

    if (userError || !user) {
      console.error("[api/linkedin/connect] Missing authenticated user", userError);
      return NextResponse.redirect(new URL("/login?next=/profile", request.url));
    }

    if (!hasLinkedInOAuthConfig()) {
      return NextResponse.redirect(getProfileUrl(request, "oauth_unavailable"));
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();

    if (!clientId) {
      return NextResponse.redirect(getProfileUrl(request, "oauth_unavailable"));
    }

    const state = randomUUID();
    const redirectUri = getLinkedInRedirectUri(request.nextUrl.origin);
    const authorizeUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");

    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("scope", getLinkedInScopes());

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(linkedinStateCookieName, state, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/api/linkedin/callback",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("[api/linkedin/connect]", error);
    return NextResponse.redirect(getProfileUrl(request, "oauth_failed"));
  }
}
