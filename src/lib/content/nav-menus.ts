import { services } from "@/lib/content/services";
import { partnerDetailPath, partners } from "@/lib/content/partners";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { getRecentBlogPosts } from "@/lib/content/blog-posts";
import { resolveNavIconKey, withNavIcons, type NavIconKey } from "@/lib/content/nav-icons";

export type MegaMenuFeatured = {
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  image?: string | null;
  /** Use for logos/wordmarks (e.g. Dynatrace) instead of photo-style object-cover. */
  imageContain?: boolean;
  icon?: string;
  /** Modern capability bullets shown in the partners featured panel */
  features?: string[];
};

export type MegaMenuLink = {
  label: string;
  href: string;
  icon?: NavIconKey;
  /** Partner / brand mark image — shown instead of Lucide icon when set */
  logoUrl?: string;
  /** When set, hovering this link updates the mega-menu featured panel */
  preview?: MegaMenuFeatured;
};

export type MegaMenuColumn = {
  heading: string;
  links: MegaMenuLink[];
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

const recentPost = getRecentBlogPosts(1)[0];

/** Featured panel payload for a partner row in the Partners mega menu. */
export function partnerFeaturedPreview(partner: {
  name: string;
  slug?: string;
  logo?: string;
  category?: string;
  shortDescription?: string;
  taglines?: string[];
  keySolutions?: string[];
}): MegaMenuFeatured {
  const modernFeatures = (partner.keySolutions || []).slice(0, 4);

  if (partner.slug === "dynatrace") {
    return {
      eyebrow: dynatracePartner.badge,
      title: dynatracePartner.headline,
      description: dynatracePartner.subheadline,
      href: "/partners/dynatrace",
      ctaLabel: "View partner",
      image: dynatracePartner.logo,
      imageContain: true,
      icon: "handshake",
      features: modernFeatures.length
        ? modernFeatures
        : [
            "AI-powered full-stack observability",
            "Automated root-cause analysis",
            "Digital experience monitoring",
            "Cloud & Kubernetes visibility",
          ],
    };
  }

  return {
    eyebrow: partner.category || "Technology principal",
    title: partner.taglines?.[0] || `Synergy × ${partner.name}`,
    description:
      partner.shortDescription ||
      `Synergy Computers delivers ${partner.name} solutions for enterprises across Pakistan.`,
    href: partnerDetailPath(partner),
    ctaLabel: "View partner",
    image: partner.logo,
    imageContain: true,
    icon: "handshake",
    features: modernFeatures,
  };
}

export function partnerNavLink(partner: {
  name: string;
  slug?: string;
  logo?: string;
  category?: string;
  shortDescription?: string;
  taglines?: string[];
  keySolutions?: string[];
}): MegaMenuLink {
  return {
    label: partner.name,
    href: partnerDetailPath(partner),
    logoUrl: partner.logo,
    preview: partnerFeaturedPreview(partner),
  };
}

function serviceLinks(list: typeof services) {
  return withNavIcons(
    list.map((s) => ({
      label: s.title,
      href: `/services/${s.slug}`,
      icon: resolveNavIconKey(`/services/${s.slug}`, s.title),
    })),
  );
}

/** Menus whose Lucide icons are edited in Admin → Navigation → Mega menus. */
export const MEGA_MENU_ICON_KEYS = ["/about", "/resources"] as const;
export type MegaMenuIconKey = (typeof MEGA_MENU_ICON_KEYS)[number];

export const MEGA_MENU_ICON_SECTION_LABELS: Record<MegaMenuIconKey, string> = {
  "/about": "About (Company)",
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
        heading: "Enterprise Infrastructure",
        links: serviceLinks(servicesLeft),
      },
      {
        heading: "Managed Operations",
        links: serviceLinks(servicesRight),
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
      imageContain: true,
      icon: "handshake",
    },
    columns: [
      {
        heading: "Technology principals",
        links: partners.slice(0, 5).map((p) => partnerNavLink(p)),
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
