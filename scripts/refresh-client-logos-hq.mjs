/**
 * Refresh all client logos to high-quality transparent WebP.
 * Sources (in order): site apple-touch / og:image, DuckDuckGo, Google 256,
 * then keep previous only if nothing better.
 * Syncs Firebase Storage + Firestore and deletes old LQ objects.
 *
 * Usage: node scripts/refresh-client-logos-hq.mjs
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
const outDir = resolve(root, "public/images/client-logos");
const oldDir = resolve(root, "public/images/clients");

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

const CLIENTS = [
  { slug: "state-bank-of-pakistan", name: "State Bank of Pakistan", domains: ["sbp.org.pk"] },
  { slug: "meezan-bank", name: "Meezan Bank", domains: ["meezanbank.com"] },
  { slug: "standard-chartered", name: "Standard Chartered", domains: ["sc.com", "standardchartered.com"] },
  { slug: "ubl", name: "United Bank Limited", domains: ["ubldirect.com", "ubl.com.pk"] },
  { slug: "nadra", name: "NADRA", domains: ["nadra.gov.pk"] },
  { slug: "mol-group", name: "MOL Group", domains: ["molgroup.info", "mol.hu"] },
  { slug: "mcb-islamic", name: "MCB Islamic Bank", domains: ["mcbislamicbank.com", "mcb.com.pk"] },
  { slug: "bank-of-punjab", name: "Bank of Punjab", domains: ["bop.com.pk"] },
  { slug: "askari-bank", name: "Askari Bank", domains: ["askaribank.com"] },
  { slug: "bank-makramah", name: "Bank Makramah Limited", domains: ["bankmakramah.com"] },
  { slug: "bank-of-khyber", name: "Bank of Khyber", domains: ["bok.com.pk"] },
  { slug: "berger", name: "Berger Paints Pakistan", domains: ["berger.com.pk"] },
  { slug: "fatima-group", name: "Fatima Group", domains: ["fatima-group.com"] },
  { slug: "nrsp", name: "NRSP", domains: ["nrsp.org.pk"] },
  { slug: "mcb", name: "MCB Bank", domains: ["mcb.com.pk"] },
  { slug: "allied-bank", name: "Allied Bank", domains: ["abl.com"] },
  { slug: "soneri-bank", name: "Soneri Bank", domains: ["soneribank.com"] },
  { slug: "mobilink-microfinance-bank", name: "Mobilink Microfinance Bank", domains: ["mobilinkbank.com", "jazzcash.com.pk"] },
  { slug: "akdn", name: "Aga Khan Development Network", domains: ["akdn.org"] },
  { slug: "ztbl", name: "Zarai Taraqiati Bank Limited", domains: ["ztbl.com.pk"] },
  { slug: "celerity", name: "Celerity Logistics", domains: ["celerity.com.pk"] },
  { slug: "nrsp-microfinance-bank", name: "NRSP Microfinance Bank", domains: ["nrspbank.com"] },
  { slug: "engro", name: "Engro Corporation", domains: ["engro.com"] },
  { slug: "sngpl", name: "Sui Northern Gas Pipelines", domains: ["sngpl.com.pk"] },
  { slug: "k-electric", name: "K-Electric", domains: ["ke.com.pk"] },
  { slug: "pakistan-customs", name: "Pakistan Customs", domains: ["fbr.gov.pk"] },
  { slug: "dg-cement", name: "DG Cement", domains: ["dgcement.com"] },
  { slug: "ntc", name: "National Telecommunication Corporation", domains: ["ntc.net.pk"] },
  { slug: "jazz", name: "Jazz", domains: ["jazz.com.pk"] },
  { slug: "zong", name: "Zong 4G", domains: ["zong.com.pk"] },
  { slug: "ffbl", name: "FFBL", domains: ["ffbl.com"] },
  { slug: "ptcl", name: "PTCL", domains: ["ptcl.com.pk"] },
  { slug: "ktrade", name: "KTrade Securities", domains: ["ktrade.pk"] },
  { slug: "js-group", name: "Jahangir Siddiqui & Co.", domains: ["js.com"] },
  { slug: "ghani", name: "Ghani Global Holdings", domains: ["ghaniglobal.com"] },
  { slug: "bank-al-habib", name: "Bank AL Habib", domains: ["bankalhabib.com"] },
  { slug: "national-bank-of-oman", name: "National Bank of Oman", domains: ["nbo.om"] },
  { slug: "1link", name: "1LINK", domains: ["1link.net.pk"] },
  { slug: "sindh-bank", name: "Sindh Bank", domains: ["sindhbankltd.com"] },
  { slug: "mcdonalds", name: "McDonald's", domains: ["mcdonalds.com"], simpleIcon: "mcdonalds" },
  { slug: "nbp", name: "National Bank of Pakistan", domains: ["nbp.com.pk"] },
  { slug: "parco", name: "PARCO", domains: ["parco.com.pk"] },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SynergyLogoBot/2.0";

async function fetchBuffer(url, { minBytes = 600 } = {}) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
      headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" },
    });
    if (!res.ok) return null;
    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (ctype.includes("text/html")) return null;
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
        signal: AbortSignal.timeout(20000),
        headers: { "User-Agent": UA, Accept: "text/html" },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const base = res.url || origin;
      const patterns = [
        /<link[^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["']/gi,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["']/gi,
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
        /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/gi,
        /<link[^>]+href=["']([^"']+\.(?:png|svg|webp|jpg|jpeg))["'][^>]+rel=["'](?:icon|shortcut icon)["']/gi,
      ];
      for (const re of patterns) {
        let m;
        while ((m = re.exec(html))) {
          const u = absUrl(base, m[1]);
          if (u && !u.startsWith("data:")) found.push(u);
        }
      }
      // Common static paths
      for (const path of [
        "/apple-touch-icon.png",
        "/apple-touch-icon-precomposed.png",
        "/apple-touch-icon-180x180.png",
        "/favicon-196x196.png",
        "/favicon-32x32.png",
        "/img/logo.png",
        "/images/logo.png",
        "/assets/logo.png",
        "/static/logo.png",
      ]) {
        found.push(absUrl(base, path));
      }
      if (found.length) break;
    } catch {
      /* next origin */
    }
  }
  return [...new Set(found.filter(Boolean))];
}

async function scoreImage(buf) {
  try {
    const meta = await sharp(buf, { failOn: "none" }).metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    if (w < 48 || h < 48) return { score: 0, w, h };
    const area = w * h;
    let score = area;
    if (meta.format === "svg") score += 500_000;
    if (w >= 128 && h >= 128) score += 50_000;
    if (w >= 256 || h >= 256) score += 120_000;
    return { score, w, h, format: meta.format };
  } catch {
    return { score: 0, w: 0, h: 0 };
  }
}

async function downloadBest(client) {
  const candidates = [];

  if (client.simpleIcon) {
    candidates.push(
      `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${client.simpleIcon}.svg`,
      `https://cdn.simpleicons.org/${client.simpleIcon}`,
    );
  }

  for (const domain of client.domains) {
    candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    const scraped = await scrapeSiteIcons(domain);
    candidates.push(...scraped);
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`,
    );
  }

  let best = null;
  for (const url of candidates) {
    const hit = await fetchBuffer(url, { minBytes: 400 });
    if (!hit) continue;
    const scored = await scoreImage(hit.buf);
    if (scored.score <= 0) continue;
    if (!best || scored.score > best.score) {
      best = { ...hit, ...scored };
    }
    // Good enough early exit
    if (scored.w >= 180 && scored.h >= 180) break;
  }
  return best;
}

async function toTransparentWebp(inputBuf) {
  let pipeline = sharp(inputBuf, { failOn: "none" }).ensureAlpha();
  const meta = await pipeline.metadata();
  // Rasterize SVG at high DPI
  if (meta.format === "svg") {
    pipeline = sharp(inputBuf, { failOn: "none", density: 384 }).ensureAlpha();
  }

  const { data, info } = await pipeline
    .resize({
      width: 640,
      height: 320,
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const THRESH = 248;
  const SOFT = 230;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= THRESH && g >= THRESH && b >= THRESH) {
      data[i + 3] = 0;
      continue;
    }
    if (r >= SOFT && g >= SOFT && b >= SOFT) {
      const t = (THRESH - Math.min(r, g, b)) / (THRESH - SOFT);
      data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, t)));
    }
  }

  const cornerLum = (x, y) => {
    const i = (y * width + x) * channels;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  };
  const corners = [
    cornerLum(1, 1),
    cornerLum(width - 2, 1),
    cornerLum(1, height - 2),
    cornerLum(width - 2, height - 2),
  ];
  if (corners.filter((l) => l < 25).length >= 3) {
    for (let i = 0; i < data.length; i += channels) {
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum < 20) data[i + 3] = 0;
    }
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a < 18) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return sharp(inputBuf, { failOn: "none" })
      .ensureAlpha()
      .resize({ width: 320, height: 180, fit: "inside" })
      .webp({ quality: 94, alphaQuality: 100 })
      .toBuffer();
  }

  const pad = 14;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const targetH = 180;
  const targetW = Math.max(140, Math.round(cropW * (targetH / cropH)));

  return sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize({
      width: targetW,
      height: targetH,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 94, alphaQuality: 100 })
    .toBuffer();
}

mkdirSync(outDir, { recursive: true });

const summary = [];
for (const client of CLIENTS) {
  process.stdout.write(`${client.slug} … `);
  const best = await downloadBest(client);
  const outPath = join(outDir, `${client.slug}.webp`);

  if (!best) {
    if (existsSync(outPath)) {
      console.log("KEEP (no better source)");
      summary.push({ slug: client.slug, ok: true, kept: true });
      continue;
    }
    console.log("FAIL");
    summary.push({ slug: client.slug, ok: false });
    continue;
  }

  const webp = await toTransparentWebp(best.buf);
  writeFileSync(outPath, webp);
  console.log(`OK ${best.w}x${best.h} ← ${best.url.slice(0, 90)}`);
  summary.push({
    slug: client.slug,
    ok: true,
    w: best.w,
    h: best.h,
    url: best.url,
  });
}

console.log(
  `\nLocal: ${summary.filter((s) => s.ok).length}/${CLIENTS.length} ready`,
);

// Remove legacy LQ folder files
if (existsSync(oldDir)) {
  for (const f of readdirSync(oldDir)) {
    try {
      rmSync(join(oldDir, f), { force: true });
    } catch {
      /* ignore locks */
    }
  }
  console.log("Deleted legacy public/images/clients/*");
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
  console.warn("Skip Firebase — missing admin credentials");
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

console.log("Wiping old Storage client logos…");
console.log("  clients/", await wipePrefix("clients/"));
console.log("  media/clients/", await wipePrefix("media/clients/"));

async function upload(slug) {
  const local = join(outDir, `${slug}.webp`);
  if (!existsSync(local)) return null;
  const storagePath = `media/clients/${slug}.webp`;
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

console.log("Uploading HQ logos + updating Firestore…");
let i = 0;
for (const client of CLIENTS) {
  const url = await upload(client.slug);
  if (!url) continue;
  const snap = await db.collection("clients").where("slug", "==", client.slug).limit(1).get();
  const payload = {
    name: client.name,
    slug: client.slug,
    logoUrl: url,
    logo: url,
    category: "Selected Clientele",
    active: true,
    featured: true,
    sortOrder: i,
    updatedAt: new Date().toISOString(),
  };
  if (!snap.empty) await snap.docs[0].ref.set(payload, { merge: true });
  else
    await db
      .collection("clients")
      .doc(client.slug)
      .set({ ...payload, createdAt: new Date().toISOString() }, { merge: true });
  i += 1;
  console.log(`  ✓ ${client.slug}`);
}

// Remove any client docs pointing at deleted LQ paths / placeholders
const all = await db.collection("clients").get();
for (const doc of all.docs) {
  const d = doc.data() || {};
  const logo = String(d.logoUrl || d.logo || "");
  if (
    logo.includes("/images/clients/") ||
    logo.includes("wordmark-placeholder") ||
    !logo
  ) {
    const slug = String(d.slug || doc.id);
    const url = await upload(slug);
    if (url) {
      await doc.ref.set(
        { logoUrl: url, logo: url, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      console.log(`  fixed ${slug}`);
    }
  }
}

// Bump CMS cache key note
console.log("\nDone. Rule: HQ transparent logos only in /images/client-logos + media/clients/{slug}.webp");
console.log("Old LQ logos removed from local folder + Firebase Storage prefixes.");
