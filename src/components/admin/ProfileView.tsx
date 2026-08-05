"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export function ProfileView() {
  const { user, profile, logout } = useAdminAuth();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your authenticated admin account.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-zinc-500">Email</dt>
            <dd className="mt-1 font-medium">{profile?.email || user?.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Display name</dt>
            <dd className="mt-1 font-medium">{profile?.displayName || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Role</dt>
            <dd className="mt-1 font-medium capitalize">{profile?.role || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">User ID</dt>
            <dd className="mt-1 break-all font-mono text-xs">{user?.uid}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
