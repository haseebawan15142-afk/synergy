"use client";

import { useState } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminToastProvider } from "@/components/admin/AdminToastProvider";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-surface-muted p-6">
        <AdminPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-muted text-ink">
      <AdminSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          onMenuClick={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <AdminToastProvider />
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminAuthProvider>
  );
}
