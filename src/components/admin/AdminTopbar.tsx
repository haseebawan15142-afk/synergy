"use client";

import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { ThemeSelector } from "@/components/theme/ThemeToggle";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

type AdminTopbarProps = {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function AdminTopbar({ onMenuClick, collapsed, onToggleCollapse }: AdminTopbarProps) {
  const { profile, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface-elevated/90 px-3 backdrop-blur sm:px-4">
      <button
        type="button"
        className="rounded-lg p-2 text-ink-muted hover:bg-synergy-muted hover:text-synergy lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        className="hidden rounded-lg p-2 text-ink-muted hover:bg-synergy-muted hover:text-synergy lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>

      <div className="relative hidden min-w-0 flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Search admin… (coming soon)"
          disabled
          className="w-full max-w-md rounded-lg border border-border bg-surface-muted py-2 pl-9 pr-3 text-sm text-ink-muted"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeSelector className="[&_button]:min-h-9 [&_button]:min-w-9" />
        <Link
          href="/admin/profile"
          className="hidden rounded-lg px-2 py-1.5 text-sm text-ink-muted hover:bg-synergy-muted hover:text-synergy sm:block"
        >
          {profile?.email ?? "Admin"}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-secondary transition hover:border-synergy/40 hover:bg-synergy-muted/50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
