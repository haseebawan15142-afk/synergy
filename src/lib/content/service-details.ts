/**
 * Rich service detail copy for /services/[slug].
 * Structure inspired by enterprise service pages; wording aligned to Synergy offerings.
 */

export type ServiceCapability = {
  title: string;
  description: string;
};

export type ServiceOutcome = {
  title: string;
  description: string;
};

export type ServiceDetail = {
  slug: string;
  headline: string;
  lead: string;
  challenge: string;
  approach: string;
  benefits: string;
  capabilities: ServiceCapability[];
  outcomes: ServiceOutcome[];
  heroImage: string;
};

const sharedProcess = [
  {
    step: "01",
    title: "Discovery",
    description:
      "We assess your environment, risks, and goals so the engagement starts with a clear scope.",
  },
  {
    step: "02",
    title: "Design",
    description:
      "Architectures and runbooks are tailored to your estate, vendors, and operational constraints.",
  },
  {
    step: "03",
    title: "Delivery",
    description:
      "Implementation is sequenced for minimal disruption, with validation at every milestone.",
  },
  {
    step: "04",
    title: "Support",
    description:
      "Ongoing maintenance, health checks, and SLA-backed support keep systems reliable over time.",
  },
] as const;

export const serviceProcess = sharedProcess;

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "data-backup-recovery",
    headline: "Protect critical data and recover with confidence",
    lead: "Strengthen resilience with backup, replication, and recovery designs that match how your business actually operates.",
    challenge:
      "Many organizations discover too late that backups complete without proving recovery readiness. Incomplete runbooks, untested restores, and fragmented tools leave teams exposed when outages or ransomware strike.",
    approach:
      "Synergy designs and implements data availability solutions with leading protection platforms. We align backup policies, retention, and restore paths to your RPO/RTO targets — then help you validate them through practical drills.",
    benefits:
      "Clear recovery paths, stronger cyber resilience, and fewer surprises during incidents — backed by local expertise across banking, telecom, utilities, and enterprise environments in Pakistan.",
    heroImage: "/images/services/heroes/data-backup-recovery-hero.png",
    capabilities: [
      {
        title: "Backup architecture",
        description: "Policy design for critical workloads across data center and hybrid environments.",
      },
      {
        title: "Disaster recovery readiness",
        description: "Recovery runbooks, restore validation, and drill support that prove outcomes.",
      },
      {
        title: "Ransomware resilience",
        description: "Immutable and isolated protection patterns that reduce blast radius.",
      },
      {
        title: "Lifecycle support",
        description: "Health checks, tuning, and SLA-aligned maintenance after go-live.",
      },
    ],
    outcomes: [
      {
        title: "Faster recovery confidence",
        description: "Restore paths that are documented, tested, and understood by your teams.",
      },
      {
        title: "Lower operational risk",
        description: "Fewer gaps between backup success and actual recoverability.",
      },
      {
        title: "Vendor-aligned delivery",
        description: "Implementation with principals Synergy already supports in Pakistan.",
      },
      {
        title: "Local ownership",
        description: "On-ground engineers who stay accountable after the project ends.",
      },
    ],
  },
  {
    slug: "network-infrastructure",
    headline: "Build intelligent infrastructure that scales",
    lead: "Modernize connectivity, security, and systems foundations for reliable enterprise operations.",
    challenge:
      "Legacy networks struggle with growth, security expectations, and multi-site complexity. Fragmented designs create outages, slow troubleshooting, and limited visibility across locations.",
    approach:
      "We design and deliver network and infrastructure programs from assessment through deployment — aligning switching, routing, wireless, and security controls to your operating model and vendor standards.",
    benefits:
      "More predictable performance, clearer ownership, and infrastructure that is easier to operate as your estate expands across branches and data centers.",
    heroImage: "/images/services/heroes/network-infrastructure-hero.png",
    capabilities: [
      {
        title: "Network design & refresh",
        description: "Campus, branch, and data-center networking built for uptime and scale.",
      },
      {
        title: "Secure connectivity",
        description: "Perimeter, segmentation, and access patterns that reduce risk without blocking work.",
      },
      {
        title: "Infrastructure modernization",
        description: "Server, storage, and platform upgrades sequenced around business continuity.",
      },
      {
        title: "Operations enablement",
        description: "Documentation, handover, and support models your teams can run day to day.",
      },
    ],
    outcomes: [
      {
        title: "Stable connectivity",
        description: "Fewer bottlenecks and clearer paths for growth and hybrid workloads.",
      },
      {
        title: "Stronger security posture",
        description: "Controls designed into the network — not bolted on after incidents.",
      },
      {
        title: "Simpler operations",
        description: "Architectures your teams can monitor, maintain, and expand.",
      },
      {
        title: "Nationwide delivery",
        description: "Implementation support across Synergy’s Pakistan office network.",
      },
    ],
  },
  {
    slug: "on-site-it-support",
    headline: "Put skilled engineers where the work happens",
    lead: "Precision field deployment, troubleshooting, and operational support when remote-only help is not enough.",
    challenge:
      "Critical incidents and project cutovers often need hands on site. Delayed field response stretches downtime and puts delivery timelines at risk.",
    approach:
      "Synergy provides certified engineers for on-premises work — from installation and break-fix to project execution — coordinated through our Karachi HQ and branch presence.",
    benefits:
      "Faster resolution for location-bound issues, cleaner handovers, and practical support that respects how enterprise environments actually run.",
    heroImage: "/images/services/heroes/on-site-it-support-hero.png",
    capabilities: [
      {
        title: "Deployment & rollout",
        description: "Hardware and platform installs executed with checklist discipline.",
      },
      {
        title: "Break-fix support",
        description: "On-site response for issues that cannot be closed remotely.",
      },
      {
        title: "Project engineering",
        description: "Field resources for migrations, refreshes, and multi-site programs.",
      },
      {
        title: "Branch coverage",
        description: "Support coordinated across Karachi, Lahore, Islamabad, and Gilgit.",
      },
    ],
    outcomes: [
      {
        title: "Shorter downtime",
        description: "Hands-on help when minutes matter more than tickets.",
      },
      {
        title: "Cleaner deliveries",
        description: "On-site ownership through cutover and validation.",
      },
      {
        title: "Local accountability",
        description: "Engineers who understand Pakistani enterprise operating realities.",
      },
      {
        title: "Flexible engagement",
        description: "Project-based or ongoing field support matched to your need.",
      },
    ],
  },
];

export function getServiceDetail(slug: string) {
  return serviceDetails.find((detail) => detail.slug === slug) ?? null;
}
