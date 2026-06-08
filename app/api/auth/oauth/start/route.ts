import { createServerClient } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

const pkceCookieName = "jobpilot_pkce_verifier";
const providers = ["google", "github"] as const;

type AuthProvider = (typeof providers)[number];

function isAuthProvider(value: string | null): value is AuthProvider {
  return providers.some((provider) => provider === value);
}

function getLoginUrl(request: NextRequest, error: string): URL {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  return loginUrl;
}

export async function GET(request: NextRequest) {
  try {
    const provider = request.nextUrl.searchParams.get("provider");

    if (!isAuthProvider(provider)) {
      return NextResponse.redirect(getLoginUrl(request, "oauth_provider"));
    }

    const insforge = createServerClient();
    const { data, error } = await insforge.auth.signInWithOAuth(provider, {
      redirectTo: new URL("/auth/callback", request.url).toString(),
      additionalParams: provider === "google" ? { prompt: "select_account" } : undefined,
      skipBrowserRedirect: true,
    });

    if (error || !data.url || !data.codeVerifier) {
      console.error("[auth/oauth/start] OAuth start failed", error);
      return NextResponse.redirect(getLoginUrl(request, "oauth_start"));
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set(pkceCookieName, data.codeVerifier, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/auth/callback",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("[auth/oauth/start]", error);
    return NextResponse.redirect(getLoginUrl(request, "oauth_start"));
  }
}

