/**
 * Selected Clientele — Company Profile 2026.
 * Logos: high-quality transparent WebP only under /images/client-logos.
 * Never keep solid-white / low-quality plates. Refresh via:
 *   node scripts/refresh-client-logos-hq.mjs
 */
export type ClientLogo = {
  name: string;
  slug: string;
  logo: string;
};

export type ClienteleHeadlineSlide = {
  line1: string;
  line2: string;
  /** Word/phrase in line2 rendered with the brand gradient */
  highlight: string;
};

export const clienteleHeadlineSlides: ClienteleHeadlineSlide[] = [
  {
    line1: "They lead their industries.",
    line2: "We power their technology.",
    highlight: "technology.",
  },
  {
    line1: "Decades of trust.",
    line2: "Thousands of critical systems.",
    highlight: "critical systems.",
  },
  {
    line1: "When technology matters,",
    line2: "businesses choose Synergy.",
    highlight: "Synergy.",
  },
];

export const clienteleHeadline = clienteleHeadlineSlides[0].line1;

export const clienteleIntro =
  "Trusted by organizations that drive progress and build the future.";

/** Logos per page in the Selected Clientele grid (matches reference 4×3). */
export const CLIENTELE_PAGE_SIZE = 12;

export const clients: ClientLogo[] = [
  { name: "State Bank of Pakistan", slug: "state-bank-of-pakistan", logo: "/images/client-logos/state-bank-of-pakistan.webp" },
  { name: "Meezan Bank", slug: "meezan-bank", logo: "/images/client-logos/meezan-bank.webp" },
  { name: "Standard Chartered", slug: "standard-chartered", logo: "/images/client-logos/standard-chartered.webp" },
  { name: "United Bank Limited", slug: "ubl", logo: "/images/client-logos/ubl.webp" },
  { name: "NADRA", slug: "nadra", logo: "/images/client-logos/nadra.webp" },
  { name: "MOL Group", slug: "mol-group", logo: "/images/client-logos/mol-group.webp" },
  { name: "MCB Islamic Bank", slug: "mcb-islamic", logo: "/images/client-logos/mcb-islamic.webp" },
  { name: "Bank of Punjab", slug: "bank-of-punjab", logo: "/images/client-logos/bank-of-punjab.webp" },
  { name: "Askari Bank", slug: "askari-bank", logo: "/images/client-logos/askari-bank.webp" },
  { name: "Bank Makramah Limited", slug: "bank-makramah", logo: "/images/client-logos/bank-makramah.webp" },
  { name: "Bank of Khyber", slug: "bank-of-khyber", logo: "/images/client-logos/bank-of-khyber.webp" },
  { name: "Berger Paints Pakistan", slug: "berger", logo: "/images/client-logos/berger.webp" },
  { name: "Fatima Group", slug: "fatima-group", logo: "/images/client-logos/fatima-group.webp" },
  { name: "NRSP", slug: "nrsp", logo: "/images/client-logos/nrsp.webp" },
  { name: "MCB Bank", slug: "mcb", logo: "/images/client-logos/mcb.webp" },
  { name: "Allied Bank", slug: "allied-bank", logo: "/images/client-logos/allied-bank.webp" },
  { name: "Soneri Bank", slug: "soneri-bank", logo: "/images/client-logos/soneri-bank.webp" },
  { name: "Mobilink Microfinance Bank", slug: "mobilink-microfinance-bank", logo: "/images/client-logos/mobilink-microfinance-bank.webp" },
  { name: "Aga Khan Development Network", slug: "akdn", logo: "/images/client-logos/akdn.webp" },
  { name: "Zarai Taraqiati Bank Limited", slug: "ztbl", logo: "/images/client-logos/ztbl.webp" },
  { name: "Celerity Logistics", slug: "celerity", logo: "/images/client-logos/celerity.webp" },
  { name: "NRSP Microfinance Bank", slug: "nrsp-microfinance-bank", logo: "/images/client-logos/nrsp-microfinance-bank.webp" },
  { name: "Engro Corporation", slug: "engro", logo: "/images/client-logos/engro.webp" },
  { name: "Sui Northern Gas Pipelines", slug: "sngpl", logo: "/images/client-logos/sngpl.webp" },
  { name: "K-Electric", slug: "k-electric", logo: "/images/client-logos/k-electric.webp" },
  { name: "Pakistan Customs", slug: "pakistan-customs", logo: "/images/client-logos/pakistan-customs.webp" },
  { name: "DG Cement", slug: "dg-cement", logo: "/images/client-logos/dg-cement.webp" },
  { name: "National Telecommunication Corporation", slug: "ntc", logo: "/images/client-logos/ntc.webp" },
  { name: "Jazz", slug: "jazz", logo: "/images/client-logos/jazz.webp" },
  { name: "Zong 4G", slug: "zong", logo: "/images/client-logos/zong.webp" },
  { name: "FFBL", slug: "ffbl", logo: "/images/client-logos/ffbl.webp" },
  { name: "PTCL", slug: "ptcl", logo: "/images/client-logos/ptcl.webp" },
  { name: "KTrade Securities", slug: "ktrade", logo: "/images/client-logos/ktrade.webp" },
  { name: "Jahangir Siddiqui & Co.", slug: "js-group", logo: "/images/client-logos/js-group.webp" },
  { name: "Ghani Global Holdings", slug: "ghani", logo: "/images/client-logos/ghani.webp" },
  { name: "Bank AL Habib", slug: "bank-al-habib", logo: "/images/client-logos/bank-al-habib.webp" },
  { name: "National Bank of Oman", slug: "national-bank-of-oman", logo: "/images/client-logos/national-bank-of-oman.webp" },
  { name: "1LINK", slug: "1link", logo: "/images/client-logos/1link.webp" },
  { name: "Sindh Bank", slug: "sindh-bank", logo: "/images/client-logos/sindh-bank.webp" },
  { name: "McDonald's", slug: "mcdonalds", logo: "/images/client-logos/mcdonalds.webp" },
  { name: "National Bank of Pakistan", slug: "nbp", logo: "/images/client-logos/nbp.webp" },
  { name: "PARCO", slug: "parco", logo: "/images/client-logos/parco.webp" },
];

/**
 * Prefer the brands shown in the CEO reference grid first, then the rest of the portfolio.
 */
const FEATURED_CLIENT_SLUGS = [
  "state-bank-of-pakistan",
  "askari-bank",
  "fatima-group",
  "nadra",
  "berger",
  "allied-bank",
  "bank-of-punjab",
  "mcb",
  "akdn",
  "mobilink-microfinance-bank",
  "meezan-bank",
  "ubl",
  "engro",
  "ptcl",
  "jazz",
  "k-electric",
  "sngpl",
  "nbp",
  "bank-al-habib",
  "standard-chartered",
  "parco",
  "ffbl",
  "soneri-bank",
  "ztbl",
] as const;

export function orderedClientsForShowcase(list: ClientLogo[] = clients): ClientLogo[] {
  const bySlug = new Map(list.map((c) => [c.slug, c]));
  const featured: ClientLogo[] = [];
  for (const slug of FEATURED_CLIENT_SLUGS) {
    const hit = bySlug.get(slug);
    if (hit) {
      featured.push(hit);
      bySlug.delete(slug);
    }
  }
  return [...featured, ...bySlug.values()];
}

export function paginateClients(
  list: ClientLogo[],
  pageSize = CLIENTELE_PAGE_SIZE,
): ClientLogo[][] {
  if (!list.length) return [[]];
  const pages: ClientLogo[][] = [];
  for (let i = 0; i < list.length; i += pageSize) {
    pages.push(list.slice(i, i + pageSize));
  }
  return pages;
}

/** Split into N columns for Arcana-style vertical marquees */
export function splitClientColumns(list: ClientLogo[] = clients, columnCount = 3) {
  const columns: ClientLogo[][] = Array.from({ length: columnCount }, () => []);
  list.forEach((client, index) => {
    columns[index % columnCount].push(client);
  });
  return columns;
}
