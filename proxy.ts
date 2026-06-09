import { updateSession, type CookieOptions, type CookieStore } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];
const authRedirectRoutes = ["/login"];
const authCookieName = "insforge_access_token";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  function setResponseCookie(name: string, value: string, options?: CookieOptions): unknown;
  function setResponseCookie(options: { name: string; value: string } & CookieOptions): unknown;
  function setResponseCookie(
    first: string | ({ name: string; value: string } & CookieOptions),
    value?: string,
    options?: CookieOptions,
  ) {
    if (typeof first === "string") {
      return response.cookies.set({ name: first, value: value ?? "", ...options });
    }

    return response.cookies.set(first);
  }

  function deleteResponseCookie(name: string): unknown;
  function deleteResponseCookie(options: { name: string } & CookieOptions): unknown;
  function deleteResponseCookie(first: string | ({ name: string } & CookieOptions)) {
    if (typeof first === "string") {
      return response.cookies.delete(first);
    }

    return response.cookies.delete(first.name);
  }

  const requestCookies: CookieStore = {
    get: (name) => request.cookies.get(name)?.value,
    set: () => undefined,
    delete: () => undefined,
  };
  const responseCookies: CookieStore = {
    get: (name) => response.cookies.get(name)?.value,
    set: setResponseCookie,
    delete: deleteResponseCookie,
  };
  const session = await updateSession({
    requestCookies,
    responseCookies,
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
