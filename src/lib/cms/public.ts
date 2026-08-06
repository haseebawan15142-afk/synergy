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
import { clients as localClients, type ClientLogo } from "@/lib/content/clients";
import {
  getServiceDetail,
  type ServiceCapability,
  type ServiceDetail,
  type ServiceOutcome,
} from "@/lib/content/service-details";
import { siteConfig } from "@/lib/content/site";
import { cachedCms } from "@/lib/cms/cache";

function firebaseReady() {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return cachedCms("settings:site", async () => {
    if (!firebaseReady()) return mapSiteConfig();
    try {
      const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.settings, DOCS.settingsSite));
      if (!snap.exists()) return mapSiteConfig();
      return { ...DEFAULT_SITE_SETTINGS, ...mapSiteConfig(), ...(snap.data() as Partial<SiteSettings>) };
    } catch {
      return mapSiteConfig();
    }
  });
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
    fax: siteConfig.fax,
  };
}

export async function fetchThemeTokens(): Promise<ThemeTokens> {
  return cachedCms("theme:tokens", async () => {
    if (!firebaseReady()) return DEFAULT_THEME;
    try {
      const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.theme, DOCS.themeTokens));
      if (!snap.exists()) return DEFAULT_THEME;
      return { ...DEFAULT_THEME, ...(snap.data() as Partial<ThemeTokens>) };
    } catch {
      return DEFAULT_THEME;
    }
  });
}

function parsePipeRows(value: unknown): { title: string; description: string }[] {
  return asStringList(value)
    .map((line) => {
      const [titlePart, ...rest] = line.split("|");
      const title = (titlePart || "").trim();
      const description = rest.join("|").trim();
      if (!title) return null;
      return { title, description };
    })
    .filter((row): row is { title: string; description: string } => row !== null);
}

export async function fetchServices(): Promise<Service[]> {
  return cachedCms("services", async () => {
    if (!firebaseReady()) return localServices;
    try {
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.services));
      if (snap.empty) return localServices;
      type Row = Service & { sortOrder: number };
      const fromCms = snap.docs
        .map((d): Row | null => {
          const x = d.data();
          if (x.active === false) return null;
          if (x.status && x.status !== "published") return null;
          const title = String(x.title || "").trim();
          if (!title) return null;
          return {
            slug: String(x.slug || d.id),
            title,
            summary: String(x.shortDescription || x.description || ""),
            image: String(x.imageUrl || x.bannerUrl || x.heroImageUrl || ""),
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((s): s is Row => s !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
        .map(({ sortOrder: _s, ...service }) => service);

      if (!fromCms.length) return localServices;

      const cmsSlugs = new Set(fromCms.map((s) => s.slug.toLowerCase()));
      const localOnly = localServices.filter((s) => !cmsSlugs.has(s.slug.toLowerCase()));
      return [...fromCms, ...localOnly];
    } catch {
      return localServices;
    }
  });
}

export async function fetchServiceBySlug(
  slug: string,
): Promise<{ service: Service; detail: ServiceDetail } | null> {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;

  const localService = localServices.find((s) => s.slug.toLowerCase() === needle) ?? null;
  const localDetail = getServiceDetail(needle);

  let cms: Record<string, unknown> | null = null;
  if (firebaseReady()) {
    try {
      const q = query(
        collection(getFirebaseDb(), COLLECTIONS.services),
        where("slug", "==", slug.trim()),
        limit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        cms = snap.docs[0].data() as Record<string, unknown>;
      } else {
        const all = await getDocs(collection(getFirebaseDb(), COLLECTIONS.services));
        const match = all.docs.find((d) => {
          const x = d.data();
          return String(x.slug || d.id).toLowerCase() === needle;
        });
        if (match) cms = match.data() as Record<string, unknown>;
      }
    } catch {
      cms = null;
    }
  }

  const cmsLive =
    cms &&
    cms.active !== false &&
    (!cms.status || String(cms.status) === "published")
      ? cms
      : null;

  if (!cmsLive && !localService) return null;

  const title = String(cmsLive?.title || localService?.title || "").trim();
  if (!title) return null;

  const service: Service = {
    slug: String(cmsLive?.slug || localService?.slug || needle),
    title,
    summary: String(
      cmsLive?.shortDescription ||
        cmsLive?.description ||
        localService?.summary ||
        "",
    ),
    image: String(
      cmsLive?.imageUrl ||
        cmsLive?.bannerUrl ||
        cmsLive?.heroImageUrl ||
        localService?.image ||
        "",
    ),
  };

  const cmsCapabilities = parsePipeRows(cmsLive?.capabilities) as ServiceCapability[];
  const cmsOutcomes = parsePipeRows(cmsLive?.outcomes) as ServiceOutcome[];

  const detail: ServiceDetail = {
    slug: service.slug,
    headline: String(cmsLive?.headline || localDetail?.headline || service.title),
    lead: String(cmsLive?.lead || localDetail?.lead || service.summary),
    challenge: String(cmsLive?.challenge || localDetail?.challenge || ""),
    approach: String(cmsLive?.approach || localDetail?.approach || ""),
    benefits: String(cmsLive?.benefits || localDetail?.benefits || ""),
    capabilities:
      cmsCapabilities.length > 0 ? cmsCapabilities : (localDetail?.capabilities ?? []),
    outcomes: cmsOutcomes.length > 0 ? cmsOutcomes : (localDetail?.outcomes ?? []),
    heroImage: String(
      cmsLive?.heroImageUrl ||
        cmsLive?.bannerUrl ||
        cmsLive?.imageUrl ||
        localDetail?.heroImage ||
        service.image ||
        "",
    ),
  };

  if (!detail.challenge && !detail.approach && !localDetail) {
    // CMS-only stub without rich fields — still show a usable page
    detail.challenge =
      detail.challenge ||
      "Organizations need a clear path from assessment to reliable operations.";
    detail.approach =
      detail.approach ||
      "Synergy scopes, designs, and delivers with local delivery discipline.";
    detail.benefits =
      detail.benefits ||
      "Practical outcomes backed by decades of enterprise IT experience in Pakistan.";
  }

  return { service, detail };
}

export async function fetchClients(): Promise<ClientLogo[]> {
  return cachedCms("clients", async () => {
    if (!firebaseReady()) return localClients;
    try {
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.clients));
      if (snap.empty) return localClients;

      type Row = ClientLogo & { sortOrder: number };
      const fromCms = snap.docs
        .map((d): Row | null => {
          const x = d.data();
          if (x.active === false) return null;
          const name = String(x.name || "").trim();
          const logo = String(x.logoUrl || x.logo || "").trim();
          if (!name || !logo) return null;
          const slug =
            String(x.slug || "").trim() ||
            name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          return {
            name,
            slug,
            logo,
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((c): c is Row => c !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

      if (!fromCms.length) return localClients;

      const mapped = fromCms.map(({ sortOrder: _s, ...client }) => client);
      const cmsSlugs = new Set(mapped.map((c) => c.slug.toLowerCase()));
      const localOnly = localClients.filter((c) => !cmsSlugs.has(c.slug.toLowerCase()));
      return [...mapped, ...localOnly];
    } catch {
      return localClients;
    }
  });
}

export async function fetchFooterNav(): Promise<NavItemDoc[]> {
  const cms = await fetchNav(DOCS.navigationFooter);
  if (cms?.length) return cms.filter((item) => !item.hidden);
  return [
    { id: "about", label: "About", href: "/about" },
    { id: "services", label: "Services", href: "/services" },
    { id: "partners", label: "Partners", href: "/partners" },
    { id: "resources", label: "Resources", href: "/resources" },
    { id: "contact", label: "Contact", href: "/contact" },
  ];
}

function isUsablePersonName(name: string) {
  const n = name.trim().toLowerCase();
  return Boolean(n) && n !== "n/a" && n !== "na" && n !== "null" && n !== "undefined";
}

export async function fetchLeadership(): Promise<LeadershipMember[]> {
  return cachedCms("leadership", async () => {
    if (!firebaseReady()) return localLeadership;
    try {
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.leadership));
      if (snap.empty) return localLeadership;

      type LeadershipRow = LeadershipMember & { sortOrder: number };
      const rows = snap.docs
        .map((d): LeadershipRow | null => {
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
        .filter((x): x is LeadershipRow => x !== null);

      if (!rows.length) return localLeadership;

      rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      return rows.map(({ sortOrder: _sortOrder, ...member }) => member);
    } catch {
      return localLeadership;
    }
  });
}

function mapBlogDoc(id: string, x: Record<string, unknown>): BlogPostMeta {
  const publishedAt = x.publishedAt;
  let date = "";
  if (typeof publishedAt === "string") date = publishedAt;
  else if (publishedAt && typeof publishedAt === "object" && "seconds" in publishedAt) {
    date = new Date(Number((publishedAt as { seconds: number }).seconds) * 1000).toISOString();
  } else if (typeof x.scheduledAt === "string") {
    date = x.scheduledAt;
  } else if (x.updatedAt && typeof x.updatedAt === "object" && "seconds" in x.updatedAt) {
    date = new Date(Number((x.updatedAt as { seconds: number }).seconds) * 1000).toISOString();
  }

  return {
    slug: String(x.slug || id),
    title: String(x.title || ""),
    date,
    legacyUrl: "",
    image: x.featuredImageUrl ? String(x.featuredImageUrl) : null,
    category: String(x.category || "General"),
    relatedServiceSlug: String(x.relatedServiceSlug || ""),
    bodyHtml: x.bodyHtml ? String(x.bodyHtml) : undefined,
    excerpt: x.excerpt ? String(x.excerpt) : undefined,
  };
}

/**
 * Published blogs for the public site.
 * Uses status==published query (matches Firestore rules). Avoids orderBy(publishedAt)
 * so docs without that field are still returned. Merges CMS + local-only slugs.
 */
export async function fetchPublishedBlogs(max = 200): Promise<BlogPostMeta[]> {
  return cachedCms(`blogs:${max}`, async () => {
    if (!firebaseReady()) return localBlogs.slice(0, max);
    try {
      // Constraint must match public read rule (status == published) or the
      // whole list query fails when drafts exist in the collection.
      const q = query(
        collection(getFirebaseDb(), COLLECTIONS.blogs),
        where("status", "==", "published"),
        limit(Math.min(max, 500)),
      );
      const snap = await getDocs(q);
      const fromCms = snap.docs
        .map((d) => mapBlogDoc(d.id, d.data() as Record<string, unknown>))
        .filter((b) => b.title && b.slug)
        .sort((a, b) => {
          const ta = Date.parse(a.date) || 0;
          const tb = Date.parse(b.date) || 0;
          return tb - ta;
        });

      const cmsSlugs = new Set(fromCms.map((b) => b.slug.toLowerCase()));
      const localOnly = localBlogs.filter((b) => !cmsSlugs.has(b.slug.toLowerCase()));
      return [...fromCms, ...localOnly].slice(0, max);
    } catch {
      return localBlogs.slice(0, max);
    }
  });
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPostMeta | null> {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;

  if (firebaseReady()) {
    try {
      const q = query(
        collection(getFirebaseDb(), COLLECTIONS.blogs),
        where("slug", "==", slug.trim()),
        where("status", "==", "published"),
        limit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return mapBlogDoc(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>);
      }
      // Fallback: slug field may differ from doc id
      const all = await fetchPublishedBlogs(500);
      const hit = all.find((b) => b.slug.toLowerCase() === needle);
      if (hit) return hit;
    } catch {
      /* fall through to local */
    }
  }

  return localBlogs.find((b) => b.slug.toLowerCase() === needle) ?? null;
}

/**
 * Open careers. Must query status==open — an unfiltered collection read fails
 * under Firestore rules when draft/closed jobs exist (admin-only docs).
 */
export async function fetchOpenJobs() {
  return cachedCms("careers:open", async () => {
    if (!firebaseReady()) return localJobs;
    try {
      const q = query(
        collection(getFirebaseDb(), COLLECTIONS.careers),
        where("status", "==", "open"),
      );
      const snap = await getDocs(q);
      const fromCms = snap.docs
        .map((d) => {
          const x = d.data();
          if (x.active === false) return null;
          return {
            slug: String(x.slug || d.id),
            title: String(x.title || ""),
            department: String(x.department || ""),
            location: String(x.location || ""),
            type: (x.type || "Full-time") as "Full-time" | "Internship" | "Contract",
          };
        })
        .filter((x): x is (typeof localJobs)[number] => !!x?.title)
        .sort((a, b) => a.title.localeCompare(b.title));

      const cmsSlugs = new Set(fromCms.map((j) => j.slug.toLowerCase()));
      const localOnly = localJobs.filter((j) => !cmsSlugs.has(j.slug.toLowerCase()));
      // CMS openings first (admin-managed), then any local-only seed roles.
      return [...fromCms, ...localOnly];
    } catch {
      return localJobs;
    }
  });
}

function slugifyPartnerName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function withPartnerFallbacks(partner: Partner): Partner {
  const slug = partner.slug || slugifyPartnerName(partner.name);
  return {
    ...partner,
    slug,
    taglines: partner.taglines ?? [],
    keySolutions: partner.keySolutions ?? [],
    shortDescription: partner.shortDescription ?? "",
    overview: partner.overview ?? "",
    heroImageUrl: partner.heroImageUrl ?? "",
    category: partner.category ?? "",
  };
}

export async function fetchPartners(): Promise<Partner[]> {
  return cachedCms("partners", async () => {
    if (!firebaseReady()) {
      return localPartners.map(withPartnerFallbacks);
    }
    try {
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.partners));
      if (snap.empty) return localPartners.map(withPartnerFallbacks);
      type PartnerRow = Required<
        Pick<
          Partner,
          | "name"
          | "logo"
          | "href"
          | "slug"
          | "heroImageUrl"
          | "taglines"
          | "shortDescription"
          | "overview"
          | "keySolutions"
          | "category"
        >
      > & { sortOrder: number };

      const rows = snap.docs
        .map((d): PartnerRow | null => {
          const x = d.data();
          if (x.active === false) return null;
          const name = String(x.name || "");
          if (!name) return null;
          const slug = String(x.slug || "").trim() || slugifyPartnerName(name);
          return {
            name,
            logo: String(x.logoUrl || x.logo || ""),
            href: String(x.website || x.href || "#"),
            slug,
            heroImageUrl: String(x.heroImageUrl || ""),
            taglines: asStringList(x.taglines),
            shortDescription: String(x.shortDescription || ""),
            overview: String(x.overview || ""),
            keySolutions: asStringList(x.keySolutions),
            category: String(x.category || ""),
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((p): p is PartnerRow => p !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

      const fromCms = rows.map(({ sortOrder: _sortOrder, ...partner }) =>
        withPartnerFallbacks(partner),
      );
      const cmsSlugs = new Set(
        fromCms.map((p) => (p.slug || slugifyPartnerName(p.name)).toLowerCase()),
      );
      // Keep CMS order, then append local-only partners (e.g. Company Profile 2026 additions).
      const localOnly = localPartners
        .map(withPartnerFallbacks)
        .filter((p) => !cmsSlugs.has((p.slug || slugifyPartnerName(p.name)).toLowerCase()));

      return [...fromCms, ...localOnly];
    } catch {
      return localPartners.map(withPartnerFallbacks);
    }
  });
}

export async function fetchPartnerBySlug(slug: string): Promise<Partner | null> {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;
  const all = await fetchPartners();
  return all.find((partner) => (partner.slug || slugifyPartnerName(partner.name)) === needle) ?? null;
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
