"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Briefcase,
  Mail,
  CheckCircle2,
  AlertCircle,
  HardDrive,
} from "lucide-react";
import { fetchDashboardStats, type DashboardStats } from "@/lib/admin/dashboard";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
        </div>
        <span className="rounded-xl bg-zinc-100 p-2.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!stats) return <AdminPageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Overview of your Synergy CMS content and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Blogs" value={stats.blogs} icon={FileText} />
        <StatCard label="Total Alumni" value={stats.alumni} icon={GraduationCap} />
        <StatCard label="Total Services" value={stats.services} icon={Briefcase} />
        <StatCard
          label="Total Messages"
          value={stats.messages}
          icon={Mail}
          hint={`${stats.unreadMessages} unread`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-1">
          <h2 className="text-sm font-semibold">Website status</h2>
          <div className="mt-4 flex items-start gap-3">
            {stats.settingsReady ? (
              <>
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">Settings configured</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    `settings/site` document is present in Firestore.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Settings not saved yet</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Open Website Settings and save to initialize Firestore.
                  </p>
                  <Link href="/admin/settings" className="mt-2 inline-block text-sm font-medium underline">
                    Go to settings
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex items-start gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <HardDrive className="mt-0.5 h-5 w-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium">Storage usage</p>
              <p className="mt-1 text-xs text-zinc-500">
                Detailed Storage metrics unlock in Phase 6 (Analytics).
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold">Latest blog</h2>
          {stats.latestBlog ? (
            <div className="mt-4">
              <p className="font-medium">{stats.latestBlog.title}</p>
              <p className="mt-1 text-xs text-zinc-500">ID: {stats.latestBlog.id}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No blogs in Firestore yet (Phase 3 / 7).</p>
          )}

          <h2 className="mt-8 text-sm font-semibold">Latest contact</h2>
          {stats.latestMessage ? (
            <div className="mt-4">
              <p className="font-medium">{stats.latestMessage.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{stats.latestMessage.email}</p>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                {stats.latestMessage.message}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              No messages yet. Contact form wiring arrives in Phase 5.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          {stats.activities.length ? (
            <ul className="mt-4 space-y-3">
              {stats.activities.map((item) => (
                <li key={item.id} className="border-b border-zinc-100 pb-3 last:border-0 dark:border-zinc-800">
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.actorEmail || item.type}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              No activity yet. Seeding an admin or saving settings will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
