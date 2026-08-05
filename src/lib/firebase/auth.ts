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

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  const token = await credential.user.getIdToken();
  await setSessionCookie(token);
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
  await fetch("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export async function clearSessionCookie() {
  await fetch("/api/admin/session", { method: "DELETE" });
}

export async function refreshSessionCookie(user: User) {
  const token = await user.getIdToken(true);
  await setSessionCookie(token);
}
