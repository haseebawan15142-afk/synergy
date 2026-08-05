import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/constants";

const MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    if (!body.token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
