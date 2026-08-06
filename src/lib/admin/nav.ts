import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Users,
  Briefcase,
  Building2,
  Handshake,
  ClipboardList,
  ImageIcon,
  Mail,
  Newspaper,
  UserCog,
  Palette,
  PanelBottom,
  Settings,
  UserCircle,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  phase: number;
  implemented?: boolean;
};

/** Only modules that power the live site (or essential admin ops). */
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, phase: 1, implemented: true },
  { label: "Website Settings", href: "/admin/settings", icon: Globe, phase: 1, implemented: true },
  { label: "Blogs", href: "/admin/blogs", icon: FileText, phase: 3, implemented: true },
  { label: "Board of Directors", href: "/admin/leadership", icon: Users, phase: 4, implemented: true },
  { label: "Services", href: "/admin/services", icon: Briefcase, phase: 4, implemented: true },
  { label: "Partners", href: "/admin/partners", icon: Handshake, phase: 4, implemented: true },
  { label: "Clients", href: "/admin/clients", icon: Building2, phase: 4, implemented: true },
  { label: "Careers", href: "/admin/careers", icon: ClipboardList, phase: 5, implemented: true },
  { label: "Newsletter", href: "/admin/newsletter", icon: Newspaper, phase: 5, implemented: true },
  { label: "Media", href: "/admin/media", icon: ImageIcon, phase: 2, implemented: true },
  { label: "Contact Messages", href: "/admin/messages", icon: Mail, phase: 5, implemented: true },
  { label: "Users", href: "/admin/users", icon: UserCog, phase: 1, implemented: true },
  { label: "Theme", href: "/admin/theme", icon: Palette, phase: 6, implemented: true },
  { label: "Footer", href: "/admin/footer", icon: PanelBottom, phase: 6, implemented: true },
  { label: "Settings", href: "/admin/system", icon: Settings, phase: 1, implemented: true },
  { label: "Profile", href: "/admin/profile", icon: UserCircle, phase: 1, implemented: true },
];
