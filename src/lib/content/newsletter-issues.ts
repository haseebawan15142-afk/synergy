export type NewsletterIssue = {
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  coverUrl: string;
  topic: string;
  href?: string;
  featured: boolean;
  sortOrder: number;
  publishedAt: string;
};

/** Local fallback until Firebase `newsletterIssues` is seeded. */
export const newsletterIssues: NewsletterIssue[] = [
  {
    title: "Pakistan’s only Dynatrace partner",
    slug: "dynatrace-partner-pakistan",
    excerpt:
      "Synergy Computers is the exclusive authorized Dynatrace partner in Pakistan — bringing AI-powered observability to banking, telecom, aviation, and the public sector.",
    body: "From application performance and infrastructure monitoring to digital experience and automated operations, Synergy delivers Dynatrace software intelligence across enterprise environments nationwide.",
    coverUrl: "/images/dynatrace/innovate-singapore-01.webp",
    topic: "Dynatrace",
    href: "/partners/dynatrace",
    featured: true,
    sortOrder: 1,
    publishedAt: "2026-06-01",
  },
  {
    title: "Veritas: data resilience for Pakistani enterprises",
    slug: "veritas-data-resilience",
    excerpt:
      "Protect critical workloads with Veritas backup, recovery, and information management — delivered and supported locally by Synergy.",
    coverUrl: "/images/partners/hero/veritas.webp",
    topic: "Veritas",
    href: "/partners/veritas",
    featured: false,
    sortOrder: 2,
    publishedAt: "2026-05-15",
  },
  {
    title: "Cohesity: modern data management",
    slug: "cohesity-modern-data",
    excerpt:
      "Consolidate backup, files, and object data on a single platform — with Synergy as your Cohesity delivery partner in Pakistan.",
    coverUrl: "/brand/cohesity/wordmark.svg",
    topic: "Cohesity",
    href: "/partners/cohesity",
    featured: false,
    sortOrder: 3,
    publishedAt: "2026-04-20",
  },
  {
    title: "Hitachi Vantara: infrastructure that scales",
    slug: "hitachi-vantara-infrastructure",
    excerpt:
      "Storage and data infrastructure for demanding workloads — Synergy helps design, deploy, and operate Hitachi Vantara solutions.",
    coverUrl: "/images/partners/hero/hitachi-vantara.webp",
    topic: "Hitachi Vantara",
    href: "/partners/hitachi-vantara",
    featured: false,
    sortOrder: 4,
    publishedAt: "2026-03-10",
  },
  {
    title: "Observability & managed IT roundup",
    slug: "observability-managed-it",
    excerpt:
      "How Pakistani enterprises are pairing observability platforms with managed services to keep digital channels reliable.",
    coverUrl: "/images/partners/hero/dynatrace.webp",
    topic: "Insights",
    href: "/resources",
    featured: false,
    sortOrder: 5,
    publishedAt: "2026-02-01",
  },
];
