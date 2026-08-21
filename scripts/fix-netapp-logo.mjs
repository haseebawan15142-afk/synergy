import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnv(resolve(root, ".env.local"));

const url =
  "https://img.logo.dev/netapp.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&format=png&size=800&retina=true";
const res = await fetch(url);
const buf = Buffer.from(await res.arrayBuffer());

const { data, info } = await sharp(buf, { failOn: "none" })
  .ensureAlpha()
  .resize({ width: 800, height: 400, fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const sample = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
const corners = [sample(1, 1), sample(width - 2, 1), sample(1, height - 2), sample(width - 2, height - 2)];
const avg = (c) => Math.round(corners.reduce((s, p) => s + p[c], 0) / 4);
const pr = avg(0), pg = avg(1), pb = avg(2), pa = avg(3);
if (pa > 200) {
  for (let i = 0; i < data.length; i += channels) {
    if (Math.abs(data[i] - pr) + Math.abs(data[i + 1] - pg) + Math.abs(data[i + 2] - pb) < 90)
      data[i + 3] = 0;
  }
}
for (let i = 0; i < data.length; i += channels) {
  if (data[i + 3] < 30) continue;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  if (sat > 28 || lum > 90) continue;
  const lifted = Math.round(245 - lum * 0.2);
  data[i] = data[i + 1] = data[i + 2] = lifted;
}
let minX = width, minY = height, maxX = 0, maxY = 0;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * channels + 3] < 20) continue;
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
const pad = 16;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(height - 1, maxY + pad);
const cropW = maxX - minX + 1, cropH = maxY - minY + 1;
const targetH = 200;
const targetW = Math.max(200, Math.round(cropW * (targetH / cropH)));
const webp = await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .resize({ width: targetW, height: targetH, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 96, alphaQuality: 100 })
  .toBuffer();

const dest = join(root, "public/images/partner-logos/netapp.webp");
writeFileSync(dest, webp);
const m = await sharp(webp).metadata();
console.log("netapp", m.width, m.height, webp.length);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "synergy-9ea81.firebasestorage.app";
if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), storageBucket: bucketName });
}
const bucket = getStorage().bucket();
const db = getFirestore();
const storagePath = `media/partners/netapp-${randomUUID().slice(0, 8)}.webp`;
const file = bucket.file(storagePath);
await file.save(webp, { contentType: "image/webp", metadata: { cacheControl: "public,max-age=31536000,immutable" } });
try { await file.makePublic(); } catch {}
const publicUrl = `https://storage.googleapis.com/${bucketName}/${storagePath}`;
const snap = await db.collection("partners").where("slug", "==", "netapp").get();
for (const doc of snap.docs) {
  await doc.ref.update({ logoUrl: publicUrl, logo: publicUrl, updatedAt: new Date().toISOString() });
}
console.log("uploaded", publicUrl);
