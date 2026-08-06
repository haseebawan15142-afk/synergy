/**
 * Upload Selected Clientele WebP logos to Firebase Storage and seed
 * the `clients` Firestore collection for the admin CMS.
 *
 * Usage:
 *   npm run cms:seed-clients           → create missing only
 *   npm run cms:seed-clients -- --force → re-upload logos + overwrite docs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
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

const force = process.argv.includes("--force") || process.env.FORCE_MIGRATE === "1";

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

async function toWebpBuffer(filePath) {
  return sharp(readFileSync(filePath))
    .resize({ width: 640, height: 320, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function uploadClientLogo(slug, localRelativePath) {
  const absolute = resolve(root, "public", localRelativePath.replace(/^\//, ""));
  if (!existsSync(absolute)) {
    throw new Error(`Missing logo file: ${absolute}`);
  }

  const storagePath = `clients/${slug}.webp`;
  const file = bucket.file(storagePath);
  const token = randomUUID();
  const webp = await toWebpBuffer(absolute);

  await file.save(webp, {
    metadata: {
      contentType: "image/webp",
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: token,
        source: "cms:seed-clients",
        original: basename(absolute),
      },
    },
    resumable: false,
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function main() {
  const { clients } = await import(
    pathToFileURL(resolve(root, "scripts/migrate-data/clients.mjs")).href
  );

  console.log(
    force
      ? `Seeding ${clients.length} clients (FORCE — re-upload WebP + overwrite docs)…`
      : `Seeding ${clients.length} clients (skip existing docs)…`,
  );
  console.log(`Storage bucket: ${storageBucket}`);

  let created = 0;
  let skipped = 0;
  let uploaded = 0;

  for (const [index, client] of clients.entries()) {
    const slug = client.slug;
    process.stdout.write(`  [${index + 1}/${clients.length}] ${client.name}… `);

    try {
      const ref = db.collection("clients").doc(slug);
      const existing = await ref.get();

      if (!force && existing.exists) {
        skipped += 1;
        console.log("skip (exists)");
        continue;
      }

      const logoUrl = await uploadClientLogo(slug, client.logo);
      uploaded += 1;

      const absolute = resolve(root, "public", client.logo.replace(/^\//, ""));
      const size = existsSync(absolute) ? (await toWebpBuffer(absolute)).length : 0;

      await db
        .collection("media")
        .doc(`client-${slug}`)
        .set(
          {
            name: `${client.name}.webp`,
            url: logoUrl,
            path: `clients/${slug}.webp`,
            folder: "clients",
            contentType: "image/webp",
            size,
            alt: client.name,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      await ref.set(
        {
          name: client.name,
          slug,
          logoUrl,
          website: "",
          category: "Selected Clientele",
          sortOrder: index,
          featured: true,
          active: true,
          updatedAt: FieldValue.serverTimestamp(),
          migratedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      created += 1;
      console.log("ok");
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${err instanceof Error ? err.message : err}`);
    }
  }

  await db.collection("activities").add({
    type: "cms.seed-clients",
    message: `Seeded clients (${created} written, ${skipped} skipped, ${uploaded} logos uploaded)`,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(
    `\nDone. Docs written: ${created}, skipped: ${skipped}, logos uploaded: ${uploaded}.`,
  );
  console.log("Refresh /admin/clients — logos should appear in the CMS list.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
