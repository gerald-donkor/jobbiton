import { clearAuthCookies, createServerClient, setAuthCookies } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

const pkceCookieName = "jobpilot_pkce_verifier";

function getLoginUrl(request: NextRequest, error: string): URL {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  return loginUrl;
}

export async function GET(request: NextRequest) {
  try {
    const flowError = request.nextUrl.searchParams.get("error");
    const code = request.nextUrl.searchParams.get("insforge_code");
    const codeVerifier = request.cookies.get(pkceCookieName)?.value;

    if (flowError) {
      console.error("[auth/callback] OAuth provider returned an error", flowError);
      return NextResponse.redirect(getLoginUrl(request, "oauth"));
    }

    if (!code || !codeVerifier) {
      console.error("[auth/callback] Missing OAuth code or PKCE verifier");
      return NextResponse.redirect(getLoginUrl(request, "oauth_callback"));
    }

    const insforge = createServerClient();
    const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

    if (error || !data?.accessToken || !data.refreshToken || !data.user) {
      console.error("[auth/callback] OAuth code exchange failed", error);
      const response = NextResponse.redirect(getLoginUrl(request, "session"));
      response.cookies.delete(pkceCookieName);
      clearAuthCookies(response.cookies);
      return response;
    }

    const response = NextResponse.redirect(new URL("/profile", request.url));
    response.cookies.delete(pkceCookieName);
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return response;
  } catch (error) {
    console.error("[auth/callback]", error);
    return NextResponse.redirect(getLoginUrl(request, "session"));
  }
}
