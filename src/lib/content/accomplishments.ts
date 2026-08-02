/**
 * Shown on /about under "Our Accomplishments".
 * Replace placeholder figures, certifications, and milestones with real data.
 */
export const accomplishmentStats = [
  { value: "40+", label: "Years in enterprise IT" },
  { value: "24×7", label: "Client support coverage" },
  { value: "100+", label: "Enterprise clients served" },
  { value: "7", label: "Industry sectors served" },
] as const;

export type Milestone = {
  year: string;
  title: string;
  description: string;
};

export const milestones: Milestone[] = [
  {
    year: "1980s",
    title: "Founded in Karachi",
    description: "Synergy Computers begins operations at the start of Pakistan's IT industry.",
  },
  {
    year: "2000s",
    title: "Enterprise expansion",
    description: "Grew into banking, power generation, and healthcare with large-scale infrastructure deployments.",
  },
  {
    year: "2010s",
    title: "Strategic vendor partnerships",
    description: "Formalized partnerships with leading global technology vendors to expand solution breadth.",
  },
  {
    year: "Today",
    title: "40+ years of trusted delivery",
    description: "Continuing to serve Pakistan's leading enterprises with infrastructure, applications, and 24×7 support.",
  },
] as const;

export type Certification = {
  name: string;
  issuer: string;
};

export const certifications: Certification[] = [
  { name: "Replace with certification", issuer: "Issuing body" },
  { name: "Replace with certification", issuer: "Issuing body" },
  { name: "Replace with certification", issuer: "Issuing body" },
] as const;
