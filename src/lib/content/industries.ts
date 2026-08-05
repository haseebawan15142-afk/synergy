export type Industry = {
  slug: string;
  title: string;
  summary: string;
};

/**
 * Industry sectors. Banking, Telecom, and Power & Utilities wording aligned to
 * Company Profile 2026 (p.2). Remaining sectors retained from the existing site
 * where they overlap with the profile (Healthcare, Education, Hospitality).
 */
export const industries: Industry[] = [
  {
    slug: "banking-financial-services",
    title: "Banking & financial services",
    summary:
      "Secure, resilient technology for banks and financial institutions modernizing critical IT landscapes.",
  },
  {
    slug: "telecommunications",
    title: "Telecommunications",
    summary:
      "Infrastructure and operations support that keeps telecom environments competitive and future-ready.",
  },
  {
    slug: "power-utilities",
    title: "Power & utilities",
    summary:
      "Reliable IT infrastructure and support for power and utility organizations that cannot afford downtime.",
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    summary:
      "Secure, available systems that support care delivery and operational resilience.",
  },
  {
    slug: "education",
    title: "Education",
    summary:
      "Technology services and library solutions that help institutions operate efficiently at scale.",
  },
  {
    slug: "hospitality",
    title: "Hospitality",
    summary:
      "Dependable IT for hospitality organizations that need uptime, security, and responsive support.",
  },
  {
    slug: "enterprise",
    title: "Large enterprise",
    summary:
      "End-to-end hardware, software, integration, and support for prominent enterprise organizations.",
  },
  {
    slug: "government",
    title: "Government & public sector",
    summary:
      "Enterprise solutions for public-sector and regulated environments.",
  },
  {
    slug: "smb",
    title: "Small & medium business",
    // TODO: SMB is retained from the existing site; not named as a sector on PDF p.2.
    summary: "Right-sized IT, support, and infrastructure for growing organizations.",
  },
  {
    slug: "retail-hospitality",
    title: "Retail & hospitality",
    // TODO: PDF lists Hospitality separately; this legacy slug kept for existing links.
    summary: "POS, connectivity, and multi-site operations support.",
  },
];
