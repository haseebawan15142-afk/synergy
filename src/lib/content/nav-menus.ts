import { services } from "@/lib/content/services";
import { industries } from "@/lib/content/industries";
import { partnerDetailPath, partners } from "@/lib/content/partners";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { getRecentBlogPosts } from "@/lib/content/blog-posts";

export type MegaMenuLink = {
  label: string;
  href: string;
};

export type MegaMenuColumn = {
  heading: string;
  links: MegaMenuLink[];
};

export type MegaMenuFeatured = {
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  image?: string | null;
  icon?: string;
};

export type MegaMenuConfig = {
  featured: MegaMenuFeatured;
  columns: MegaMenuColumn[];
};

const half = <T,>(arr: T[]): [T[], T[]] => {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
};

const [servicesLeft, servicesRight] = half(services);
const featuredService = services[0];

const [industriesLeft, industriesRight] = half(industries);
const featuredIndustry = industries.find((i) => i.slug === "healthcare") ?? industries[0];

const [partnersLeft, partnersRight] = half(partners);

const recentPost = getRecentBlogPosts(1)[0];

export const navMegaMenus: Record<string, MegaMenuConfig> = {
  "/services": {
    featured: {
      eyebrow: "Featured service",
      title: featuredService.title,
      description: featuredService.summary,
      href: `/services/${featuredService.slug}`,
      ctaLabel: "Learn more",
      image: featuredService.image,
    },
    columns: [
      {
        heading: "Infrastructure & Support",
        links: servicesLeft.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
      },
      {
        heading: "Cloud & Data",
        links: servicesRight.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
      },
    ],
  },

  "/industries": {
    featured: {
      eyebrow: "Featured industry",
      title: featuredIndustry.title,
      description: featuredIndustry.summary,
      href: `/industries/${featuredIndustry.slug}`,
      ctaLabel: "Learn more",
      icon: "landmark",
    },
    columns: [
      {
        heading: "Industries",
        links: industriesLeft.map((i) => ({ label: i.title, href: `/industries/${i.slug}` })),
      },
      {
        heading: "\u00A0",
        links: industriesRight.map((i) => ({ label: i.title, href: `/industries/${i.slug}` })),
      },
    ],
  },

  "/partners": {
    featured: {
      eyebrow: "Exclusive partner · Pakistan",
      title: dynatracePartner.headline,
      description: dynatracePartner.subheadline,
      href: "/partners/dynatrace",
      ctaLabel: "View partner",
      image: dynatracePartner.logo,
    },
    columns: [
      {
        heading: "Technology principals",
        links: partnersLeft.map((p) => ({ label: p.name, href: partnerDetailPath(p) })),
      },
      {
        heading: "\u00A0",
        links: partnersRight.map((p) => ({ label: p.name, href: partnerDetailPath(p) })),
      },
    ],
  },

  "/about": {
    featured: {
      eyebrow: "40+ years in enterprise IT",
      title: "Who We Are",
      description:
        "Pakistan's premium IT solutions provider — our story, vision, and mission since the early days of the country's IT industry.",
      href: "/about#who-we-are",
      ctaLabel: "Read our story",
      icon: "building",
    },
    columns: [
      {
        heading: "Company",
        links: [
          { label: "Who We Are", href: "/about#who-we-are" },
          { label: "Message from our CEO", href: "/about#ceo-message-heading" },
          { label: "Board of Directors", href: "/about#board" },
          { label: "Our Accomplishments", href: "/about#accomplishments" },
        ],
      },
    ],
  },

  /** Insights — Systems Ltd–style: Blog + Newsletter (not partners). */
  "/resources": {
    featured: recentPost
      ? {
          eyebrow: "Latest blog",
          title: recentPost.title,
          description: "News and service insights from Synergy Computers.",
          href: `/resources/${recentPost.slug}`,
          ctaLabel: "Read article",
          image: recentPost.image,
        }
      : {
          eyebrow: "Insights",
          title: "Blog & newsletter",
          description: "Articles and partner editions from Synergy Computers.",
          href: "/resources",
          ctaLabel: "Browse blog",
        },
    columns: [
      {
        heading: "Explore",
        links: [
          { label: "Blog", href: "/resources" },
          { label: "Newsletter", href: "/newsletter" },
        ],
      },
    ],
  },
};
