/**
 * Public CMS reads — Firestore first, local content fallback.
 * Safe for client components; also usable from the browser after hydration.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS, DOCS, DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/firebase/collections";
import { DEFAULT_THEME, type ThemeTokens, type NavItemDoc } from "@/lib/admin/types";
import { services as localServices, type Service } from "@/lib/content/services";
import { leadershipTeam as localLeadership, type LeadershipMember } from "@/lib/content/leadership";
import { blogPosts as localBlogs, type BlogPostMeta } from "@/lib/content/blog-posts";
import { jobOpenings as localJobs } from "@/lib/content/careers";
import { partners as localPartners, type Partner } from "@/lib/content/partners";
import { siteConfig } from "@/lib/content/site";

function firebaseReady() {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!firebaseReady()) return mapSiteConfig();
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.settings, DOCS.settingsSite));
    if (!snap.exists()) return mapSiteConfig();
    return { ...DEFAULT_SITE_SETTINGS, ...mapSiteConfig(), ...(snap.data() as Partial<SiteSettings>) };
  } catch {
    return mapSiteConfig();
  }
}

function mapSiteConfig(): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    companyName: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    email: siteConfig.email,
    phoneDisplay: siteConfig.phoneDisplay,
    phoneTel: siteConfig.phoneTel,
    phones: [...siteConfig.phones],
    addressLine: siteConfig.address.line,
    addressCity: siteConfig.address.city,
    addressCountry: siteConfig.address.country,
    socialLinkedin: siteConfig.social.linkedin,
    socialFacebook: siteConfig.social.facebook,
  };
}

export async function fetchThemeTokens(): Promise<ThemeTokens> {
  if (!firebaseReady()) return DEFAULT_THEME;
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.theme, DOCS.themeTokens));
    if (!snap.exists()) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...(snap.data() as Partial<ThemeTokens>) };
  } catch {
    return DEFAULT_THEME;
  }
}

export async function fetchServices(): Promise<Service[]> {
  if (!firebaseReady()) return localServices;
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.services));
    if (snap.empty) return localServices;
    return snap.docs
      .map((d) => {
        const x = d.data();
        if (x.active === false) return null;
        if (x.status && x.status !== "published") return null;
        return {
          slug: String(x.slug || d.id),
          title: String(x.title || ""),
          summary: String(x.shortDescription || x.description || ""),
          image: String(x.imageUrl || x.bannerUrl || ""),
        } satisfies Service;
      })
      .filter((s): s is Service => !!s?.title)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return localServices;
  }
}

function isUsablePersonName(name: string) {
  const n = name.trim().toLowerCase();
  return Boolean(n) && n !== "n/a" && n !== "na" && n !== "null" && n !== "undefined";
}

export async function fetchLeadership(): Promise<LeadershipMember[]> {
  if (!firebaseReady()) return localLeadership;
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.leadership));
    if (snap.empty) return localLeadership;

    const rows = snap.docs
      .map((d) => {
        const x = d.data();
        if (x.active === false) return null;
        const name = String(x.name || "").trim();
        if (!isUsablePersonName(name)) return null;
        const linkedin = String(x.linkedin || "").trim();
        return {
          name,
          title: String(x.designation || x.title || "").trim(),
          bio: String(x.bio || ""),
          photoSrc: x.photoUrl ? String(x.photoUrl) : null,
          linkedin: linkedin || null,
          sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((x): x is LeadershipMember & { sortOrder: number } => !!x);

    if (!rows.length) return localLeadership;

    rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    return rows.map(({ sortOrder: _sortOrder, ...member }) => member);
  } catch {
    return localLeadership;
  }
}

export async function fetchPublishedBlogs(max = 200): Promise<BlogPostMeta[]> {
  if (!firebaseReady()) return localBlogs.slice(0, max);
  try {
    const q = query(
      collection(getFirebaseDb(), COLLECTIONS.blogs),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(max),
    );
    const snap = await getDocs(q);
    if (snap.empty) return localBlogs.slice(0, max);
    return snap.docs.map((d) => {
      const x = d.data();
      return {
        slug: String(x.slug || d.id),
        title: String(x.title || ""),
        date: String(x.publishedAt || x.scheduledAt || ""),
        legacyUrl: "",
        image: x.featuredImageUrl ? String(x.featuredImageUrl) : null,
        category: String(x.category || "General"),
        relatedServiceSlug: String(x.relatedServiceSlug || ""),
      } satisfies BlogPostMeta;
    });
  } catch {
    try {
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.blogs));
      type Row = {
        id: string;
        status?: string;
        slug?: string;
        title?: string;
        publishedAt?: string;
        featuredImageUrl?: string;
        category?: string;
        relatedServiceSlug?: string;
      };
      const published = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Row, "id">) }))
        .filter((x) => x.status === "published");
      if (!published.length) return localBlogs.slice(0, max);
      return published.slice(0, max).map((x) => ({
        slug: String(x.slug || x.id),
        title: String(x.title || ""),
        date: String(x.publishedAt || ""),
        legacyUrl: "",
        image: x.featuredImageUrl ? String(x.featuredImageUrl) : null,
        category: String(x.category || "General"),
        relatedServiceSlug: String(x.relatedServiceSlug || ""),
      }));
    } catch {
      return localBlogs.slice(0, max);
    }
  }
}

export async function fetchOpenJobs() {
  if (!firebaseReady()) return localJobs;
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.careers));
    if (snap.empty) return localJobs;
    return snap.docs
      .map((d) => {
        const x = d.data();
        if (x.status && x.status !== "open") return null;
        if (x.active === false) return null;
        return {
          slug: String(x.slug || d.id),
          title: String(x.title || ""),
          department: String(x.department || ""),
          location: String(x.location || ""),
          type: (x.type || "Full-time") as "Full-time" | "Internship" | "Contract",
        };
      })
      .filter((x): x is (typeof localJobs)[number] => !!x?.title);
  } catch {
    return localJobs;
  }
}

export async function fetchPartners(): Promise<Partner[]> {
  if (!firebaseReady()) return localPartners;
  try {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.partners));
    if (snap.empty) return localPartners;
    return snap.docs
      .map((d) => {
        const x = d.data();
        if (x.active === false) return null;
        const name = String(x.name || "");
        if (!name) return null;
        return {
          name,
          logo: String(x.logoUrl || x.logo || ""),
          href: String(x.website || x.href || "#"),
          sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((p): p is Partner & { sortOrder: number } => !!p)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map(({ name, logo, href }) => ({ name, logo, href }));
  } catch {
    return localPartners;
  }
}

export async function fetchNav(docId: string): Promise<NavItemDoc[] | null> {
  if (!firebaseReady()) return null;
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.navigation, docId));
    if (!snap.exists()) return null;
    const items = snap.data().items as NavItemDoc[] | undefined;
    return items?.length ? items : null;
  } catch {
    return null;
  }
}
