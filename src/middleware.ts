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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public site and non-admin APIs are untouched.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Dev-only bypass (hard-disabled in production via constants).
  if (ADMIN_AUTH_BYPASS) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const gateToken = request.cookies.get(ADMIN_GATE_COOKIE)?.value;

  if (!sessionToken || !gateToken) {
    return redirectToLogin(request, pathname);
  }

  // 1) Cryptographically verify Firebase session/ID JWT (sig + aud + iss + exp).
  const claims = await verifyFirebaseIdTokenEdge(sessionToken);
  if (!claims?.uid) {
    return redirectToLogin(request, pathname);
  }

  // 2) Verify server-minted HMAC gate that was issued only after Firestore role=admin.
  const gateOk = await verifyAdminGate(gateToken, claims.uid);
  if (!gateOk) {
    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
