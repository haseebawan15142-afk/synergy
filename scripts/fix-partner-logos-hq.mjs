/**
 * Rebuild ALL partner logos as sharp transparent WebPs for dark UI.
 * - Prefer local brand SVGs + official SVG wordmarks over logo.dev icons
 * - Knock out solid corner plates (white/black/any uniform color)
 * - Lift dark neutral text → light so logos read on dark marquees (keeps brand colors)
 *
 * Usage: node scripts/fix-partner-logos-hq.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
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

const LOGO_DEV = "pk_X-1ZO13GSgeOoUrIuJ6GMQ";
const logoDev = (domain) =>
  `https://img.logo.dev/${domain}?token=${LOGO_DEV}&format=png&size=800&retina=true`;
const simpleIcon = (slug) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg`;

/** @type {{ slug: string, file?: string, local?: string[], urls: string[], brandHex?: string }[]} */
const FIXES = [
  {
    slug: "veritas",
    urls: [simpleIcon("veritas"), logoDev("veritas.com")],
    brandHex: "#A5198C",
  },
  {
    slug: "dynatrace",
    local: ["public/brand/dynatrace/wordmark.svg"],
    urls: [simpleIcon("dynatrace"), logoDev("dynatrace.com")],
  },
  {
    slug: "utimaco",
    urls: [
      "https://utimaco.com/themes/custom/utimaco/logo.svg",
      logoDev("utimaco.com"),
    ],
  },
  {
    slug: "oracle",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
      simpleIcon("oracle"),
      logoDev("oracle.com"),
    ],
  },
  {
    slug: "netapp",
    urls: [simpleIcon("netapp"), logoDev("netapp.com")],
    brandHex: "#0067C5",
  },
  {
    slug: "hitachi-vantara",
    urls: [
      "https://www.hitachivantara.com/content/dam/hvac/hv-nav-logo-2025.svg",
      logoDev("hitachivantara.com"),
    ],
  },
  {
    slug: "infor",
    urls: [logoDev("infor.com")],
  },
  {
    slug: "dell-technologies",
    file: "dell.webp",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg",
      simpleIcon("dell"),
      logoDev("dell.com"),
    ],
  },
  {
    slug: "ddn",
    urls: [logoDev("ddn.com")],
  },
  {
    slug: "convene",
    urls: [logoDev("convene.com")],
  },
  {
    slug: "innovative",
    urls: [logoDev("iii.com"), logoDev("innovative.com")],
  },
  {
    slug: "automation-anywhere",
    urls: [logoDev("automationanywhere.com")],
  },
  {
    slug: "bmc-helix",
    urls: [logoDev("bmc.com")],
  },
  {
    slug: "enterprisedb",
    urls: [
      "https://www.enterprisedb.com/themes/custom/edb_theme/logo2.svg",
      logoDev("enterprisedb.com"),
    ],
  },
  {
    slug: "knowbe4",
    urls: [
      "https://www.knowbe4.com/hubfs/knowbe4-logo-blk-orange-cropped-rgb_fixed.svg",
      logoDev("knowbe4.com"),
    ],
  },
  {
    slug: "hexagon",
    urls: [logoDev("hexagon.com")],
  },
  {
    slug: "nutanix",
    local: ["public/images/partners/profile/nutanix.svg"],
    urls: [simpleIcon("nutanix"), logoDev("nutanix.com")],
    brandHex: "#024DA1",
  },
  {
    slug: "cohesity",
    local: [
      "public/brand/cohesity/wordmark-black-green.svg",
      "public/brand/cohesity/wordmark.svg",
    ],
    urls: [logoDev("cohesity.com")],
  },
  {
    slug: "pure-storage",
    urls: [logoDev("purestorage.com")],
  },
  {
    slug: "proxmox",
    urls: [
      "https://www.proxmox.com/images/proxmox/Proxmox_logo_standard_hex_400px.png",
      logoDev("proxmox.com"),
    ],
  },
  {
    slug: "lenovo",
    urls: [simpleIcon("lenovo"), logoDev("lenovo.com")],
    brandHex: "#E2231A",
  },
  {
    slug: "red-hat",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg",
      simpleIcon("redhat"),
      logoDev("redhat.com"),
    ],
  },
  {
    slug: "fujitsu",
    urls: [simpleIcon("fujitsu"), logoDev("fujitsu.com")],
    brandHex: "#FF0000",
  },
  {
    slug: "ibm",
    local: ["public/images/partners/profile/ibm.svg"],
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
      logoDev("ibm.com"),
    ],
  },
  {
    slug: "supermicro",
    urls: [
      "https://www.supermicro.com/sites/default/files/Super_Micro_Computer_Logo.svg",
      logoDev("supermicro.com"),
    ],
  },
  {
    slug: "cisco",
    urls: [simpleIcon("cisco"), logoDev("cisco.com")],
    brandHex: "#1BA0D7",
  },
  {
    slug: "arctera",
    urls: [logoDev("arctera.com")],
  },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchBuf(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: {
        "User-Agent": UA,
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (ctype.includes("text/html") || ctype.includes("application/json")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 120) return null;
    return { buf, url, ctype };
  } catch {
    return null;
  }
}

function tintSimpleIconSvg(svgText, hex) {
  const color = hex.startsWith("#") ? hex : `#${hex}`;
  if (/fill="/i.test(svgText)) {
    return svgText.replace(/fill="[^"]*"/gi, `fill="${color}"`);
  }
  return svgText.replace(/<svg\b/i, `<svg fill="${color}"`);
}

/**
 * HQ transparent WebP for dark UI:
 * 1) Knock out uniform corner plate
 * 2) Lift dark neutrals → light (keep saturated brand colors)
 */
async function toDarkUiWebp(inputBuf) {
  let pipeline = sharp(inputBuf, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (meta.format === "svg") {
    pipeline = sharp(inputBuf, {
      failOn: "none",
      density: 512,
    });
  }

  const { data, info } = await pipeline
    .ensureAlpha()
    .resize({
      width: 960,
      height: 420,
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const idx = (x, y) => (y * width + x) * channels;

  const sample = (x, y) => {
    const i = idx(x, y);
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const corners = [
    sample(1, 1),
    sample(width - 2, 1),
    sample(1, height - 2),
    sample(width - 2, height - 2),
  ];
  const avg = (c) =>
    Math.round(corners.reduce((s, p) => s + p[c], 0) / corners.length);
  const pr = avg(0);
  const pg = avg(1);
  const pb = avg(2);
  const pa = avg(3);
  const plateLum = (pr + pg + pb) / 3;

  // Uniform opaque plate from corners?
  const cornerSpread =
    Math.max(...corners.map((c) => Math.max(c[0], c[1], c[2]))) -
    Math.min(...corners.map((c) => Math.min(c[0], c[1], c[2])));
  const hasPlate = pa > 200 && cornerSpread < 28;

  if (hasPlate) {
    const thr = plateLum > 200 ? 28 : plateLum < 40 ? 32 : 38;
    for (let i = 0; i < data.length; i += channels) {
      const dr = Math.abs(data[i] - pr);
      const dg = Math.abs(data[i + 1] - pg);
      const db = Math.abs(data[i + 2] - pb);
      if (dr + dg + db <= thr * 3) data[i + 3] = 0;
    }
  }

  // Lift dark neutrals for dark UI (keep chroma / brand hues)
  for (let i = 0; i < data.length; i += channels) {
    if (data[i + 3] < 24) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    const lum = (r + g + b) / 3;
    if (sat > 42) continue; // brand color — keep
    if (lum > 165) continue; // already light
    // Map dark → light grey/white, mid greys → lighter
    const lifted = Math.round(255 - lum * 0.35);
    data[i] = lifted;
    data[i + 1] = lifted;
    data[i + 2] = lifted;
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[idx(x, y) + 3] < 20) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return sharp(inputBuf, { failOn: "none", density: 480 })
      .ensureAlpha()
      .resize({ width: 520, height: 240, fit: "inside" })
      .webp({ quality: 96, alphaQuality: 100 })
      .toBuffer();
  }

  const pad = 20;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const targetH = 200;
  const targetW = Math.max(200, Math.round(cropW * (targetH / cropH)));

  return sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize({
      width: targetW,
      height: targetH,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 96, alphaQuality: 100 })
    .toBuffer();
}

function outName(fix) {
  return fix.file || `${fix.slug}.webp`;
}

mkdirSync(outDir, { recursive: true });

// Clean preview junk
for (const f of readdirSync(outDir)) {
  if (f.startsWith("_preview-")) {
    try {
      unlinkSync(join(outDir, f));
    } catch {
      /* ignore */
    }
  }
}

const results = [];
for (const fix of FIXES) {
  process.stdout.write(`${fix.slug} … `);
  let hit = null;
  let source = "";

  for (const rel of fix.local || []) {
    const p = resolve(root, rel);
    if (!existsSync(p)) continue;
    hit = { buf: readFileSync(p) };
    source = `local:${rel}`;
    break;
  }

  if (!hit) {
    for (const url of fix.urls) {
      const got = await fetchBuf(url);
      if (!got) continue;
      try {
        let buf = got.buf;
        // Tint monochrome simple-icons with brand color when provided
        if (
          fix.brandHex &&
          url.includes("simple-icons") &&
          (got.ctype.includes("svg") || url.endsWith(".svg"))
        ) {
          buf = Buffer.from(tintSimpleIconSvg(buf.toString("utf8"), fix.brandHex));
        }
        const m = await sharp(buf, { failOn: "none", density: 128 }).metadata();
        if ((m.width || 0) < 16 && (m.height || 0) < 16 && m.format !== "svg") continue;
        hit = { buf, url: got.url };
        source = url.slice(0, 90);
        break;
      } catch {
        /* next */
      }
    }
  }

  if (!hit) {
    console.log("FAIL");
    results.push({ slug: fix.slug, ok: false });
    continue;
  }

  const webp = await toDarkUiWebp(hit.buf);
  const dest = join(outDir, outName(fix));
  writeFileSync(dest, webp);
  const meta = await sharp(webp).metadata();
  console.log(`OK ${meta.width}x${meta.height} ← ${source}`);
  results.push({ slug: fix.slug, ok: true, file: outName(fix), bytes: webp.length });
}

console.log(
  `\nFixed local: ${results.filter((r) => r.ok).length}/${FIXES.length}`,
);

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

console.log("Uploading to Storage + updating Firestore…");
for (const r of results) {
  if (!r.ok) {
    console.log("  skip", r.slug);
    continue;
  }
  const localPath = join(outDir, r.file);
  const buf = readFileSync(localPath);
  const storagePath = `media/partners/${r.slug}-${randomUUID().slice(0, 8)}.webp`;
  const file = bucket.file(storagePath);
  await file.save(buf, {
    contentType: "image/webp",
    metadata: { cacheControl: "public,max-age=31536000,immutable" },
  });
  try {
    await file.makePublic();
  } catch {
    /* ignore */
  }
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${storagePath}`;

  const snap = await db.collection("partners").where("slug", "==", r.slug).get();
  if (snap.empty) {
    console.log("  ✓", r.slug, "(local only)");
    continue;
  }
  for (const doc of snap.docs) {
    await doc.ref.update({
      logoUrl: publicUrl,
      logo: publicUrl,
      updatedAt: new Date().toISOString(),
    });
  }
  console.log("  ✓", r.slug);
}

console.log("Done.");
