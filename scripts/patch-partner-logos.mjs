/**
 * Upload / patch Nutanix, Lenovo, IBM logos into Firestore + Storage
 * so the public site and Admin → Partners both show real logos.
 *
 * Usage: node scripts/patch-partner-logos.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, ".env.local"));

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

const targets = [
  { slug: "nutanix", local: "images/partners/profile/nutanix.svg" },
  { slug: "lenovo", local: "images/partners/profile/lenovo.svg" },
  { slug: "ibm", local: "images/partners/profile/ibm.svg" },
];

async function uploadSvg(localRel, storagePath) {
  const absolute = resolve(root, "public", localRel);
  if (!existsSync(absolute)) throw new Error(`Missing ${localRel}`);
  const token = randomUUID();
  const file = bucket.file(storagePath);
  await file.save(readFileSync(absolute), {
    metadata: {
      contentType: "image/svg+xml",
      cacheControl: "public,max-age=31536000,immutable",
      metadata: { firebaseStorageDownloadTokens: token, source: "patch-partner-logos" },
    },
    resumable: false,
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function main() {
  for (const t of targets) {
    process.stdout.write(`${t.slug}… `);
    const logoUrl = await uploadSvg(t.local, `partners/${t.slug}.svg`);
    const ref = db.collection("partners").doc(t.slug);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log("doc missing — creating");
    }
    await ref.set(
      {
        logoUrl,
        active: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    console.log("ok");
    console.log(`  ${logoUrl}`);
  }
  console.log("\nDone. Refresh /partners and Admin → Partners.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
