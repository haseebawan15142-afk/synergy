/** Firestore collection / document path constants */

export const COLLECTIONS = {
  settings: "settings",
  theme: "theme",
  navigation: "navigation",
  blogs: "blogs",
  categories: "categories",
  tags: "tags",
  leadership: "leadership",
  alumni: "alumni",
  services: "services",
  industries: "industries",
  partners: "partners",
  clients: "clients",
  caseStudies: "caseStudies",
  testimonials: "testimonials",
  gallery: "gallery",
  galleryAlbums: "galleryAlbums",
  careers: "careers",
  events: "events",
  faq: "faq",
  messages: "messages",
  newsletter: "newsletter",
  newsletterIssues: "newsletterIssues",
  offices: "offices",
  media: "media",
  seo: "seo",
  analytics: "analytics",
  users: "users",
  auditLogs: "auditLogs",
  activities: "activities",
} as const;

export const DOCS = {
  settingsSite: "site",
  themeTokens: "tokens",
  navigationPrimary: "primary",
  navigationFooter: "footer",
  /** About / Industries / Insights mega-menu link icons */
  navigationMegaMenus: "megaMenus",
} as const;

export type ContentStatus = "draft" | "published" | "archived";
export type UserRole = "admin" | "editor" | "viewer";

export type TimestampLike = Date | { seconds: number; nanoseconds: number } | string | null;

export type AdminUser = {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type SiteSettings = {
  companyName: string;
  tagline: string;
  legalName: string;
  description: string;
  email: string;
  phoneDisplay: string;
  phoneTel: string;
  phones: string[];
  fax?: string;
  addressLine: string;
  addressCity: string;
  addressCountry: string;
  socialLinkedin: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  googleMapsUrl: string;
  businessHours: string;
  copyright: string;
  mission: string;
  vision: string;
  /** Contact page copy (Admin → Website Settings) */
  contactTitle?: string;
  contactDescription?: string;
  contactFormIntro?: string;
  contactAsideText?: string;
  /** Brand media — Admin → Website Settings → Brand media (public site reads these). */
  logoUrl?: string;
  darkLogoUrl?: string;
  faviconUrl?: string;
  footerLogoUrl?: string;
  heroBackgroundUrl?: string;
  companyVideoUrl?: string;
  ogImageUrl?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  updatedAt?: TimestampLike;
  updatedBy?: string;
};

export type Activity = {
  id?: string;
  type: string;
  message: string;
  actorEmail?: string;
  actorUid?: string;
  entity?: string;
  entityId?: string;
  createdAt?: TimestampLike;
};

export type ContactMessage = {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "archived";
  /** Legacy / form default — prefer `replied` + `repliedAt` for new replies. */
  replyStatus?: "none" | "replied";
  replied?: boolean;
  repliedAt?: TimestampLike;
  createdAt?: TimestampLike;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: "Synergy Computers",
  tagline: "IT Solutions Pakistan",
  legalName: "Synergy Computers (Pvt.) Ltd.",
  description:
    "Pakistan's premium IT solutions provider — infrastructure, enterprise applications, security, and 24×7 support for over 40 years.",
  email: "info@synergy.net.pk",
  phoneDisplay: "021-34527060",
  phoneTel: "+922134527060",
  phones: ["021-34527060", "021-34540908", "021-34547068"],
  fax: "021-34540907",
  addressLine: "56-D, K.D.A Scheme No.1 Main Miran Muhammad Shah Road",
  addressCity: "Karachi",
  addressCountry: "Pakistan",
  socialLinkedin: "https://www.linkedin.com/company/synergy-computers/",
  socialFacebook: "https://www.facebook.com/SynergyCompuetsPvtLtd/",
  socialTwitter: "",
  socialInstagram: "",
  googleMapsUrl: "",
  businessHours: "Mon–Fri, 9:00 AM – 6:00 PM",
  copyright: "© Synergy Computers (Pvt.) Ltd. All rights reserved.",
  mission: "",
  vision: "",
  contactTitle: "Contact us",
  contactDescription: "Reach our team for sales, support, and project inquiries.",
  contactFormIntro: "Send a message and we'll respond as soon as we can.",
  contactAsideText:
    "Prefer email or phone? Use the form, or explore our offices on the map below and open free OpenStreetMap directions for the exact location.",
};
