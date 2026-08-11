import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import type { AdminUser, UserRole } from "@/lib/firebase/collections";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/constants";

export { ADMIN_SESSION_COOKIE };

const SESSION_FETCH_TIMEOUT_MS = 12_000;

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, ms = SESSION_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function logoutAdmin() {
  await signOut(getFirebaseAuth());
  await clearSessionCookie();
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function fetchAdminProfile(uid: string): Promise<AdminUser | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: String(data.email ?? ""),
    displayName: data.displayName ? String(data.displayName) : undefined,
    role: (data.role as UserRole) || "viewer",
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function isAdminUser(uid: string) {
  const profile = await fetchAdminProfile(uid);
  return profile?.role === "admin";
}

export async function setSessionCookie(token: string) {
  let res: Response;
  try {
    res = await fetchWithTimeout("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("session_timeout");
    }
    throw error;
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Failed to create admin session");
  }
}

export async function clearSessionCookie() {
  try {
    await fetchWithTimeout("/api/admin/session", { method: "DELETE" }, 5_000);
  } catch {
    /* best-effort */
  }
}

export async function refreshSessionCookie(user: User) {
  const token = await user.getIdToken(true);
  await setSessionCookie(token);
}

function authErrorMessage(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code?: string }).code || "")
      : "";
  const message = err instanceof Error ? err.message : "";

  if (
    code.includes("auth/invalid-credential") ||
    code.includes("auth/wrong-password") ||
    code.includes("auth/user-not-found") ||
    code.includes("auth/invalid-email") ||
    message.includes("auth/invalid-credential") ||
    message.includes("auth/wrong-password")
  ) {
    return "Invalid email or password. Check credentials and try again.";
  }
  if (code.includes("auth/too-many-requests") || message.includes("too-many-requests")) {
    return "Too many failed attempts. Wait a few minutes, then try again.";
  }
  if (code.includes("auth/network-request-failed") || message.includes("network-request-failed")) {
    return "Network error reaching Firebase Auth. Check your connection.";
  }
  if (message === "forbidden") {
    return "Signed in, but this account is not an admin in Firestore.";
  }
  if (message === "session_timeout") {
    return "Admin session API timed out. Restart `npm run dev` (TLS wrapper) and confirm FIREBASE_ADMIN_* env vars.";
  }
  if (message.includes("Failed to create admin session") || message === "unauthorized") {
    return "Could not create admin session. Check Firebase Admin env vars on the server.";
  }
  return message || "Login failed";
}

export { authErrorMessage };
