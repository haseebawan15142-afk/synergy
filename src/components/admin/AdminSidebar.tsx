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
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:translate-x-0",
          collapsed && "lg:w-[4.5rem]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link href="/admin" className="min-w-0 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {collapsed ? (
              <span className="hidden lg:inline">SC</span>
            ) : (
              <span className="truncate">Synergy Admin</span>
            )}
            <span className="lg:hidden">Synergy Admin</span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2" aria-label="Admin">
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
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
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
