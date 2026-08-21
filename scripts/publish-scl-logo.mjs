/**
 * Process the SCL logo (strip black plate, lift charcoal wordmark) and
 * publish it to Firebase Storage + Website Settings.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

const sourceCandidates = [
  resolve(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-Dell-Desktop-synergy-computer-website/assets/c__Users_Dell_AppData_Roaming_Cursor_User_workspaceStorage_b17c251aaac616116728c0771e4fbc1a_images_SCL-Logo-68847a19-4f53-4490-b650-699697eb59e3.png",
  ),
];

const source = sourceCandidates.find((p) => existsSync(p));
if (!source) {
  console.error("Source logo not found");
  process.exit(1);
}

function colorDistance(r, g, b, br, bg, bb) {
  const dr = r - br;
  const dg = g - bg;
  const db = b - bb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const sample = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
};

const edgePts = [];
const stepX = Math.max(1, Math.floor(width / 24));
const stepY = Math.max(1, Math.floor(height / 12));
for (let x = 0; x < width; x += stepX) {
  edgePts.push(sample(x, 1), sample(x, height - 2));
}
for (let y = 0; y < height; y += stepY) {
  edgePts.push(sample(1, y), sample(width - 2, y));
}

let nearBlack = 0;
for (const [r, g, b] of edgePts) {
  if ((r + g + b) / 3 < 28) nearBlack += 1;
}

// Force black plate when edges are mostly black (ignore green corner outliers).
const br = 0;
const bg = 0;
const bb = 0;
const bgLum = 0;
const threshold = 58;
const soft = threshold * 0.4;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const d = colorDistance(r, g, b, br, bg, bb);

  if (d <= soft) {
    data[i + 3] = 0;
    continue;
  }
  if (d < threshold) {
    const t = (d - soft) / (threshold - soft);
    data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, t)));
  }

  if (data[i + 3] < 12) continue;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = (r + g + b) / 3;
  const greenish = g > r + 18 && g > b + 18;
  if (greenish || sat > 0.28 || bgLum > 80) continue;
  if (lum < 100) {
    data[i] = 248;
    data[i + 1] = 248;
    data[i + 2] = 248;
  } else if (lum < 175) {
    data[i] = Math.min(255, r + 45);
    data[i + 1] = Math.min(255, g + 45);
    data[i + 2] = Math.min(255, b + 45);
  }
}

const outDir = resolve(root, "public/brand");
mkdirSync(outDir, { recursive: true });
const outPng = resolve(outDir, "logo-scl-nav.png");
const outWebp = resolve(outDir, "logo-scl-nav.webp");

const processed = sharp(Buffer.from(data), {
  raw: { width, height, channels: 4 },
});
await processed.clone().png().toFile(outPng);
await processed.clone().webp({ quality: 92 }).toFile(outWebp);
copyFileSync(outPng, resolve(outDir, "logo.png"));
copyFileSync(outPng, resolve(outDir, "logo-primary.png"));
copyFileSync(outPng, resolve(outDir, "logo-footer.png"));

let a0 = 0;
let a255 = 0;
let amid = 0;
for (let p = 3; p < data.length; p += 4) {
  const a = data[p];
  if (a === 0) a0 += 1;
  else if (a === 255) a255 += 1;
  else amid += 1;
}
console.log("Alpha:", {
  transparent: a0,
  opaque: a255,
  partial: amid,
  pctTransparent: Math.round((100 * a0) / (a0 + a255 + amid)),
  edgeNearBlackPct: Math.round((100 * nearBlack) / edgePts.length),
});

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
const storagePath = "media/logos/logo-scl-nav.webp";
const token = randomUUID();
const bytes = readFileSync(outWebp);

await bucket.file(storagePath).save(bytes, {
  contentType: "image/webp",
  metadata: {
    contentType: "image/webp",
    metadata: { firebaseStorageDownloadTokens: token },
  },
});

const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

await db.collection("media").doc("logo-scl-nav").set(
  {
    name: "logo-scl-nav.webp",
    url: downloadUrl,
    path: storagePath,
    folder: "logos",
    contentType: "image/webp",
    updatedAt: new Date().toISOString(),
  },
  { merge: true },
);

await db.collection("settings").doc("site").set(
  {
    logoUrl: downloadUrl,
    darkLogoUrl: downloadUrl,
    footerLogoUrl: downloadUrl,
    updatedAt: new Date().toISOString(),
  },
  { merge: true },
);

console.log("Published:", downloadUrl);
