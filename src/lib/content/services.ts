export type Service = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  /** Lucide NavIconKey for mega menu (optional; heuristic fallback). */
  icon?: string;
  /** Uploaded custom mega-menu icon (wins over Lucide). */
  iconUrl?: string;
};

export const services: Service[] = [
  {
    slug: "on-site-it-support",
    title: "Precision Field Support",
    summary:
      "Certified engineers on location for deployment, break-fix, and high-stakes project delivery across your estate.",
    image: "/images/services/on-site-it-support.png",
    icon: "headset",
  },
  {
    slug: "network-infrastructure",
    title: "Intelligent Infrastructure",
    summary:
      "Modern network and systems architecture — designed, transformed, and optimized for reliable enterprise scale.",
    image: "/images/services/network-infrastructure.png",
    icon: "network",
  },
  {
    slug: "data-backup-recovery",
    title: "Data Resilience & Continuity",
    summary:
      "Protection and recovery architectures that keep critical workloads recoverable when disruption hits.",
    image: "/images/services/data-backup-recovery.png",
    icon: "databaseBackup",
  },
];
