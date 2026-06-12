import { updateSession, type CookieStore } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];
const authRedirectRoutes = ["/login"];
const authCookieName = "insforge_access_token";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const requestCookies: CookieStore = {
    get: (name) => request.cookies.get(name),
    set: (first, value?: string) => {
      if (typeof first === "string") {
        return request.cookies.set(first, value ?? "");
      }

      return request.cookies.set({
        name: first.name,
        value: first.value,
      });
    },
    delete: (first) => {
      if (typeof first === "string") {
        return request.cookies.delete(first);
      }

      return request.cookies.delete(first.name);
    },
  };

  const session = await updateSession({
    requestCookies,
    responseCookies: response.cookies,
  });

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRedirectRoute = authRedirectRoutes.includes(pathname);
  const hasSession = Boolean(session.accessToken || request.cookies.get(authCookieName)?.value);

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRedirectRoute && hasSession) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/api/linkedin/:path*",
    "/api/resume/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
