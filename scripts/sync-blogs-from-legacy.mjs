/**

 * Parses legacy blog index:

 * - .cursor/docs/_blog-index-fetch.txt (full listing from synergy.net.pk/blog)

 * - .cursor/docs/_blog-index.html (optional, for hero images on recent posts)

 * Writes src/lib/content/blog-posts.generated.ts

 */

import { readFileSync, writeFileSync, existsSync } from "fs";

import { join } from "path";

import { fileURLToPath } from "url";



const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const htmlPath = join(root, ".cursor", "docs", "_blog-index.html");

const fetchPath = join(root, ".cursor", "docs", "_blog-index-fetch.txt");

const outPath = join(root, "src", "lib", "content", "blog-posts.generated.ts");



if (!existsSync(fetchPath)) {

  console.error(

    "[sync-blogs] Missing .cursor/docs/_blog-index-fetch.txt — fetch https://synergy.net.pk/blog",

  );

  process.exit(1);

}



const fetchText = readFileSync(fetchPath, "utf8");

const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";



function normalizeLegacyUrl(url) {

  try {

    return decodeURIComponent(url.replace(/\s+Read More.*$/, "").trim());

  } catch {

    return url.trim();

  }

}



function slugFromUrl(url) {

  const path = url.replace("https://synergy.net.pk/", "").replace(/\/$/, "");

  return path.startsWith("blog-") ? path.slice(5) : path;

}



function categorize(title) {

  const t = title.toLowerCase();

  if (t.includes("dynatrace") || t.includes("observability")) return "Observability";

  if (

    t.includes("cohesity") ||

    t.includes("veritas") ||

    t.includes("data availability") ||

    t.includes("backup") ||

    t.includes("recovery")

  )

    return "Data availability";

  if (t.includes("robotic process") || t.includes("rpa") || t.includes("automation anywhere"))

    return "RPA";

  if (t.includes("bmc helix") || t.includes("service desk") || t.includes("managed it"))

    return "Managed IT";

  if (t.includes("object storage") || t.includes("pure storage") || t.includes("storage"))

    return "Storage";

  if (t.includes("nutanix") || t.includes("supermicro") || t.includes("infrastructure"))

    return "Infrastructure";

  if (t.includes("security") || t.includes("utimaco")) return "Security";

  if (t.includes("microsoft") || t.includes("cloud") || t.includes("365")) return "Cloud";

  return "Enterprise IT";

}



function relatedService(category) {

  const map = {

    "Data availability": "data-backup-recovery",

    Storage: "data-backup-recovery",

    Observability: "managed-it",

    "Managed IT": "managed-it",

    Infrastructure: "network-infrastructure",

    RPA: "microsoft-365-cloud",

    Cloud: "microsoft-365-cloud",

    Security: "network-infrastructure",

    "Enterprise IT": "on-site-it-support",

  };

  return map[category] ?? "managed-it";

}



function parseDate(dateStr) {

  const normalized = dateStr.replace(/octaber/i, "October");

  const t = Date.parse(normalized);

  return Number.isNaN(t) ? 0 : t;

}



/** url -> image from HTML cards */

function buildImageMap(htmlSource) {

  const map = new Map();

  const blocks = htmlSource.match(/<article class="card card-style2[\s\S]*?<\/article>/g) ?? [];

  for (const block of blocks) {

    const titleMatch = block.match(/href="(https:\/\/synergy\.net\.pk\/[^"]+)"/);

    const imgMatch = block.match(/src="(img\/[^"]+)"/);

    if (titleMatch && imgMatch) {

      map.set(normalizeLegacyUrl(titleMatch[1]), `https://synergy.net.pk/${imgMatch[1]}`);

    }

  }

  return map;

}



function parseFetchListing(text) {

  const lines = text.split(/\r?\n/);

  const posts = [];

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i].trim();

    if (!line.startsWith("### ")) continue;



    const title = line.slice(4).trim();

    let legacyUrl = "";

    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {

      const m = lines[j].trim().match(/^(https:\/\/synergy\.net\.pk\/[^\s]+)/);

      if (m) {

        legacyUrl = normalizeLegacyUrl(m[1]);

        break;

      }

    }

    if (!legacyUrl) continue;



    let date = "";

    for (let k = i - 1; k >= Math.max(0, i - 5); k--) {

      const d = lines[k].trim();

      if (d && !d.startsWith("#") && !d.startsWith("http")) {

        date = d;

        break;

      }

    }



    posts.push({ title, legacyUrl, date });

  }

  return posts;

}



function dedupeBySlug(items) {
  const bySlug = new Map();
  for (const item of items) {
    const prev = bySlug.get(item.slug);
    if (!prev) {
      bySlug.set(item.slug, item);
      continue;
    }
    const score = (p) => (p.legacyUrl.includes("/blog-") ? 4 : 0) + (p.image ? 2 : 0);
    bySlug.set(item.slug, score(item) >= score(prev) ? item : prev);
  }
  return [...bySlug.values()];
}

const imageMap = buildImageMap(html);

const raw = parseFetchListing(fetchText);

const byUrl = new Map();



for (const p of raw) {

  if (!byUrl.has(p.legacyUrl)) {

    byUrl.set(p.legacyUrl, p);

  }

}



const articles = dedupeBySlug(
  [...byUrl.values()]
    .map((p) => {
      const category = categorize(p.title);
      return {
        slug: slugFromUrl(p.legacyUrl),
        title: p.title,
        date: p.date,
        dateSort: parseDate(p.date),
        legacyUrl: p.legacyUrl,
        image: imageMap.get(p.legacyUrl) ?? null,
        category,
        relatedServiceSlug: relatedService(category),
      };
    }),
)
  .sort((a, b) => b.dateSort - a.dateSort)
  .map(({ dateSort: _d, ...rest }) => rest);



const ts = `/* Auto-generated by scripts/sync-blogs-from-legacy.mjs — ${articles.length} posts */

export type BlogPostMeta = {

  slug: string;

  title: string;

  date: string;

  legacyUrl: string;

  image: string | null;

  category: string;

  relatedServiceSlug: string;

};



export const blogPostsGenerated: BlogPostMeta[] = ${JSON.stringify(articles, null, 2)};

`;



writeFileSync(outPath, ts, "utf8");

console.log(`[sync-blogs] Wrote ${articles.length} posts → ${outPath}`);


