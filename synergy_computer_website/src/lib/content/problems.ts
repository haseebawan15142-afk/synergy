export type ProblemCard = {
  serviceSlug: string;
  label: string;
  problem: string;
  solution: string;
};

export const problemCards: ProblemCard[] = [
  {
    serviceSlug: "network-infrastructure",
    label: "IT infrastructure",
    problem: "Legacy systems that can't keep pace with growth",
    solution:
      "We help you modernize networks and infrastructure with vendor-aligned solutions — from strategy through deployment and ongoing optimization.",
  },
  {
    serviceSlug: "managed-it",
    label: "Managed services",
    problem: "Teams buried in alerts and operational firefighting",
    solution:
      "Our 24×7 maintenance and support model frees your staff to focus on strategic initiatives while we handle day-to-day operations.",
  },
  {
    serviceSlug: "data-backup-recovery",
    label: "Data availability",
    problem: "Unclear recovery paths when outages or data loss occur",
    solution:
      "We implement backup and availability solutions with leading data protection partners so you can restore confidence in your data.",
  },
  {
    serviceSlug: "microsoft-365-cloud",
    label: "Cloud & collaboration",
    problem: "Cloud adoption without governance or measurable outcomes",
    solution:
      "We guide Microsoft 365 and cloud programs with practical rollout, security baselines, and adoption aligned to your goals.",
  },
  {
    serviceSlug: "on-site-it-support",
    label: "On-site support",
    problem: "Critical issues that can't wait for remote-only support",
    solution:
      "Engineers on the ground across our branch network for implementation, break-fix, and project delivery when you need hands on site.",
  },
];
