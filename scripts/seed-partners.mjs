/**
 * Seed all local partners (src/lib/content/partners.ts) into Firestore.
 * Uploads local logo/hero images to Storage as WebP when files exist under public/.
 *
 * Usage:
 *   npm run cms:seed-partners           → create missing only
 *   npm run cms:seed-partners -- --force → overwrite docs + re-upload media
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const require = createRequire(import.meta.url);

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

function loadLocalPartners() {
  const jiti = require("jiti")(import.meta.url);
  const mod = jiti(resolve(root, "src/lib/content/partners.ts"));
  return mod.partners || [];
}

function slugify(name, slug) {
  if (slug) return String(slug);
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uploadLocalImage(localPath, storagePath) {
  if (!localPath || localPath.startsWith("http")) return localPath || "";
  const absolute = resolve(root, "public", localPath.replace(/^\//, ""));
  if (!existsSync(absolute)) {
    console.warn(`    missing file: ${localPath}`);
    return localPath; // keep public path as fallback
  }

  const file = bucket.file(storagePath);
  if (!force) {
    const [exists] = await file.exists();
    if (exists) {
      const [meta] = await file.getMetadata();
      const token = meta.metadata?.firebaseStorageDownloadTokens;
      if (token) {
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
      }
    }
  }

  const isSvg = absolute.toLowerCase().endsWith(".svg");
  const token = randomUUID();
  if (isSvg) {
    await file.save(readFileSync(absolute), {
      metadata: {
        contentType: "image/svg+xml",
        cacheControl: "public,max-age=31536000,immutable",
        metadata: { firebaseStorageDownloadTokens: token, source: "cms:seed-partners" },
      },
      resumable: false,
    });
  } else {
    const webp = await sharp(readFileSync(absolute))
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    await file.save(webp, {
      metadata: {
        contentType: "image/webp",
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
          source: "cms:seed-partners",
          original: basename(absolute),
        },
      },
      resumable: false,
    });
  }

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function main() {
  const partners = loadLocalPartners();
  console.log(
    force
      ? `Seeding ${partners.length} partners (FORCE)…`
      : `Seeding ${partners.length} partners (skip existing docs)…`,
  );

  let created = 0;
  let skipped = 0;
  let updatedMedia = 0;

  for (const [index, partner] of partners.entries()) {
    const slug = slugify(partner.name, partner.slug);
    process.stdout.write(`  [${index + 1}/${partners.length}] ${partner.name}… `);

    try {
      const ref = db.collection("partners").doc(slug);
      const existing = await ref.get();

      if (!force && existing.exists) {
        skipped += 1;
        console.log("skip (exists)");
        continue;
      }

      const logoUrl = await uploadLocalImage(
        partner.logo,
        `partners/${slug}${String(partner.logo || "").endsWith(".svg") ? ".svg" : ".webp"}`,
      );
      const heroImageUrl = partner.heroImageUrl
        ? await uploadLocalImage(partner.heroImageUrl, `partners/hero/${slug}.webp`)
        : "";
      if (logoUrl.startsWith("http") || heroImageUrl.startsWith("http")) updatedMedia += 1;

      await ref.set(
        {
          name: partner.name,
          slug,
          logoUrl: logoUrl || "",
          website: partner.href && partner.href !== "#" ? partner.href : "",
          heroImageUrl: heroImageUrl || "",
          taglines: partner.taglines || [],
          shortDescription: partner.shortDescription || "",
          overview: partner.overview || "",
          keySolutions: partner.keySolutions || [],
          category: partner.category || "",
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
    type: "cms.seed-partners",
    message: `Seeded partners (${created} written, ${skipped} skipped)`,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(
    `\nDone. Docs written: ${created}, skipped: ${skipped}, media touched: ${updatedMedia}.`,
  );
  console.log("Refresh /admin/partners — all partners should appear for edit/delete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
