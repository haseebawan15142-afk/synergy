import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminGate } from "@/lib/auth/admin-gate";
import { verifyFirebaseIdTokenEdge } from "@/lib/auth/verify-firebase-jwt-edge";
import {
  ADMIN_AUTH_BYPASS,
  ADMIN_GATE_COOKIE,
  ADMIN_SESSION_COOKIE,
} from "@/lib/firebase/constants";

function clearAdminCookies(response: NextResponse) {
  const clear = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clear);
  response.cookies.set(ADMIN_GATE_COOKIE, "", clear);
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  const response = NextResponse.redirect(loginUrl);
  clearAdminCookies(response);
  return response;
}

function withPathnameHeader(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward pathname so the site layout can SSR the home hero nav as transparent.
  if (!pathname.startsWith("/admin")) {
    return withPathnameHeader(request);
  }

  if (ADMIN_AUTH_BYPASS) {
    return withPathnameHeader(request);
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return withPathnameHeader(request);
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const gateToken = request.cookies.get(ADMIN_GATE_COOKIE)?.value;

  if (!sessionToken || !gateToken) {
    return redirectToLogin(request, pathname);
  }

  const claims = await verifyFirebaseIdTokenEdge(sessionToken);
  if (!claims?.uid) {
    return redirectToLogin(request, pathname);
  }

  const gateOk = await verifyAdminGate(gateToken, claims.uid);
  if (!gateOk) {
    return redirectToLogin(request, pathname);
  }

  return withPathnameHeader(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets; run on pages so x-pathname reaches the site layout.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
