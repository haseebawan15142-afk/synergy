/**
 * Shown on /about under "Our Accomplishments".
 * Numeric claims limited to Company Profile 2026 where possible.
 * See MISSING-CONTENT.md.
 */
import { profileStats } from "@/lib/content/company-profile";

export const accomplishmentStats = profileStats;

export type Milestone = {
  year: string;
  title: string;
  description: string;
};

export const milestones: Milestone[] = [
  {
    year: "1981",
    title: "Founded as a technology partner",
    description:
      "Synergy Computers (Pvt.) Ltd. begins serving Pakistan as a trusted technology partner (Company Profile 2026).",
  },
  {
    year: "Growth",
    title: "Nationwide presence",
    description:
      "Expanded with offices in Karachi, Islamabad, Lahore, and Gilgit, backed by 200+ professionals.",
  },
  {
    year: "Partnerships",
    title: "Global technology alliances",
    description:
      "Built strategic partnerships with leading global technology providers to deliver one-window IT solutions.",
  },
  {
    year: "Today",
    title: "Decades of enterprise delivery",
    description:
      "Continuing to modernize IT landscapes across banking, telecom, power & utilities, healthcare, education, hospitality, and enterprise sectors.",
  },
];

export type Certification = {
  name: string;
  issuer: string;
};

/**
 * TODO: Company Profile 2026 does not list named certifications or awards.
 * Keep empty until official certificate names are supplied.
 */
export const certifications: Certification[] = [];
