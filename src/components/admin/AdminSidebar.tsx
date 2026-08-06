"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { adminNavItems } from "@/lib/admin/nav";
import { cn } from "@/lib/cn";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
};

export function AdminSidebar({ open, onClose, collapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 transition-transform lg:static lg:translate-x-0",
          collapsed && "lg:w-[4.5rem]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-synergy/15 via-transparent to-accent/10" aria-hidden />

        <div className="relative flex h-14 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="min-w-0 font-display font-bold tracking-tight text-white">
            {collapsed ? (
              <span className="hidden text-synergy-light lg:inline">SC</span>
            ) : (
              <span className="truncate">
                Synergy <span className="text-synergy-light">Admin</span>
              </span>
            )}
            <span className="lg:hidden">
              Synergy <span className="text-synergy-light">Admin</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto p-2" aria-label="Admin">
          <ul className="space-y-0.5">
            {adminNavItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-synergy text-white shadow-soft"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
