/**
 * Download high-quality partner logos (not just strip old white plates).
 * Gentle alpha: only near-pure white/black plates — no fade.
 * Syncs local + Firebase; deletes old LQ Storage objects.
 *
 * Usage: node scripts/refresh-partner-logos-hq.mjs
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/images/partner-logos");
const legacyDirs = [
  resolve(root, "public/images/partners"),
  resolve(root, "public/images/partners/profile"),
];

function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnv(resolve(root, ".env.local"));

/**
 * @type {{ slug: string, name: string, domains: string[], simpleIcon?: string, preferUrls?: string[] }[]}
 */
const PARTNERS = [
  { slug: "veritas", name: "Veritas", domains: ["veritas.com"], simpleIcon: "veritas" },
  { slug: "dynatrace", name: "Dynatrace", domains: ["dynatrace.com"], simpleIcon: "dynatrace" },
  { slug: "utimaco", name: "Utimaco", domains: ["utimaco.com"] },
  { slug: "oracle", name: "Oracle", domains: ["oracle.com"], simpleIcon: "oracle" },
  { slug: "netapp", name: "NetApp", domains: ["netapp.com"], simpleIcon: "netapp" },
  { slug: "hitachi-vantara", name: "Hitachi Vantara", domains: ["hitachivantara.com", "hitachi.com"] },
  { slug: "infor", name: "Infor", domains: ["infor.com"] },
  {
    slug: "dell-technologies",
    name: "Dell Technologies",
    domains: ["dell.com", "delltechnologies.com"],
    simpleIcon: "dell",
    file: "dell.webp",
  },
  { slug: "ddn", name: "DDN", domains: ["ddn.com"] },
  { slug: "convene", name: "Convene", domains: ["convene.com"] },
  { slug: "innovative", name: "Innovative", domains: ["innovative.com", "innovativeinterfaces.com"] },
  {
    slug: "automation-anywhere",
    name: "Automation Anywhere",
    domains: ["automationanywhere.com"],
  },
  { slug: "bmc-helix", name: "BMC Helix", domains: ["bmc.com"] },
  { slug: "enterprisedb", name: "EnterpriseDB", domains: ["enterprisedb.com", "edb.com"] },
  { slug: "knowbe4", name: "KnowBe4", domains: ["knowbe4.com"] },
  { slug: "hexagon", name: "Hexagon", domains: ["hexagon.com"], simpleIcon: "hexagon" },
  { slug: "nutanix", name: "Nutanix", domains: ["nutanix.com"], simpleIcon: "nutanix" },
  { slug: "cohesity", name: "Cohesity", domains: ["cohesity.com"] },
  { slug: "pure-storage", name: "Pure Storage", domains: ["purestorage.com"] },
  { slug: "proxmox", name: "Proxmox", domains: ["proxmox.com"] },
  { slug: "lenovo", name: "Lenovo", domains: ["lenovo.com"], simpleIcon: "lenovo" },
  { slug: "red-hat", name: "Red Hat", domains: ["redhat.com"], simpleIcon: "redhat" },
  { slug: "fujitsu", name: "Fujitsu", domains: ["fujitsu.com"], simpleIcon: "fujitsu" },
  { slug: "ibm", name: "IBM", domains: ["ibm.com"], simpleIcon: "ibm" },
  { slug: "supermicro", name: "Supermicro", domains: ["supermicro.com"] },
  { slug: "cisco", name: "Cisco", domains: ["cisco.com"], simpleIcon: "cisco" },
  { slug: "arctera", name: "Arctera", domains: ["arctera.com", "veritas.com"] },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SynergyPartnerLogoBot/1.0";

function outName(p) {
  return p.file || `${p.slug}.webp`;
}

async function fetchBuffer(url, { minBytes = 500 } = {}) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(22000),
      headers: {
        "User-Agent": UA,
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (ctype.includes("text/html") || ctype.includes("application/json")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < minBytes) return null;
    return { buf, ctype, url };
  } catch {
    return null;
  }
}

function absUrl(base, href) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

async function scrapeSiteIcons(domain) {
  const origins = [`https://www.${domain}`, `https://${domain}`];
  const found = [];
  for (const origin of origins) {
    try {
      const res = await fetch(origin, {
        redirect: "follow",
        signal: AbortSignal.timeout(18000),
        headers: { "User-Agent": UA, Accept: "text/html" },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const base = res.url || origin;
      const patterns = [
        /<link[^>]+rel=["'](?:apple-touch-icon[^"']*)["'][^>]+href=["']([^"']+)["']/gi,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon[^"']*)["']/gi,
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
        /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/gi,
        /<(?:img|source)[^>]+(?:class|id)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/gi,
        /src=["']([^"']*logo[^"']*\.(?:svg|png|webp))["']/gi,
      ];
      for (const re of patterns) {
        let m;
        while ((m = re.exec(html))) {
          const u = absUrl(base, m[1]);
          if (u && !u.startsWith("data:")) found.push(u);
        }
      }
      for (const path of [
        "/apple-touch-icon.png",
        "/apple-touch-icon-180x180.png",
        "/favicon-196x196.png",
        "/img/logo.svg",
        "/img/logo.png",
        "/images/logo.svg",
        "/images/logo.png",
        "/assets/logo.svg",
        "/assets/images/logo.svg",
        "/content/dam/logo.svg",
      ]) {
        found.push(absUrl(base, path));
      }
      if (found.length) break;
    } catch {
      /* next */
    }
  }
  return [...new Set(found.filter(Boolean))];
}

async function scoreImage(buf, url = "") {
  try {
    const meta = await sharp(buf, { failOn: "none" }).metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    if (w < 40 || h < 40) return { score: 0, w, h };
    let score = w * h;
    if (meta.format === "svg") score += 800_000;
    if (w >= 128 && h >= 128) score += 80_000;
    if (w >= 256 || h >= 256) score += 160_000;
    const u = url.toLowerCase();
    if (u.includes("logo")) score += 100_000;
    if (u.includes("apple-touch")) score += 60_000;
    if (u.includes("simple-icons") || u.includes("simpleicons")) score += 200_000;
    // Penalize banners / photos
    if (u.includes("banner") || u.includes("hero") || u.includes("og-image") || u.includes("og_image"))
      score -= 200_000;
    const ratio = w / Math.max(h, 1);
    if (ratio > 6 || ratio < 0.15) score -= 150_000;
    return { score, w, h, format: meta.format };
  } catch {
    return { score: 0, w: 0, h: 0 };
  }
}

async function downloadBest(partner) {
  const candidates = [];

  if (partner.preferUrls?.length) candidates.push(...partner.preferUrls);

  if (partner.simpleIcon) {
    candidates.push(
      `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${partner.simpleIcon}.svg`,
      `https://cdn.simpleicons.org/${partner.simpleIcon}`,
    );
  }

  for (const domain of partner.domains) {
    candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    const scraped = await scrapeSiteIcons(domain);
    // Prefer URLs that look like logos
    scraped.sort((a, b) => {
      const score = (u) =>
        (u.toLowerCase().includes("logo") ? 2 : 0) +
        (u.toLowerCase().includes("apple-touch") ? 1 : 0);
      return score(b) - score(a);
    });
    candidates.push(...scraped);
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`,
    );
  }

  let best = null;
  for (const url of candidates) {
    const hit = await fetchBuffer(url);
    if (!hit) continue;
    const scored = await scoreImage(hit.buf, hit.url);
    if (scored.score <= 0) continue;
    if (!best || scored.score > best.score) best = { ...hit, ...scored };
    if (scored.format === "svg" || (scored.w >= 200 && scored.h >= 80)) {
      // Strong candidate — keep searching a bit for better, but can stop early for SVG
      if (scored.format === "svg" && scored.score > 500_000) break;
    }
  }
  return best;
}

/**
 * Transparent export without fading brand colors.
 * Only knocks out near-pure white (or near-pure black plates).
 */
async function toTransparentWebp(inputBuf) {
  let pipeline = sharp(inputBuf, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (meta.format === "svg") {
    pipeline = sharp(inputBuf, { failOn: "none", density: 420 });
  }

  const { data, info } = await pipeline
    .ensureAlpha()
    .resize({
      width: 720,
      height: 360,
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Detect plate from corners
  const sample = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const corners = [
    sample(2, 2),
    sample(width - 3, 2),
    sample(2, height - 3),
    sample(width - 3, height - 3),
  ];
  const avg = (idx) =>
    Math.round(corners.reduce((s, c) => s + c[idx], 0) / corners.length);
  const br = avg(0);
  const bg = avg(1);
  const bb = avg(2);
  const lum = (br + bg + bb) / 3;
  const isWhitePlate = lum > 240;
  const isBlackPlate = lum < 22;

  if (isWhitePlate || isBlackPlate) {
    const thr = isWhitePlate ? 250 : 18;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isWhitePlate) {
        // Only pure-ish white — keep light greys in logos
        if (r >= thr && g >= thr && b >= thr) data[i + 3] = 0;
      } else if (r <= thr && g <= thr && b <= thr) {
        data[i + 3] = 0;
      }
    }
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] < 20) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return sharp(inputBuf, { failOn: "none", density: 384 })
      .ensureAlpha()
      .resize({ width: 400, height: 200, fit: "inside" })
      .webp({ quality: 95, alphaQuality: 100 })
      .toBuffer();
  }

  const pad = 16;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const targetH = 160;
  const targetW = Math.max(160, Math.round(cropW * (targetH / cropH)));

  return sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize({
      width: targetW,
      height: targetH,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 95, alphaQuality: 100 })
    .toBuffer();
}

mkdirSync(outDir, { recursive: true });

const results = [];
for (const partner of PARTNERS) {
  process.stdout.write(`${partner.slug} … `);
  const best = await downloadBest(partner);
  const dest = join(outDir, outName(partner));

  if (!best) {
    console.log("FAIL");
    results.push({ slug: partner.slug, ok: false });
    continue;
  }

  const webp = await toTransparentWebp(best.buf);
  writeFileSync(dest, webp);
  console.log(`OK ${best.w}x${best.h} ${best.format || ""} ← ${best.url.slice(0, 85)}`);
  results.push({ slug: partner.slug, ok: true, w: best.w, h: best.h, url: best.url });
}

console.log(`\nLocal HQ: ${results.filter((r) => r.ok).length}/${PARTNERS.length}`);

// Remove faded legacy partner webps in /images/partners (not hero/)
for (const dir of legacyDirs) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!/\.(webp|png|jpg|jpeg)$/i.test(f)) continue;
    if (f.includes("placeholder")) continue;
    try {
      rmSync(join(dir, f), { force: true });
    } catch {
      /* locked */
    }
  }
}
console.log("Cleared legacy partner raster logos under public/images/partners (+ profile)");

// Point local content at partner-logos (already mostly there) — ensure nutanix/lenovo/ibm/cohesity/dynatrace paths
// Dynatrace/Cohesity keep branded SVG if we also write webp copies for grids
for (const slug of ["dynatrace", "cohesity", "nutanix", "lenovo", "ibm"]) {
  const webp = join(outDir, `${slug === "dell-technologies" ? "dell" : slug}.webp`);
  // already written if ok
}

// Firebase
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(
  /\\n/g,
  "\n",
);
const bucketName =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  "synergy-9ea81.firebasestorage.app";

if (!projectId || !clientEmail || !privateKey) {
  console.warn("Skip Firebase — missing credentials");
  process.exit(0);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: bucketName,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

async function wipePrefix(prefix) {
  const [files] = await bucket.getFiles({ prefix });
  let n = 0;
  for (const file of files) {
    try {
      await file.delete({ ignoreNotFound: true });
      n += 1;
    } catch {
      /* ignore */
    }
  }
  return n;
}

console.log("Wiping old Storage partner *logos* (keeping partners/hero)…");
{
  const [files] = await bucket.getFiles({ prefix: "partners/" });
  let n = 0;
  for (const file of files) {
    const name = file.name.replace(/\\/g, "/");
    if (name.includes("/hero/")) continue;
    // Only wipe raster logos at partners/ root or profile — not nested hero media
    const base = name.split("/").pop() || "";
    if (!/\.(webp|png|jpe?g|svg)$/i.test(base)) continue;
    if (name.split("/").length > 3 && !name.includes("/profile/")) continue;
    try {
      await file.delete({ ignoreNotFound: true });
      n += 1;
    } catch {
      /* ignore */
    }
  }
  console.log("  partners/ (non-hero logos):", n);
}
console.log("  media/partners/", await wipePrefix("media/partners/"));

async function upload(slug, file) {
  const local = join(outDir, file);
  if (!existsSync(local)) return null;
  const storagePath = `media/partners/${file}`;
  const token = randomUUID();
  await bucket.file(storagePath).save(readFileSync(local), {
    resumable: false,
    metadata: {
      contentType: "image/webp",
      cacheControl: "public,max-age=31536000,immutable",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

console.log("Uploading HQ partner logos + updating Firestore…");
let i = 0;
for (const partner of PARTNERS) {
  const file = outName(partner);
  const url = await upload(partner.slug, file);
  if (!url) {
    console.log(`  skip ${partner.slug}`);
    continue;
  }

  const snap = await db
    .collection("partners")
    .where("slug", "==", partner.slug)
    .limit(1)
    .get();

  const payload = {
    name: partner.name,
    slug: partner.slug,
    logoUrl: url,
    logo: url,
    active: true,
    updatedAt: new Date().toISOString(),
  };

  if (!snap.empty) {
    await snap.docs[0].ref.set(payload, { merge: true });
  } else {
    await db
      .collection("partners")
      .doc(partner.slug)
      .set({ ...payload, sortOrder: i, createdAt: new Date().toISOString() }, { merge: true });
  }
  i += 1;
  console.log(`  ✓ ${partner.slug}`);
}

// Fix any partner docs still on faded /images/partners/*.webp (non-hero)
const all = await db.collection("partners").get();
for (const doc of all.docs) {
  const d = doc.data() || {};
  const logo = String(d.logoUrl || d.logo || "");
  if (
    logo.includes("/images/partners/") &&
    !logo.includes("/hero/") &&
    !logo.includes("partner-logos")
  ) {
    const slug = String(d.slug || doc.id);
    const partner = PARTNERS.find((p) => p.slug === slug);
    const file = partner ? outName(partner) : `${slug}.webp`;
    const url = await upload(slug, file);
    if (url) {
      await doc.ref.set(
        { logoUrl: url, logo: url, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      console.log(`  fixed ${slug}`);
    }
  }
}

console.log("\nDone. HQ transparent partner logos in /images/partner-logos + media/partners/");
console.log("NOTE: partner hero images under /images/partners/hero were wiped if Storage prefix partners/ included them — check heroes.");
