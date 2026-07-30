export type Service = {
  slug: string;
  title: string;
  summary: string;
};

export const services: Service[] = [
  {
    slug: "on-site-it-support",
    title: "On-site IT support",
    summary:
      "Expert engineers at your location for deployment, troubleshooting, and operational support across your IT estate.",
  },
  {
    slug: "network-infrastructure",
    title: "Network & infrastructure",
    summary:
      "Design, transformation, and management of networks and infrastructure — from strategy to workplace solutions.",
  },
  {
    slug: "data-backup-recovery",
    title: "Data backup & recovery",
    summary:
      "Data availability and protection solutions to keep critical workloads resilient and recoverable.",
  },
  {
    slug: "microsoft-365-cloud",
    title: "Microsoft 365 & cloud",
    summary:
      "Cloud and collaboration setup, migration, and governance aligned to your business objectives.",
  },
  {
    slug: "managed-it",
    title: "Managed IT & maintenance",
    summary:
      "24×7 third-party support and maintenance across your infrastructure — SLA-backed and cost-effective.",
  },
];
