import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv(p) {
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

async function toWebp(buf) {
  const { data, info } = await sharp(buf, { failOn: "none", density: 384 })
    .ensureAlpha()
    .resize({
      width: 640,
      height: 320,
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) data[i + 3] = 0;
  }
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] < 18) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  const pad = 12;
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

const fixes = [
  {
    slug: "mcdonalds",
    url: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/mcdonalds.svg",
  },
  {
    slug: "mcb-islamic",
    url: "https://www.mcb.com.pk/assets/images/favicon/apple-touch-icon.png",
  },
  {
    slug: "1link",
    url: "https://icons.duckduckgo.com/ip3/1link.net.pk.ico",
  },
];

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:
        process.env.FIREBASE_ADMIN_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      "synergy-9ea81.firebasestorage.app",
  });
}

const bucket = getStorage().bucket();
const db = getFirestore();
const bucketName =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  "synergy-9ea81.firebasestorage.app";

for (const f of fixes) {
  const r = await fetch(f.url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const buf = Buffer.from(await r.arrayBuffer());
  const webp = await toWebp(buf);
  writeFileSync(resolve(root, `public/images/client-logos/${f.slug}.webp`), webp);
  const token = randomUUID();
  const path = `media/clients/${f.slug}.webp`;
  await bucket.file(path).save(webp, {
    resumable: false,
    metadata: {
      contentType: "image/webp",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  const snap = await db.collection("clients").where("slug", "==", f.slug).limit(1).get();
  if (!snap.empty) {
    await snap.docs[0].ref.set(
      { logoUrl: url, logo: url, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  }
  console.log("fixed", f.slug, webp.length);
}
