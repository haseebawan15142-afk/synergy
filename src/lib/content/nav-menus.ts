import { services } from "@/lib/content/services";
import { industries } from "@/lib/content/industries";
import { partnerDetailPath, partners } from "@/lib/content/partners";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { getRecentBlogPosts } from "@/lib/content/blog-posts";
import { resolveNavIconKey, withNavIcons, type NavIconKey } from "@/lib/content/nav-icons";

export type MegaMenuLink = {
  label: string;
  href: string;
  icon?: NavIconKey;
  /** Partner / brand mark image — shown instead of Lucide icon when set */
  logoUrl?: string;
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
  /** Optional “See all …” row under the link columns */
  seeAll?: { label: string; href: string };
};

const half = <T,>(arr: T[]): [T[], T[]] => {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
};

const [servicesLeft, servicesRight] = half(services);
const featuredService = services[0];

const [industriesLeft, industriesRight] = half(industries);
const featuredIndustry = industries.find((i) => i.slug === "healthcare") ?? industries[0];

const recentPost = getRecentBlogPosts(1)[0];

function serviceLinks(list: typeof services) {
  return withNavIcons(
    list.map((s) => ({
      label: s.title,
      href: `/services/${s.slug}`,
      icon: resolveNavIconKey(`/services/${s.slug}`, s.title),
    })),
  );
}

function industryLinks(list: typeof industries) {
  return withNavIcons(
    list.map((i) => ({
      label: i.title,
      href: `/industries/${i.slug}`,
      icon: resolveNavIconKey(`/industries/${i.slug}`, i.title),
    })),
  );
}

/** Menus whose Lucide icons are edited in Admin → Navigation → Mega menus. */
export const MEGA_MENU_ICON_KEYS = ["/about", "/industries", "/resources"] as const;
export type MegaMenuIconKey = (typeof MEGA_MENU_ICON_KEYS)[number];

export const MEGA_MENU_ICON_SECTION_LABELS: Record<MegaMenuIconKey, string> = {
  "/about": "About (Company)",
  "/industries": "Industries",
  "/resources": "Insights",
};

/** Default link rows + icons for seeding / fallback (Partners & Services excluded). */
export function defaultMegaMenuIconLinks(): Record<
  MegaMenuIconKey,
  { links: MegaMenuLink[] }
> {
  return {
    "/about": {
      links: withNavIcons([
        { label: "Who We Are", href: "/about#who-we-are", icon: "building2" },
        { label: "Message from our CEO", href: "/about#ceo-message-heading", icon: "messageSquare" },
        { label: "Board of Directors", href: "/about#board", icon: "users" },
        { label: "Our Accomplishments", href: "/about#accomplishments", icon: "award" },
      ]),
    },
    "/industries": {
      links: withNavIcons([
        ...industryLinks(industriesLeft),
        ...industryLinks(industriesRight),
      ]),
    },
    "/resources": {
      links: withNavIcons([
        { label: "Blog", href: "/resources", icon: "newspaper" },
        { label: "Newsletter", href: "/newsletter", icon: "mail" },
      ]),
    },
  };
}

export const navMegaMenus: Record<string, MegaMenuConfig> = {
  "/services": {
    featured: {
      eyebrow: "Featured service",
      title: featuredService.title,
      description: featuredService.summary,
      href: `/services/${featuredService.slug}`,
      ctaLabel: "Learn more",
      image: featuredService.image,
      icon: "headset",
    },
    columns: [
      {
        heading: "Infrastructure & Support",
        links: serviceLinks(servicesLeft),
      },
      {
        heading: "Cloud & Data",
        links: serviceLinks(servicesRight),
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
        links: industryLinks(industriesLeft),
      },
      {
        heading: "Sectors",
        links: industryLinks(industriesRight),
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
      icon: "handshake",
    },
    columns: [
      {
        heading: "Technology principals",
        links: partners.slice(0, 5).map((p) => ({
          label: p.name,
          href: partnerDetailPath(p),
          logoUrl: p.logo,
        })),
      },
    ],
    seeAll: { label: "See all partners", href: "/partners" },
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
        links: withNavIcons([
          { label: "Who We Are", href: "/about#who-we-are", icon: "building2" },
          { label: "Message from our CEO", href: "/about#ceo-message-heading", icon: "messageSquare" },
          { label: "Board of Directors", href: "/about#board", icon: "users" },
          { label: "Our Accomplishments", href: "/about#accomplishments", icon: "award" },
        ]),
      },
    ],
  },

  "/resources": {
    featured: recentPost
      ? {
          eyebrow: "Latest blog",
          title: recentPost.title,
          description: "News and service insights from Synergy Computers.",
          href: `/resources/${recentPost.slug}`,
          ctaLabel: "Read article",
          image: recentPost.image,
          icon: "newspaper",
        }
      : {
          eyebrow: "Insights",
          title: "Blog & newsletter",
          description: "Articles and partner editions from Synergy Computers.",
          href: "/resources",
          ctaLabel: "Browse blog",
          icon: "newspaper",
        },
    columns: [
      {
        heading: "Explore",
        links: withNavIcons([
          { label: "Blog", href: "/resources", icon: "newspaper" },
          { label: "Newsletter", href: "/newsletter", icon: "mail" },
        ]),
      },
    ],
  },
};
