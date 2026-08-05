import { officeLocationsDetailed } from "@/lib/content/company-profile";

/** Careers hero background — replace file in `public/images/careers/` or change this path */
export const careersHeroBackground = "/images/careers/hero-background.webp";

export type CareerTrack = {
  title: string;
  description: string;
  icon: "graduation" | "briefcase" | "rocket";
};

export const careerTracks: CareerTrack[] = [
  {
    title: "Graduates",
    description:
      "Fresh graduates get structured onboarding, mentorship, and hands-on exposure to real enterprise IT projects from day one.",
    icon: "graduation",
  },
  {
    title: "Experienced Professionals",
    description:
      "Bring your expertise in infrastructure, cloud, security, or support and grow into senior technical and leadership roles.",
    icon: "briefcase",
  },
  {
    title: "Internship / MTO",
    description:
      "Our Management Trainee & internship programs give students and recent graduates real-world experience across our service lines.",
    icon: "rocket",
  },
] as const;

export type CultureCard = {
  title: string;
  description: string;
  icon: "handshake" | "graduation" | "heart" | "award";
};

export const cultureCards: CultureCard[] = [
  {
    title: "Working at Synergy",
    description:
      "A collaborative, supportive environment where you can learn from senior engineers, work directly with enterprise clients, and grow your career in IT.",
    icon: "handshake",
  },
  {
    title: "Trainees & Internships",
    description:
      "Structured programs that expose interns and management trainees to real infrastructure, support, and delivery work — not just shadowing.",
    icon: "graduation",
  },
  {
    title: "Diversity & Inclusion",
    description:
      "We welcome people from all backgrounds and aim to build a fair, respectful workplace across every team and office.",
    icon: "heart",
  },
  {
    title: "Benefits",
    description:
      "Compensation and benefits are discussed directly with candidates during the hiring process based on role and experience.",
    icon: "award",
  },
] as const;

export type HiringStep = {
  step: string;
  title: string;
  description: string;
};

export const hiringSteps: HiringStep[] = [
  {
    step: "01",
    title: "Apply",
    description: "Browse open positions below and submit your application with your CV.",
  },
  {
    step: "02",
    title: "Review",
    description: "Our team reviews your application and matches you with the best-fit opportunity.",
  },
  {
    step: "03",
    title: "Interview",
    description: "A competency-based interview process designed to understand your skills and potential.",
  },
  {
    step: "04",
    title: "Onboarding",
    description: "Once selected, we prepare you for your first day and your journey with Synergy Computers.",
  },
] as const;

/** Pakistan offices from Company Profile 2026 (excludes Middle East for careers stats). */
export const officeLocations = officeLocationsDetailed
  .filter((office) => office.country === "Pakistan")
  .map((office) => ({
    city: office.city,
    note: office.isHeadOffice
      ? "Head Office"
      : office.addressPending
        ? "Branch office — address on request"
        : office.addressLines[0] ?? "Branch office",
  }));

export type JobOpening = {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Internship" | "Contract";
};

/**
 * Sample openings — replace with your real, current vacancies.
 * If you don't have live openings right now, you can remove entries here
 * and the page will simply show the "general application" call-to-action.
 */
export const jobOpenings: JobOpening[] = [
  {
    slug: "network-support-engineer",
    title: "Network Support Engineer",
    department: "Infrastructure & Support",
    location: "Karachi",
    type: "Full-time",
  },
  {
    slug: "cloud-systems-administrator",
    title: "Cloud Systems Administrator",
    department: "Cloud & Data",
    location: "Karachi",
    type: "Full-time",
  },
  {
    slug: "business-development-executive",
    title: "Business Development Executive",
    department: "Sales & Business Development",
    location: "Lahore",
    type: "Full-time",
  },
  {
    slug: "it-management-trainee",
    title: "IT Management Trainee",
    department: "Trainee Program",
    location: "Karachi",
    type: "Internship",
  },
] as const;

export const jobDepartments = ["All", ...Array.from(new Set(jobOpenings.map((j) => j.department)))] as const;
export const jobLocations = ["All", ...Array.from(new Set(jobOpenings.map((j) => j.location)))] as const;
