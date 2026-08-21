export type ProblemCard = {
  serviceSlug: string;
  label: string;
  problem: string;
  solution: string;
};

export const problemCards: ProblemCard[] = [
  {
    serviceSlug: "network-infrastructure",
    label: "Intelligent infrastructure",
    problem: "Legacy systems that can't keep pace with growth",
    solution:
      "We help you modernize networks and systems with vendor-aligned architectures — from strategy through deployment and ongoing optimization.",
  },
  {
    serviceSlug: "data-backup-recovery",
    label: "Data resilience",
    problem: "Unclear recovery paths when outages or data loss occur",
    solution:
      "We implement protection and availability solutions with leading data principals so you can restore confidence in your data.",
  },
  {
    serviceSlug: "on-site-it-support",
    label: "Precision field support",
    problem: "Critical issues that can't wait for remote-only support",
    solution:
      "Engineers on the ground across our branch network for implementation, break-fix, and project delivery when you need hands on site.",
  },
];
