import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/constants";

export type AdminSession = {
  uid: string;
  email: string;
};

/** ID token lifetime (~1h). Client remints via refreshSessionCookie while the admin is active. */
const ID_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60;

async function assertFirestoreAdmin(uid: string): Promise<void> {
  const profile = await getAdminDb().collection(COLLECTIONS.users).doc(uid).get();
  if (!profile.exists || profile.data()?.role !== "admin") {
    const err = new Error("forbidden");
    (err as Error & { code?: string }).code = "forbidden";
    throw err;
  }
}

/** Verify a Firebase ID token and ensure the user has role=admin in Firestore. */
export async function verifyAdminIdToken(token: string): Promise<AdminSession> {
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  await assertFirestoreAdmin(decoded.uid);
  return { uid: decoded.uid, email: decoded.email || "" };
}

/**
 * Verify Firebase ID token (preferred for Edge middleware) or legacy session cookie,
 * then re-check admin role in Firestore.
 */
export async function verifyAdminCredential(token: string): Promise<AdminSession> {
  let uid = "";
  let email = "";

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    uid = decoded.uid;
    email = decoded.email || "";
  } catch {
    const decoded = await getAdminAuth().verifySessionCookie(token, true);
    uid = decoded.uid;
    email = decoded.email || "";
  }

  await assertFirestoreAdmin(uid);
  return { uid, email };
}

/**
 * After ID token + admin role verification, return the ID token for the httpOnly cookie.
 * Edge middleware can verify ID tokens reliably (session-cookie JWKS differs / cookies are large).
 */
export async function createVerifiedAdminSessionCookie(idToken: string): Promise<{
  sessionCookie: string;
  expiresInMs: number;
  session: AdminSession;
}> {
  const session = await verifyAdminIdToken(idToken);
  return {
    sessionCookie: idToken,
    expiresInMs: ID_TOKEN_COOKIE_MAX_AGE_SEC * 1000,
    session,
  };
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || null;
}

export function getCookieToken(request: Request): string | null {
  const raw = request.headers.get("cookie") || "";
  if (!raw) return null;
  const parts = raw.split(";").map((p) => p.trim());
  const prefix = `${ADMIN_SESSION_COOKIE}=`;
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      const value = part.slice(prefix.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

/** Prefer Bearer, then httpOnly admin session cookie. */
export async function requireAdminRequest(request: Request): Promise<
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse }
> {
  const token = getBearerToken(request) || getCookieToken(request);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  try {
    const session = await verifyAdminCredential(token);
    return { ok: true, session };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "forbidden") {
      return {
        ok: false,
        response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
      };
    }
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
}

/** Server Components / Route Handlers that use next/headers cookies(). */
export async function requireAdminCookie(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyAdminCredential(token);
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_MAX_AGE_SEC = ID_TOKEN_COOKIE_MAX_AGE_SEC;
