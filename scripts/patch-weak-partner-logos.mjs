/**
 * Patch remaining weak partner logos + re-upload.
 * Usage: node scripts/patch-weak-partner-logos.mjs
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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
    )
      v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnv(resolve(root, ".env.local"));

async function toDarkUiWebp(inputBuf) {
  let pipeline = sharp(inputBuf, { failOn: "none" });
  const meta = await pipeline.metadata();
  if (meta.format === "svg") {
    pipeline = sharp(inputBuf, { failOn: "none", density: 512 });
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

  // Lift only clearly dark neutrals (avoid white fringe on brand colors)
  for (let i = 0; i < data.length; i += channels) {
    if (data[i + 3] < 30) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    const lum = (r + g + b) / 3;
    if (sat > 28) continue;
    if (lum > 90) continue;
    const lifted = Math.round(245 - lum * 0.2);
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
  const pad = 18;
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

const patches = [
  {
    slug: "lenovo",
    async load() {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/lenovo.svg",
      );
      let svg = await res.text();
      // Strip the solid banner rect baked into the icon
      svg = svg.replace(/M24 7\.997v8\.006H0V7\.997h24z/g, "");
      svg = svg.replace(/fill="[^"]*"/gi, 'fill="#E2231A"');
      if (!/fill="/i.test(svg)) {
        svg = svg.replace("<svg", '<svg fill="#E2231A"');
      }
      return Buffer.from(svg);
    },
  },
  {
    slug: "oracle",
    async load() {
      // Official-style oval wordmark via simple-icons (clean SVG)
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/oracle.svg",
      );
      let svg = await res.text();
      svg = svg.replace(/fill="[^"]*"/gi, 'fill="#C74634"');
      if (!/fill="/i.test(svg)) svg = svg.replace("<svg", '<svg fill="#C74634"');
      return Buffer.from(svg);
    },
  },
  {
    slug: "cisco",
    async load() {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/cisco.svg",
      );
      let svg = await res.text();
      svg = svg.replace(/fill="[^"]*"/gi, 'fill="#1BA0D7"');
      if (!/fill="/i.test(svg)) svg = svg.replace("<svg", '<svg fill="#1BA0D7"');
      return Buffer.from(svg);
    },
  },
  {
    slug: "veritas",
    async load() {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/veritas.svg",
      );
      let svg = await res.text();
      svg = svg.replace(/fill="[^"]*"/gi, 'fill="#A5198C"');
      if (!/fill="/i.test(svg)) svg = svg.replace("<svg", '<svg fill="#A5198C"');
      return Buffer.from(svg);
    },
  },
  {
    slug: "dynatrace",
    async load() {
      return readFileSync(resolve(root, "public/brand/dynatrace/wordmark.svg"));
    },
  },
  {
    slug: "dell",
    async load() {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/dell.svg",
      );
      let svg = await res.text();
      svg = svg.replace(/fill="[^"]*"/gi, 'fill="#007DB8"');
      if (!/fill="/i.test(svg)) svg = svg.replace("<svg", '<svg fill="#007DB8"');
      return Buffer.from(svg);
    },
  },
];

const results = [];
for (const p of patches) {
  process.stdout.write(`${p.slug} … `);
  const buf = await p.load();
  const webp = await toDarkUiWebp(buf);
  const file = `${p.slug}.webp`;
  writeFileSync(join(outDir, file), webp);
  const m = await sharp(webp).metadata();
  console.log(`OK ${m.width}x${m.height}`);
  results.push({ slug: p.slug === "dell" ? "dell-technologies" : p.slug, file, ok: true });
}

// cleanup previews
for (const f of readdirSync(outDir)) {
  if (f.startsWith("_preview-")) {
    try {
      unlinkSync(join(outDir, f));
    } catch {
      /* ignore */
    }
  }
}

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

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: bucketName,
  });
}
const db = getFirestore();
const bucket = getStorage().bucket();

for (const r of results) {
  const buf = readFileSync(join(outDir, r.file));
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
  for (const doc of snap.docs) {
    await doc.ref.update({
      logoUrl: publicUrl,
      logo: publicUrl,
      updatedAt: new Date().toISOString(),
    });
  }
  console.log("uploaded", r.slug);
}

console.log("Done.");
