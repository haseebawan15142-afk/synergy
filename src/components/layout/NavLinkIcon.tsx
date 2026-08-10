import {
  Award,
  Boxes,
  Briefcase,
  Building2,
  Cloud,
  Cpu,
  DatabaseBackup,
  Factory,
  Globe,
  GraduationCap,
  Handshake,
  Headset,
  HeartPulse,
  Hotel,
  Landmark,
  Mail,
  MessageSquare,
  Network,
  Newspaper,
  Radio,
  ServerCog,
  Shield,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { resolveNavIconKey, type NavIconKey } from "@/lib/content/nav-icons";
import { cn } from "@/lib/cn";

const icons: Record<NavIconKey, LucideIcon> = {
  headset: Headset,
  network: Network,
  databaseBackup: DatabaseBackup,
  cloud: Cloud,
  serverCog: ServerCog,
  landmark: Landmark,
  radio: Radio,
  zap: Zap,
  heartPulse: HeartPulse,
  graduationCap: GraduationCap,
  hotel: Hotel,
  building2: Building2,
  shield: Shield,
  factory: Factory,
  users: Users,
  award: Award,
  messageSquare: MessageSquare,
  newspaper: Newspaper,
  mail: Mail,
  handshake: Handshake,
  cpu: Cpu,
  boxes: Boxes,
  globe: Globe,
  briefcase: Briefcase,
  chevronRight: Boxes,
};

type NavLinkIconProps = {
  href: string;
  label?: string;
  icon?: NavIconKey;
  className?: string;
  size?: number;
};

export function NavLinkIcon({ href, label, icon, className, size = 16 }: NavLinkIconProps) {
  const key = icon || resolveNavIconKey(href, label || "");
  const Icon = icons[key] || Boxes;
  return <Icon className={cn("shrink-0", className)} size={size} strokeWidth={1.75} aria-hidden />;
}
