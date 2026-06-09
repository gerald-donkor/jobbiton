import { clearAuthCookies, createServerClient, setAuthCookies } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

const pkceCookieName = "jobpilot_pkce_verifier";
const nextCookieName = "jobpilot_auth_next";
const fallbackNextPath = "/profile";

function getLoginUrl(request: NextRequest, error: string): URL {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  return loginUrl;
}

function redirectToLoginWithClearedFlowCookies(request: NextRequest, error: string): NextResponse {
  const response = NextResponse.redirect(getLoginUrl(request, error));
  response.cookies.delete(pkceCookieName);
  response.cookies.delete(nextCookieName);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const flowError = request.nextUrl.searchParams.get("error");
    const code = request.nextUrl.searchParams.get("insforge_code");
    const codeVerifier = request.cookies.get(pkceCookieName)?.value;
    const nextPath = request.cookies.get(nextCookieName)?.value ?? fallbackNextPath;

    if (flowError) {
      console.error("[auth/callback] OAuth provider returned an error", flowError);
      return redirectToLoginWithClearedFlowCookies(request, "oauth");
    }

    if (!code || !codeVerifier) {
      console.error("[auth/callback] Missing OAuth code or PKCE verifier");
      return redirectToLoginWithClearedFlowCookies(request, "oauth_callback");
    }

    const insforge = createServerClient();
    const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

    if (error || !data?.accessToken || !data.refreshToken || !data.user) {
      console.error("[auth/callback] OAuth code exchange failed", error);
      const response = redirectToLoginWithClearedFlowCookies(request, "session");
      clearAuthCookies(response.cookies);
      return response;
    }

    const response = NextResponse.redirect(new URL(nextPath, request.url));
    response.cookies.delete(pkceCookieName);
    response.cookies.delete(nextCookieName);
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return response;
  } catch (error) {
    console.error("[auth/callback]", error);
    return redirectToLoginWithClearedFlowCookies(request, "session");
  }
}
