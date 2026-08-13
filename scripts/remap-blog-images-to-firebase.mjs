/**
 * Point every blog featuredImageUrl at Firebase Storage (media/blogs/*)
 * instead of deleted local /images/blog/* paths.
 *
 * Usage: node scripts/remap-blog-images-to-firebase.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:
        process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const media = await db.collection("media").get();
const byFile = new Map();
for (const d of media.docs) {
  const x = d.data();
  const url = String(x.url || "").trim();
  if (!url) continue;
  const name = String(x.name || "").toLowerCase();
  const path = String(x.path || "").toLowerCase();
  if (name) byFile.set(name, url);
  if (path) byFile.set(path.split("/").pop() || path, url);
}

const blogs = await db.collection("blogs").get();
let updated = 0;
let skipped = 0;
let missing = 0;

for (const d of blogs.docs) {
  const x = d.data();
  const featured = String(x.featuredImageUrl || "").trim();
  const alreadyFirebase =
    featured.includes("firebasestorage.googleapis.com") ||
    featured.includes("storage.googleapis.com") ||
    featured.includes(".firebasestorage.app");

  if (alreadyFirebase) {
    skipped += 1;
    continue;
  }

  let file = "";
  if (featured.startsWith("/images/blog/")) {
    file = featured.split("/").pop()?.toLowerCase() || "";
  } else if (featured.includes("synergy.net.pk/img/")) {
    // no reliable media map for old img names — leave empty so UI stays safe
    await d.ref.set(
      {
        featuredImageUrl: "",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    missing += 1;
    continue;
  } else if (!featured) {
    // try slug.webp in media
    file = `${String(x.slug || d.id).toLowerCase()}.webp`;
  } else {
    file = featured.split("/").pop()?.toLowerCase() || "";
  }

  const url = file ? byFile.get(file) : "";
  if (!url) {
    missing += 1;
    console.log("no media match", d.id, featured || "(empty)");
    continue;
  }

  await d.ref.set(
    {
      featuredImageUrl: url,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  updated += 1;
}

console.log({ updated, skippedAlreadyFirebase: skipped, missingOrCleared: missing });
