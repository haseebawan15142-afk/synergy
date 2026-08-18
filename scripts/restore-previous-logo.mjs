/**
 * Restore previous Synergy logo in Firestore/Storage and delete the digital mark.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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

const localLogo = resolve(root, "public/brand/logo.png");
const storagePath = "media/logos/logo-synergy.png";
const token = crypto.randomUUID();

await bucket.upload(localLogo, {
  destination: storagePath,
  metadata: {
    contentType: "image/png",
    metadata: { firebaseStorageDownloadTokens: token },
  },
});

const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

await db.collection("media").doc("logo-synergy").set(
  {
    name: "logo-synergy.png",
    url: downloadUrl,
    path: storagePath,
    folder: "logos",
    contentType: "image/png",
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

try {
  await db.collection("media").doc("logo-synergy-digital").delete();
} catch {
  /* ignore */
}

try {
  await bucket
    .file("media/logos/logo-synergy-digital.png")
    .delete({ ignoreNotFound: true });
} catch {
  /* ignore */
}

console.log("Restored previous logo:", downloadUrl);
console.log("Deleted logo-synergy-digital from Storage/media.");
