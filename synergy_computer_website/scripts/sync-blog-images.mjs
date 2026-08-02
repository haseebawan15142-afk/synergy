/**
 * Downloads blog hero images from synergy.net.pk into public/images/blog/
 * and writes src/lib/content/blog-images.generated.ts
 *
 * Run: node scripts/sync-blog-images.mjs
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  createWriteStream,
} from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const metaPath = join(root, "src", "lib", "content", "blog-posts.generated.ts");
const htmlPath = join(root, ".cursor", "docs", "_blog-index.html");
const outDir = join(root, "public", "images", "blog");
const outMapPath = join(root, "src", "lib", "content", "blog-images.generated.ts");

function parsePosts() {
  const src = readFileSync(metaPath, "utf8");
  const m = src.match(/export const blogPostsGenerated[^=]*=\s*(\[[\s\S]*\]);/);
  if (!m) throw new Error("Could not parse blog-posts.generated.ts");
  return JSON.parse(m[1]);
}

function normalizeLegacyUrl(url) {
  try {
    return decodeURIComponent(url.trim());
  } catch {
    return url.trim();
  }
}

function buildIndexImageMap(html) {
  const map = new Map();
  const blocks = html.match(/<article class="card card-style2[\s\S]*?<\/article>/g) ?? [];
  for (const block of blocks) {
    const link = block.match(/href="(https:\/\/synergy\.net\.pk\/[^"]+)"/);
    const img = block.match(/src="(img\/[^"]+)"/);
    if (link && img) {
      map.set(normalizeLegacyUrl(link[1]), `https://synergy.net.pk/${img[1]}`);
    }
  }
  return map;
}

function resolveRemoteUrl(relative, base = "https://synergy.net.pk/") {
  if (relative.startsWith("http")) return relative;
  return new URL(relative.replace(/^\//, ""), base).href;
}

function extractImageFromPageHtml(html) {
  const og = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (og?.[1]) return resolveRemoteUrl(og[1]);

  const skipSrc = /logo|veritaslogo|utimacologo|ifslogo|footer|facebook|twitter|linkedin|favicon/i;
  const candidates = [];
  const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    if (skipSrc.test(src) || skipSrc.test(m[0])) continue;
    if (
      src.includes("img/") ||
      /\/images\s*\(\d+\)/i.test(src) ||
      /\.(webp|jpe?g|png|gif|jfif)(\?|$)/i.test(src)
    ) {
      candidates.push(resolveRemoteUrl(src));
    }
  }
  const preferred = candidates.find(
    (u) =>
      /solution|blog|banner|hero|post|images\s*\(/i.test(u) && !/360_F_/i.test(u),
  );
  return preferred ?? candidates[0] ?? null;
}

function safeExt(url, contentType) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if ([".webp", ".jpg", ".jpeg", ".png", ".gif", ".jfif"].includes(fromUrl)) return fromUrl;
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  return ".jpg";
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url, {
    headers: { "User-Agent": "SynergyWebsiteMigration/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ext = safeExt(url, res.headers.get("content-type"));
  const finalPath = extname(destPath) ? destPath : `${destPath}${ext}`;
  const body = res.body;
  if (!body) throw new Error("empty body");
  await pipeline(Readable.fromWeb(body), createWriteStream(finalPath));
  return finalPath;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

if (!existsSync(metaPath)) {
  console.error("[sync-blog-images] Run sync-blogs-from-legacy.mjs first");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const posts = parsePosts();
const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";
const indexMap = buildIndexImageMap(html);

const localMap = {};
let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const post of posts) {
  const basePath = join(outDir, post.slug);
  const existing = [".webp", ".jpg", ".jpeg", ".png", ".gif", ".jfif"]
    .map((e) => `${basePath}${e}`)
    .find((p) => existsSync(p));

  if (existing) {
    localMap[post.slug] = `/images/blog/${post.slug}${extname(existing)}`;
    skipped++;
    continue;
  }

  let remote =
    post.image ||
    indexMap.get(normalizeLegacyUrl(post.legacyUrl)) ||
    null;

  if (!remote) {
    try {
      const res = await fetch(post.legacyUrl, {
        headers: { "User-Agent": "SynergyWebsiteMigration/1.0" },
      });
      if (res.ok) {
        const pageHtml = await res.text();
        remote = extractImageFromPageHtml(pageHtml);
      }
    } catch (e) {
      console.warn(`[fetch page] ${post.slug}: ${e.message}`);
    }
    await sleep(250);
  }

  if (!remote) {
    failed++;
    console.warn(`[no image] ${post.slug}`);
    continue;
  }

  try {
    const saved = await downloadToFile(remote, basePath);
    localMap[post.slug] = `/images/blog/${post.slug}${extname(saved)}`;
    downloaded++;
    process.stdout.write(`.\n${post.slug}\n`);
  } catch (e) {
    failed++;
    console.warn(`[download] ${post.slug}: ${e.message}`);
  }
  await sleep(200);
}

const ts = `/* Auto-generated by scripts/sync-blog-images.mjs — ${Object.keys(localMap).length} images */
export const blogImagesGenerated: Record<string, string> = ${JSON.stringify(localMap, null, 2)};
`;

writeFileSync(outMapPath, ts, "utf8");
console.log(
  `[sync-blog-images] done downloaded=${downloaded} cached=${skipped} missing=${failed} mapped=${Object.keys(localMap).length}`,
);
