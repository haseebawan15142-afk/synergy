export type CaseStudy = {
  slug: string;
  client: string;
  image: string;
  industry: string;
  headline: string;
  summary: string;
  metrics: [string, string, string];
  body: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "multinational-bank-data-resilience",
    client: "Leading Multinational Bank",
    image: "/images/case-studies/multinational-bank-data-resilience.jpg",
    industry: "Banking and finance",
    headline: "Cut recovery time by 62% with enterprise-grade data protection",
    summary:
      "Synergy deployed Veritas-backed backup and recovery across core banking workloads — improving RPO/RTO targets and audit readiness.",
    metrics: [
      "62% faster recovery during DR drills",
      "99.97% backup success rate across 120+ TB",
      "40% reduction in manual backup operations",
    ],
    body: [
      "A multinational bank operating across Pakistan needed to modernize legacy backup processes while meeting strict regulatory retention requirements.",
      "Synergy designed a tiered protection model with immutable snapshots, off-site replication, and runbooks aligned to internal audit cycles.",
      "Quarterly recovery tests now complete in hours instead of days, with full traceability for compliance teams.",
    ],
  },
  {
    slug: "healthcare-network-modernization",
    client: "Regional Healthcare Network",
    image: "/images/case-studies/healthcare-network-modernization.jpg",
    industry: "Healthcare",
    headline: "Unified 18 clinics onto a secure, always-on IT platform",
    summary:
      "Managed IT and network upgrades delivered consistent uptime for EMR access, imaging systems, and branch connectivity.",
    metrics: [
      "50% faster deployment of new clinic sites",
      "35% fewer P1 incidents within 6 months",
      "24×7 SLA-backed monitoring and on-site support",
    ],
    body: [
      "A growing healthcare network struggled with inconsistent network performance and fragmented support across multiple locations.",
      "Synergy standardized switching, Wi‑Fi, and endpoint policies while introducing proactive monitoring and escalation paths.",
      "Clinical staff now experience predictable application performance, and IT leadership has unified visibility across all branches.",
    ],
  },
  {
    slug: "power-utility-infrastructure",
    client: "National Power Utility",
    image: "/images/case-studies/power-utility-infrastructure.jpg",
    industry: "Power & utilities",
    headline: "Modernized core infrastructure for mission-critical OT/IT convergence",
    summary:
      "Network and infrastructure transformation improved resilience for SCADA-adjacent systems and corporate operations.",
    metrics: [
      "45% improvement in network fault isolation time",
      "Zero unplanned outages during phased migration",
      "3× capacity headroom for future smart-grid initiatives",
    ],
    body: [
      "A national power utility required a staged modernization of data center and wide-area network assets without disrupting operations.",
      "Synergy executed a phased rollout with redundant paths, hardened segmentation, and Dell/NetApp aligned storage refresh.",
      "The program delivered measurable resilience gains while keeping legacy OT interfaces stable throughout the transition.",
    ],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
