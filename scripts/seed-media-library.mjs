/**
 * Index every public site asset into Firebase Storage + Firestore `media`
 * so Admin → Media Library shows partners, offices, clients, blogs, etc.
 *
 * Does NOT rewrite CMS document URLs — the live site keeps working as-is.
 * Admins can then browse / reuse / delete unused files from Media Library.
 *
 * Usage:
 *   npm run cms:seed-media
 *   npm run cms:seed-media -- --force   → re-upload even if Storage object exists
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join, relative, extname, basename } from "node:path";
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
loadEnvFile(resolve(root, ".env"));

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  process.env.FIREBASE_STORAGE_BUCKET ||
  `${projectId}.appspot.com`;

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

const force = process.argv.includes("--force");

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

const IMAGE_EXT = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".mp4",
  ".webm",
  ".pdf",
]);

/**
 * Local public folders → Media Library category (Storage prefix).
 * Inspected from the live site assets (partners, offices, clients, …).
 */
const SEED_MAP = [
  { localDir: "public/images/partners/hero", folder: "partners/hero" },
  { localDir: "public/images/partners/profile", folder: "partners" },
  { localDir: "public/images/partners", folder: "partners", shallow: true },
  { localDir: "public/images/offices", folder: "offices" },
  { localDir: "public/images/clients", folder: "clients" },
  { localDir: "public/images/services/heroes", folder: "services/heroes" },
  { localDir: "public/images/services", folder: "services", shallow: true },
  { localDir: "public/images/blog", folder: "blogs" },
  { localDir: "public/images/leadership", folder: "leadership" },
  { localDir: "public/images/careers", folder: "careers" },
  { localDir: "public/images/case-studies", folder: "gallery" },
  { localDir: "public/images/dynatrace", folder: "gallery" },
  { localDir: "public/images/hero", folder: "hero" },
  { localDir: "public/brand", folder: "logos" },
  { localDir: "public/videos/hero", folder: "hero" },
  { localDir: "public/videos", folder: "hero", shallow: true },
];

function contentTypeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  const map = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

function walkFiles(absDir, { shallow = false } = {}) {
  if (!existsSync(absDir)) return [];
  const out = [];
  for (const entry of readdirSync(absDir)) {
    if (entry.startsWith(".")) continue;
    if (entry.endsWith(".opt.tmp")) continue;
    const full = join(absDir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!shallow) out.push(...walkFiles(full, { shallow: false }));
      continue;
    }
    if (!IMAGE_EXT.has(extname(entry).toLowerCase())) continue;
    out.push(full);
  }
  return out;
}

function mediaDocId(storagePath) {
  return storagePath.replace(/[/#.[\]*]/g, "_").slice(0, 700);
}

async function uploadAndIndex(absFile, folder) {
  const name = basename(absFile);
  const storagePath = `${folder}/${name}`;
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();

  let token = randomUUID();
  let url = "";

  if (exists && !force) {
    const [meta] = await file.getMetadata();
    token = meta.metadata?.firebaseStorageDownloadTokens || token;
    if (!meta.metadata?.firebaseStorageDownloadTokens) {
      await file.setMetadata({
        metadata: {
          ...(meta.metadata || {}),
          firebaseStorageDownloadTokens: token,
        },
      });
    }
    url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
  } else {
    const body = readFileSync(absFile);
    await file.save(body, {
      metadata: {
        contentType: contentTypeFor(absFile),
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
          source: "cms:seed-media-library",
          originalLocal: relative(root, absFile).replace(/\\/g, "/"),
        },
      },
      resumable: false,
    });
    url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
  }

  const size = statSync(absFile).size;
  const id = mediaDocId(storagePath);
  await db
    .collection("media")
    .doc(id)
    .set(
      {
        name,
        url,
        path: storagePath,
        folder,
        contentType: contentTypeFor(absFile),
        size,
        alt: name,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        source: "cms:seed-media-library",
      },
      { merge: true },
    );

  return { storagePath, uploaded: !exists || force };
}

async function main() {
  console.log(
    force
      ? "Seeding Media Library (FORCE re-upload)…"
      : "Seeding Media Library (skip existing Storage objects)…",
  );

  let total = 0;
  let uploaded = 0;
  let indexed = 0;
  const seenStorage = new Set();

  for (const entry of SEED_MAP) {
    const absDir = resolve(root, entry.localDir);
    const files = walkFiles(absDir, { shallow: Boolean(entry.shallow) });
    if (!files.length) {
      console.log(`  [${entry.folder}] (no files in ${entry.localDir})`);
      continue;
    }
    console.log(`  [${entry.folder}] ${files.length} file(s) from ${entry.localDir}`);

    for (const file of files) {
      const name = basename(file);
      const storagePath = `${entry.folder}/${name}`;
      if (seenStorage.has(storagePath)) continue;
      seenStorage.add(storagePath);

      total += 1;
      try {
        const result = await uploadAndIndex(file, entry.folder);
        indexed += 1;
        if (result.uploaded) uploaded += 1;
        process.stdout.write(".");
      } catch (err) {
        console.log(`\n    FAIL ${storagePath}: ${err instanceof Error ? err.message : err}`);
      }
    }
    console.log("");
  }

  await db.collection("activities").add({
    type: "cms.seed-media-library",
    message: `Seeded media library (${indexed} indexed, ${uploaded} uploaded)`,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(
    `\nDone. Files considered: ${total}, indexed in media: ${indexed}, newly uploaded: ${uploaded}.`,
  );
  console.log("Open Admin → Media → Sync from Storage (optional) → browse by folder.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
