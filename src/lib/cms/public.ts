/**
 * Public CMS reads — Firestore first, stale cache, then local content fallback.
 * Image fields prefer same-origin `/images` / `/brand` assets when a local seed
 * exists so the site keeps rendering if Firebase Storage is unreachable.
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
import {
  DEFAULT_THEME,
  type ThemeTokens,
  type NavItemDoc,
  type MegaMenuIconsDoc,
} from "@/lib/admin/types";
import { services as localServices, type Service } from "@/lib/content/services";
import {
  MEGA_MENU_ICON_KEYS,
  defaultMegaMenuIconLinks,
  type MegaMenuIconKey,
} from "@/lib/content/nav-menus";
import { isNavIconKey } from "@/lib/content/nav-icons";
import { leadershipTeam as localLeadership, type LeadershipMember } from "@/lib/content/leadership";
import { blogPosts as localBlogs, type BlogPostMeta } from "@/lib/content/blog-posts";
import { jobOpenings as localJobs } from "@/lib/content/careers";
import { partners as localPartners, type Partner } from "@/lib/content/partners";
import { clients as localClients, type ClientLogo } from "@/lib/content/clients";
import {
  newsletterIssues as localNewsletterIssues,
  type NewsletterIssue,
} from "@/lib/content/newsletter-issues";
import {
  getServiceDetail,
  type ServiceCapability,
  type ServiceDetail,
  type ServiceOutcome,
} from "@/lib/content/service-details";
import {
  officeLocationsDetailed as localOffices,
  pakistanCityMapPositions,
  type OfficeLocation,
} from "@/lib/content/company-profile";
import { siteConfig } from "@/lib/content/site";
import { blogImagesGenerated } from "@/lib/content/blog-images.generated";
import { cachedCms } from "@/lib/cms/cache";
import { queryCmsDocs, readCmsDoc } from "@/lib/cms/firestore-bridge";
import { resolveResilientAssetUrl } from "@/lib/media/asset-url";

function firebaseReady() {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

/** Cache + stale-on-error, then bundled local content if nothing cached yet. */
async function cmsRead<T>(
  key: string,
  loader: () => Promise<T>,
  fallback: () => T,
  ttlMs?: number,
): Promise<T> {
  try {
    return await cachedCms(key, loader, ttlMs);
  } catch {
    return fallback();
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return cmsRead(
    "settings:site",
    async () => {
      if (!firebaseReady()) return mapSiteConfig();
      const data = await readCmsDoc(COLLECTIONS.settings, DOCS.settingsSite);
      if (!data) return mapSiteConfig();
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...mapSiteConfig(),
        ...(data as Partial<SiteSettings>),
      };
    },
    mapSiteConfig,
    60_000,
  );
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
    socialLinks: [
      {
        id: "default-linkedin",
        platform: "linkedin",
        label: "LinkedIn",
        url: siteConfig.social.linkedin,
        active: true,
      },
      {
        id: "default-facebook",
        platform: "facebook",
        label: "Facebook",
        url: siteConfig.social.facebook,
        active: true,
      },
    ],
    fax: siteConfig.fax,
  };
}

export async function fetchOffices(): Promise<OfficeLocation[]> {
  return cmsRead(
    "offices:v4",
    async () => {
      if (!firebaseReady()) return localOffices;
      const rows = await queryCmsDocs(COLLECTIONS.offices);
      if (!rows.length) return localOffices;

      const localById = new Map(localOffices.map((o) => [o.id, o]));

      type Row = OfficeLocation & { sortOrder: number };
      const fromCms = rows
        .map((d): Row | null => {
          const x = d.data;
          if (x.active === false) return null;
          const label = String(x.label || "").trim();
          const city = String(x.city || "").trim();
          if (!label || !city) return null;
          const id = String(d.id);
          const local = localById.get(id);
          const preset =
            id in pakistanCityMapPositions
              ? pakistanCityMapPositions[id as keyof typeof pakistanCityMapPositions]
              : null;
          const mapX =
            typeof x.mapX === "number"
              ? x.mapX
              : preset
                ? Number.parseFloat(preset.left)
                : undefined;
          const mapY =
            typeof x.mapY === "number"
              ? x.mapY
              : preset
                ? Number.parseFloat(preset.top)
                : undefined;
          const addressLines = Array.isArray(x.addressLines)
            ? x.addressLines.map(String).filter(Boolean)
            : String(x.addressLines || "")
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
          const phones = Array.isArray(x.phones)
            ? x.phones.map(String).filter(Boolean)
            : String(x.phones || "")
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
          const landmarkName = String(x.landmarkName || "").trim();
          const landmarkImage = resolveResilientAssetUrl(
            String(x.landmarkImageUrl || "").trim(),
            local?.landmark?.image,
          );
          const landmarkBackground = resolveResilientAssetUrl(
            String(x.landmarkBackgroundUrl || "").trim(),
            local?.landmark?.background,
          );
          return {
            id,
            label,
            city,
            country: String(x.country || "Pakistan").trim() || "Pakistan",
            isHeadOffice: x.isHeadOffice === true,
            addressLines: addressLines.length ? addressLines : [city],
            phones,
            fax: String(x.fax || "").trim() || undefined,
            email: String(x.email || "info@synergy.net.pk").trim(),
            website: String(x.website || "").trim() || undefined,
            addressPending: x.addressPending === true,
            lat: typeof x.lat === "number" ? x.lat : Number(x.lat) || 0,
            lng: typeof x.lng === "number" ? x.lng : Number(x.lng) || 0,
            mapX,
            mapY,
            landmark:
              landmarkName || landmarkImage || landmarkBackground
                ? {
                    name: landmarkName || city,
                    image: landmarkImage || landmarkBackground,
                    background: landmarkBackground || undefined,
                  }
                : undefined,
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((row): row is Row => row !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.city.localeCompare(b.city));

      if (fromCms.length > 0) {
        return fromCms.map(({ sortOrder: _s, ...office }) => office);
      }
      return localOffices;
    },
    () => localOffices,
    30_000,
  );
}

export async function fetchThemeTokens(): Promise<ThemeTokens> {
  return cmsRead(
    "theme:tokens",
    async () => {
      if (!firebaseReady()) return DEFAULT_THEME;
      const data = await readCmsDoc(COLLECTIONS.theme, DOCS.themeTokens);
      if (!data) return DEFAULT_THEME;
      return { ...DEFAULT_THEME, ...(data as Partial<ThemeTokens>) };
    },
    () => DEFAULT_THEME,
    5_000,
  );
}

export type ActiveEventBanner = {
  presetId: string;
  message: string;
  emoji?: string;
  name?: string;
};

export type ActiveEventHeroVideos = {
  presetId: string;
  eventKey: string;
  videos: { mp4: string; poster?: string; webm?: string; label?: string }[];
};

/**
 * Public-safe banner payload from `theme/activePreset`
 * (themePresets collection is admin-only — banner fields are mirrored on activate).
 */
export async function fetchActiveEventBanner(): Promise<ActiveEventBanner | null> {
  return cmsRead(
    "theme:active-banner",
    async () => {
      if (!firebaseReady()) return null;
      const data = (await readCmsDoc(COLLECTIONS.theme, DOCS.activeThemePreset)) as {
        presetId?: string;
        bannerMessage?: string;
        bannerEnabled?: boolean;
        emoji?: string;
        name?: string;
      } | null;
      if (!data) return null;
      if (!data.bannerEnabled || !data.bannerMessage?.trim() || !data.presetId) return null;
      return {
        presetId: data.presetId,
        message: data.bannerMessage.trim(),
        emoji: data.emoji || "",
        name: data.name || "",
      };
    },
    () => null,
    5_000,
  );
}

/**
 * Event theme hero playlist (max 3). Empty when default / no clips configured.
 */
export async function fetchActiveEventHeroVideos(): Promise<ActiveEventHeroVideos | null> {
  return cmsRead(
    "theme:active-hero-videos",
    async () => {
      if (!firebaseReady()) return null;
      const data = (await readCmsDoc(COLLECTIONS.theme, DOCS.activeThemePreset)) as {
        presetId?: string;
        eventKey?: string;
        heroVideos?: { mp4?: string; poster?: string; webm?: string; label?: string }[];
      } | null;
      if (!data) return null;
      const presetId = String(data.presetId || "");
      const eventKey = String(data.eventKey || presetId);
      if (!presetId || presetId === "default" || eventKey === "default") return null;
      const videos = (Array.isArray(data.heroVideos) ? data.heroVideos : [])
        .map((v, i) => ({
          mp4: String(v?.mp4 || "").trim(),
          poster: String(v?.poster || "").trim(),
          webm: String(v?.webm || "").trim() || undefined,
          label: String(v?.label || `Event clip ${i + 1}`).trim(),
        }))
        .filter((v) => Boolean(v.mp4))
        .slice(0, 3)
        .map((v) => ({
          mp4: v.mp4,
          label: v.label,
          ...(v.webm ? { webm: v.webm } : {}),
          // Keep poster only when admin set one — never inject default public hero posters.
          ...(v.poster ? { poster: v.poster } : {}),
        }));
      if (videos.length === 0) return null;
      return { presetId, eventKey, videos };
    },
    () => null,
    5_000,
  );
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
  return cmsRead(
    "services:v7",
    async () => {
      if (!firebaseReady()) return localServices;
      const docs = await queryCmsDocs(COLLECTIONS.services);
      if (!docs.length) return localServices;

      const localBySlug = new Map(localServices.map((s) => [s.slug.toLowerCase(), s]));

      type Row = Service & { sortOrder: number };
      const fromCms = docs
        .map((d): Row | null => {
          const x = d.data;
          // Missing active = visible; explicit false hides.
          if (x.active === false) return null;
          // Missing status = published (legacy); draft/archived stay private.
          const status = x.status ? String(x.status) : "published";
          if (status !== "published") return null;
          const title = String(x.title || "").trim();
          if (!title) return null;
          const slug = String(x.slug || d.id).trim();
          const local = localBySlug.get(slug.toLowerCase());
          const image = resolveResilientAssetUrl(
            String(x.imageUrl || x.bannerUrl || x.heroImageUrl || "").trim(),
            local?.image,
          );
          const icon = String(x.icon || "").trim() || local?.icon || "";
          const iconUrl = resolveResilientAssetUrl(
            String(x.iconUrl || "").trim(),
            local?.iconUrl,
          );
          return {
            slug,
            title,
            summary: String(x.shortDescription || x.description || local?.summary || ""),
            image,
            icon: icon || undefined,
            iconUrl: iconUrl || undefined,
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((s): s is Row => s !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
        .map(({ sortOrder: _s, ...service }) => service);

      // Admin CMS owns services once Firebase has any published row (no local merge).
      if (fromCms.length > 0) return fromCms;
      return localServices;
    },
    () => localServices,
    30_000,
  );
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
    image: resolveResilientAssetUrl(
      String(cmsLive?.imageUrl || cmsLive?.bannerUrl || cmsLive?.heroImageUrl || ""),
      localService?.image,
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
    heroImage: resolveResilientAssetUrl(
      String(cmsLive?.heroImageUrl || cmsLive?.bannerUrl || cmsLive?.imageUrl || ""),
      localDetail?.heroImage || service.image,
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
  return cmsRead(
    "clients:v3",
    async () => {
      if (!firebaseReady()) return localClients;
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.clients));
      if (snap.empty) return localClients;

      const localBySlug = new Map(localClients.map((c) => [c.slug.toLowerCase(), c]));

      type Row = ClientLogo & { sortOrder: number };
      const fromCms = snap.docs
        .map((d): Row | null => {
          const x = d.data();
          // Treat missing `active` as true (legacy docs); explicit false hides.
          if (x.active === false) return null;
          const name = String(x.name || "").trim();
          const cmsLogo = String(x.logoUrl || x.logo || "").trim();
          if (!name || !cmsLogo) return null;
          const slug =
            String(x.slug || "").trim() ||
            name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          const local = localBySlug.get(slug.toLowerCase());
          return {
            name,
            slug,
            logo: resolveResilientAssetUrl(cmsLogo, local?.logo),
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((c): c is Row => c !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

      // Once Firebase has clients, CMS owns the homepage list (no local seed merge).
      if (fromCms.length > 0) {
        return fromCms.map(({ sortOrder: _s, ...client }) => client);
      }
      return localClients;
    },
    () => localClients,
  );
}

/** Default header items when CMS primary nav is empty (matches siteConfig.nav). */
export function defaultHeaderNav(): NavItemDoc[] {
  return siteConfig.nav.map((item, index) => ({
    id: item.href.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || `nav-${index}`,
    label: item.label,
    href: item.href,
  }));
}

export async function fetchHeaderNav(): Promise<NavItemDoc[]> {
  return cmsRead(
    "navigation:header:v1",
    async () => {
      if (!firebaseReady()) return defaultHeaderNav();
      const cms = await fetchNav(DOCS.navigationPrimary);
      const items = cms?.filter((item) => !item.hidden && item.label && item.href) || [];
      return items.length ? items : defaultHeaderNav();
    },
    defaultHeaderNav,
  );
}

export async function fetchFooterNav(): Promise<NavItemDoc[]> {
  const cms = await fetchNav(DOCS.navigationFooter);
  if (cms?.length) return cms.filter((item) => !item.hidden);
  return [
    { id: "about", label: "About", href: "/about" },
    { id: "services", label: "Services", href: "/services" },
    { id: "partners", label: "Partners", href: "/partners" },
    { id: "insights", label: "Insights", href: "/resources" },
    { id: "newsletter", label: "Newsletter", href: "/newsletter" },
    { id: "contact", label: "Contact", href: "/contact" },
  ];
}

export async function fetchNewsletterIssues(): Promise<NewsletterIssue[]> {
  return cmsRead(
    "newsletterIssues:v2",
    async () => {
      if (!firebaseReady()) return localNewsletterIssues;
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.newsletterIssues));
      if (snap.empty) return localNewsletterIssues;

      const localBySlug = new Map(localNewsletterIssues.map((i) => [i.slug.toLowerCase(), i]));

      type Row = NewsletterIssue & { _order: number };
      const fromCms = snap.docs
        .map((d): Row | null => {
          const x = d.data();
          if (x.active === false) return null;
          if (x.status && x.status !== "published") return null;
          const title = String(x.title || "").trim();
          const excerpt = String(x.excerpt || "").trim();
          const cmsCover = String(x.coverUrl || "").trim();
          if (!title || !excerpt || !cmsCover) return null;
          const slug =
            String(x.slug || "").trim() ||
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          const local = localBySlug.get(slug.toLowerCase());
          return {
            title,
            slug,
            excerpt,
            body: String(x.body || "").trim() || undefined,
            coverUrl: resolveResilientAssetUrl(cmsCover, local?.coverUrl),
            topic: String(x.topic || "Update").trim() || "Update",
            href: String(x.href || "").trim() || undefined,
            featured: x.featured === true,
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
            publishedAt: String(x.publishedAt || "").trim() || new Date().toISOString().slice(0, 10),
            _order: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((row): row is Row => row !== null)
        .sort((a, b) => a._order - b._order || a.title.localeCompare(b.title));

      if (fromCms.length > 0) {
        return fromCms.map(({ _order: _o, ...issue }) => issue);
      }
      return localNewsletterIssues;
    },
    () => localNewsletterIssues,
  );
}

function isUsablePersonName(name: string) {
  const n = name.trim().toLowerCase();
  return Boolean(n) && n !== "n/a" && n !== "na" && n !== "null" && n !== "undefined";
}

export async function fetchLeadership(): Promise<LeadershipMember[]> {
  return cmsRead(
    "leadership:v3",
    async () => {
      if (!firebaseReady()) return localLeadership;
      const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.leadership));
      if (snap.empty) return localLeadership;

      const localByName = new Map(
        localLeadership.map((m) => [m.name.trim().toLowerCase(), m]),
      );

      type LeadershipRow = LeadershipMember & { sortOrder: number };
      const rows = snap.docs
        .map((d): LeadershipRow | null => {
          const x = d.data();
          if (x.active === false) return null;
          const name = String(x.name || "").trim();
          if (!isUsablePersonName(name)) return null;
          const linkedin = String(x.linkedin || "").trim();
          const local = localByName.get(name.toLowerCase());
          const photo = resolveResilientAssetUrl(
            x.photoUrl ? String(x.photoUrl) : "",
            local?.photoSrc,
          );
          return {
            name,
            title: String(x.designation || x.title || "").trim(),
            bio: String(x.bio || ""),
            photoSrc: photo || null,
            linkedin: linkedin || null,
            sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : Number.MAX_SAFE_INTEGER,
          };
        })
        .filter((x): x is LeadershipRow => x !== null);

      if (!rows.length) return localLeadership;

      rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      // Board of Directors — CMS owns the list once Firebase has members.
      return rows.map(({ sortOrder: _sortOrder, ...member }) => member);
    },
    () => localLeadership,
  );
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

  const slug = String(x.slug || id);
  const localImage =
    blogImagesGenerated[slug] ||
    localBlogs.find((b) => b.slug.toLowerCase() === slug.toLowerCase())?.image ||
    null;
  const image = resolveResilientAssetUrl(
    x.featuredImageUrl ? String(x.featuredImageUrl) : "",
    localImage,
  );

  return {
    slug,
    title: String(x.title || ""),
    date,
    legacyUrl: "",
    image: image || null,
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
  return cmsRead(
    `blogs:v3:${max}`,
    async () => {
      if (!firebaseReady()) return localBlogs.slice(0, max);
      // Constraint must match public read rule (status == published).
      // Server uses Admin SDK to avoid client gRPC TLS stalls.
      const rows = await queryCmsDocs(COLLECTIONS.blogs, {
        where: [{ field: "status", value: "published" }],
        limitCount: Math.min(max, 500),
      });
      const fromCms = rows
        .map((d) => mapBlogDoc(d.id, d.data))
        .filter((b) => b.title && b.slug)
        .sort((a, b) => {
          const ta = Date.parse(a.date) || 0;
          const tb = Date.parse(b.date) || 0;
          return tb - ta;
        });

      const cmsSlugs = new Set(fromCms.map((b) => b.slug.toLowerCase()));
      const localOnly = localBlogs.filter((b) => !cmsSlugs.has(b.slug.toLowerCase()));
      return [...fromCms, ...localOnly].slice(0, max);
    },
    () => localBlogs.slice(0, max),
    30_000,
  );
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPostMeta | null> {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;

  if (firebaseReady()) {
    try {
      const rows = await queryCmsDocs(COLLECTIONS.blogs, {
        where: [
          { field: "slug", value: slug.trim() },
          { field: "status", value: "published" },
        ],
        limitCount: 1,
      });
      if (rows[0]) {
        return mapBlogDoc(rows[0].id, rows[0].data);
      }
      // Fallback: slug field may differ from doc id
      const all = await fetchPublishedBlogs(200);
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
  return cmsRead(
    "careers:open:v2",
    async () => {
      if (!firebaseReady()) return localJobs;
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

      // Admin CMS owns careers once any open job exists — drop local seed defaults.
      if (fromCms.length > 0) return fromCms;
      return localJobs;
    },
    () => localJobs,
  );
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

function isUsablePartnerLogo(logo: string) {
  const value = logo.trim().toLowerCase();
  if (!value) return false;
  // Seeded / missing brand marks used this SVG (renders the word "Partner").
  if (value.includes("wordmark-placeholder")) return false;
  return true;
}

function withPartnerFallbacks(partner: Partner): Partner {
  const slug = partner.slug || slugifyPartnerName(partner.name);
  const local = localPartners.find(
    (p) => (p.slug || slugifyPartnerName(p.name)).toLowerCase() === slug.toLowerCase(),
  );
  const cmsLogo = isUsablePartnerLogo(partner.logo) ? partner.logo : "";
  const localLogo = local?.logo && isUsablePartnerLogo(local.logo) ? local.logo : "";
  const logo =
    resolveResilientAssetUrl(cmsLogo, localLogo) || localLogo || cmsLogo || partner.logo || "";

  return {
    ...partner,
    slug,
    logo,
    href: partner.href && partner.href !== "#" ? partner.href : local?.href || partner.href || "#",
    taglines: partner.taglines?.length ? partner.taglines : (local?.taglines ?? []),
    keySolutions: partner.keySolutions?.length ? partner.keySolutions : (local?.keySolutions ?? []),
    shortDescription: partner.shortDescription || local?.shortDescription || "",
    overview: partner.overview || local?.overview || "",
    heroImageUrl: resolveResilientAssetUrl(partner.heroImageUrl, local?.heroImageUrl),
    category: partner.category || local?.category || "",
  };
}

export async function fetchPartners(): Promise<Partner[]> {
  return cmsRead(
    "partners:v6",
    async () => {
      if (!firebaseReady()) {
        return localPartners.map(withPartnerFallbacks);
      }
      const docs = await queryCmsDocs(COLLECTIONS.partners);
      if (!docs.length) return localPartners.map(withPartnerFallbacks);

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

      const rows = docs
        .map((d): PartnerRow | null => {
          const x = d.data;
          // Missing active = visible; explicit false hides (admin delete or deactivate).
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

      // Admin CMS owns partners once Firebase has any — no local merge
      // (merge was why site showed partners that admin couldn't edit/delete).
      if (fromCms.length > 0) return fromCms;
      return localPartners.map(withPartnerFallbacks);
    },
    () => localPartners.map(withPartnerFallbacks),
    30_000,
  );
}

export async function fetchPartnerBySlug(slug: string): Promise<Partner | null> {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;

  if (firebaseReady()) {
    try {
      const bySlug = query(
        collection(getFirebaseDb(), COLLECTIONS.partners),
        where("slug", "==", slug.trim()),
        limit(1),
      );
      const snap = await getDocs(bySlug);
      if (!snap.empty) {
        const d = snap.docs[0];
        const x = d.data();
        if (x.active === false) return null;
        return withPartnerFallbacks({
          name: String(x.name || ""),
          logo: String(x.logoUrl || x.logo || ""),
          href: String(x.website || x.href || "#"),
          slug: String(x.slug || d.id),
          heroImageUrl: String(x.heroImageUrl || ""),
          taglines: asStringList(x.taglines),
          shortDescription: String(x.shortDescription || ""),
          overview: String(x.overview || ""),
          keySolutions: asStringList(x.keySolutions),
          category: String(x.category || ""),
        });
      }
    } catch {
      /* fall through */
    }
  }

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

/** Per-link mega-menu icon overrides (upload and/or Lucide). */
export type MegaMenuLinkIconStyle = {
  icon?: string;
  iconUrl?: string;
};

/** menuKey → href → style */
export type MegaMenuIconMap = Record<string, Record<string, MegaMenuLinkIconStyle>>;

function localMegaMenuIconMap(): MegaMenuIconMap {
  const defaults = defaultMegaMenuIconLinks();
  const out: MegaMenuIconMap = {};
  for (const key of MEGA_MENU_ICON_KEYS) {
    out[key] = {};
    for (const link of defaults[key].links) {
      out[key][link.href] = {
        icon: link.icon,
        iconUrl: link.logoUrl,
      };
    }
  }
  return out;
}

/**
 * CMS mega-menu icons (navigation/megaMenus).
 * Supports uploaded iconUrl (preferred) and Lucide preset; falls back to defaults.
 */
export async function fetchMegaMenuIcons(): Promise<MegaMenuIconMap> {
  return cmsRead(
    "navigation:megaMenus:v2",
    async () => {
      const fallback = localMegaMenuIconMap();
      if (!firebaseReady()) return fallback;

      const snap = await getDoc(
        doc(getFirebaseDb(), COLLECTIONS.navigation, DOCS.navigationMegaMenus),
      );
      if (!snap.exists()) return fallback;

      const data = snap.data() as MegaMenuIconsDoc;
      const menus = data?.menus || {};
      const out: MegaMenuIconMap = { ...fallback };

      for (const key of MEGA_MENU_ICON_KEYS) {
        const menuKey = key as MegaMenuIconKey;
        const links = menus[menuKey]?.links;
        if (!Array.isArray(links) || !links.length) continue;
        const map: Record<string, MegaMenuLinkIconStyle> = { ...(out[menuKey] || {}) };
        for (const link of links) {
          const href = String(link.href || "").trim();
          if (!href) continue;
          const icon = String(link.icon || "").trim();
          const iconUrl = String(link.iconUrl || "").trim();
          const next: MegaMenuLinkIconStyle = { ...(map[href] || {}) };
          if (iconUrl) {
            next.iconUrl = iconUrl;
          } else {
            delete next.iconUrl;
          }
          if (icon && isNavIconKey(icon)) {
            next.icon = icon;
          } else if (!icon) {
            delete next.icon;
          }
          map[href] = next;
        }
        out[menuKey] = map;
      }
      return out;
    },
    localMegaMenuIconMap,
  );
}
