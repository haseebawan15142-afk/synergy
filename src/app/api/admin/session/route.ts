import { NextResponse } from "next/server";
import { mintAdminGate } from "@/lib/auth/admin-gate";
import {
  ADMIN_SESSION_MAX_AGE_SEC,
  createVerifiedAdminSessionCookie,
} from "@/lib/auth/admin-session";
import { ADMIN_GATE_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/firebase/constants";

export const runtime = "nodejs";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const idToken = body.token?.trim();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    let sessionCookie: string;
    let uid: string;
    try {
      const minted = await createVerifiedAdminSessionCookie(idToken);
      sessionCookie = minted.sessionCookie;
      uid = minted.session.uid;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "forbidden") {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const gate = await mintAdminGate(uid, ADMIN_SESSION_MAX_AGE_SEC);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      sessionCookie,
      cookieOptions(ADMIN_SESSION_MAX_AGE_SEC),
    );
    response.cookies.set(ADMIN_GATE_COOKIE, gate, cookieOptions(ADMIN_SESSION_MAX_AGE_SEC));
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", cookieOptions(0));
  response.cookies.set(ADMIN_GATE_COOKIE, "", cookieOptions(0));
  return response;
}
