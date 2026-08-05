"use client";

import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loginWithEmail,
  fetchAdminProfile,
  refreshSessionCookie,
  subscribeToAuth,
} from "@/lib/firebase/auth";
import { ADMIN_AUTH_BYPASS } from "@/lib/firebase/constants";
import { AdminToastProvider } from "@/components/admin/AdminToastProvider";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(!ADMIN_AUTH_BYPASS);

  useEffect(() => {
    if (ADMIN_AUTH_BYPASS) {
      router.replace(next.startsWith("/admin") ? next : "/admin");
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      setChecking(false);
    };

    // Don't leave the UI stuck if Firebase Auth/Firestore never responds.
    const timeout = window.setTimeout(finish, 8000);

    let unsub = () => {};
    try {
      unsub = subscribeToAuth(async (user) => {
        if (!user) {
          window.clearTimeout(timeout);
          finish();
          return;
        }
        try {
          const profile = await fetchAdminProfile(user.uid);
          if (profile?.role === "admin") {
            await refreshSessionCookie(user);
            window.clearTimeout(timeout);
            router.replace(next.startsWith("/admin") ? next : "/admin");
            return;
          }
        } catch {
          /* ignore — show login form */
        }
        window.clearTimeout(timeout);
        finish();
      });
    } catch {
      window.clearTimeout(timeout);
      finish();
    }

    return () => {
      window.clearTimeout(timeout);
      unsub();
    };
  }, [next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (ADMIN_AUTH_BYPASS) {
      router.replace("/admin");
      return;
    }
    setSubmitting(true);
    try {
      const user = await loginWithEmail(email.trim(), password);
      const profile = await fetchAdminProfile(user.uid);
      if (profile?.role !== "admin") {
        toast.error("This account is not an admin.");
        setSubmitting(false);
        return;
      }
      toast.success("Welcome back");
      router.replace(next.startsWith("/admin") ? next : "/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message.includes("auth/") ? "Invalid email or password" : message);
      setSubmitting(false);
    }
  }

  if (checking || ADMIN_AUTH_BYPASS) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        {ADMIN_AUTH_BYPASS ? "Auth bypass enabled — opening admin…" : "Checking session…"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Synergy CMS
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Admin login
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sign in with your Firebase admin account to manage the website.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-zinc-900 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-zinc-900 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AdminToastProvider />
      <Suspense fallback={<div className="text-sm text-zinc-500">Loading login…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
