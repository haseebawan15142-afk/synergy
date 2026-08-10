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
    title: "On-site IT support",
    summary:
      "Expert engineers at your location for deployment, troubleshooting, and operational support across your IT estate.",
    image: "/images/services/on-site-it-support.webp",
    icon: "headset",
  },
  {
    slug: "network-infrastructure",
    title: "Network & infrastructure",
    summary:
      "Design, transformation, and management of networks and infrastructure — from strategy to workplace solutions.",
    image: "/images/services/network-infrastructure.webp",
    icon: "network",
  },
  {
    slug: "data-backup-recovery",
    title: "Data backup & recovery",
    summary:
      "Data availability and protection solutions to keep critical workloads resilient and recoverable.",
    image: "/images/services/data-backup-recovery.webp",
    icon: "databaseBackup",
  },
  {
    slug: "microsoft-365-cloud",
    title: "Microsoft 365 & cloud",
    summary:
      "Cloud and collaboration setup, migration, and governance aligned to your business objectives.",
    image: "/images/services/microsoft-365-cloud.webp",
    icon: "cloud",
  },
  {
    slug: "managed-it",
    title: "Managed IT & maintenance",
    summary:
      "24×7 third-party support and maintenance across your infrastructure — SLA-backed and cost-effective.",
    image: "/images/services/managed-it.webp",
    icon: "serverCog",
  },
];
