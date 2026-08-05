"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import {
  fetchAdminProfile,
  logoutAdmin,
  refreshSessionCookie,
  subscribeToAuth,
} from "@/lib/firebase/auth";
import type { AdminUser } from "@/lib/firebase/collections";
import { ADMIN_AUTH_BYPASS } from "@/lib/firebase/constants";

type AuthState = {
  user: User | null;
  profile: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  bypass: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const bypassProfile: AdminUser = {
  uid: "dev-bypass",
  email: "dev@localhost",
  displayName: "Dev Admin (auth bypass)",
  role: "admin",
};

const AdminAuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminUser | null>(ADMIN_AUTH_BYPASS ? bypassProfile : null);
  const [loading, setLoading] = useState(!ADMIN_AUTH_BYPASS);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfile = useCallback(async () => {
    if (ADMIN_AUTH_BYPASS) {
      setProfile(bypassProfile);
      return;
    }
    if (!user) {
      setProfile(null);
      return;
    }
    const next = await fetchAdminProfile(user.uid);
    setProfile(next);
  }, [user]);

  useEffect(() => {
    if (ADMIN_AUTH_BYPASS) {
      setProfile(bypassProfile);
      setLoading(false);
      return;
    }

    const unsub = subscribeToAuth(async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await fetchAdminProfile(nextUser.uid);
        setProfile(nextProfile);
        if (nextProfile?.role === "admin") {
          await refreshSessionCookie(nextUser);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (ADMIN_AUTH_BYPASS) return;
    if (loading) return;
    if (pathname === "/admin/login") return;

    if (!user || profile?.role !== "admin") {
      const next = encodeURIComponent(pathname || "/admin");
      router.replace(`/admin/login?next=${next}`);
    }
  }, [loading, user, profile, pathname, router]);

  const logout = useCallback(async () => {
    if (ADMIN_AUTH_BYPASS) {
      router.push("/");
      return;
    }
    await logoutAdmin();
    setUser(null);
    setProfile(null);
    router.replace("/admin/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: ADMIN_AUTH_BYPASS || profile?.role === "admin",
      bypass: ADMIN_AUTH_BYPASS,
      logout,
      refreshProfile,
    }),
    [user, profile, loading, logout, refreshProfile],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
