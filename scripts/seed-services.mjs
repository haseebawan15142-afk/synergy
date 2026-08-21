/**
 * Sync local services (+ heroes/card images) into Firestore + Storage.
 *
 * Usage:
 *   npm run cms:seed-services           → create missing only
 *   npm run cms:seed-services -- --force → overwrite docs + re-upload media
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
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

function loadLocal() {
  const jiti = require("jiti")(import.meta.url);
  const servicesMod = jiti(resolve(root, "src/lib/content/services.ts"));
  const detailsMod = jiti(resolve(root, "src/lib/content/service-details.ts"));
  return {
    services: servicesMod.services || [],
    details: detailsMod.serviceDetails || [],
  };
}

function pipeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const title = String(row?.title || "").trim();
      const description = String(row?.description || "").trim();
      if (!title) return "";
      return description ? `${title} | ${description}` : title;
    })
    .filter(Boolean);
}

async function uploadLocalImage(localPath, storagePath, { width = 1920 } = {}) {
  if (!localPath || String(localPath).startsWith("http")) return localPath || "";
  const absolute = resolve(root, "public", String(localPath).replace(/^\//, ""));
  if (!existsSync(absolute)) {
    console.warn(`    missing file: ${localPath}`);
    return localPath;
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

  const token = randomUUID();
  const webp = await sharp(readFileSync(absolute))
    .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toBuffer();

  await file.save(webp, {
    metadata: {
      contentType: "image/webp",
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: token,
        source: "cms:seed-services",
      },
    },
    resumable: false,
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function upsertService(id, data) {
  const ref = db.collection("services").doc(id);
  if (!force) {
    const existing = await ref.get();
    if (existing.exists) {
      console.log(`  skip ${id} (exists)`);
      return "skipped";
    }
  }
  await ref.set(
    {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      migratedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`  upsert ${id}`);
  return "written";
}

async function syncHeaderNav() {
  const ref = db.collection("navigation").doc("primary");
  const snap = await ref.get();
  const defaults = [
    { id: "about", label: "About", href: "/about" },
    { id: "services", label: "Services", href: "/services" },
    { id: "partners", label: "Partners", href: "/partners" },
    { id: "resources", label: "Insights", href: "/resources" },
    { id: "careers", label: "Careers", href: "/careers" },
  ];

  if (!snap.exists) {
    if (!force) {
      console.log("  skip navigation/primary (missing, non-force)");
      return;
    }
    await ref.set({
      items: defaults,
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log("  created navigation/primary");
    return;
  }

  const data = snap.data() || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const filtered = items.filter((item) => {
    const href = String(item?.href || "").trim();
    const label = String(item?.label || "").trim();
    if (/^\/industries(\/|$)/i.test(href)) return false;
    if (/^industries$/i.test(label)) return false;
    return Boolean(label && href);
  });

  if (filtered.length === items.length && !force) {
    console.log("  navigation/primary already clean");
    return;
  }

  await ref.set(
    {
      items: filtered.length ? filtered : defaults,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`  navigation/primary updated (${filtered.length || defaults.length} items)`);
}

async function uploadSiteAsset(localPath, storagePath) {
  return uploadLocalImage(localPath, storagePath, { width: 2400 });
}

async function main() {
  console.log(
    force
      ? "Seeding services to CMS… (FORCE — overwrite + re-upload)"
      : "Seeding services to CMS… (admin-safe — skips existing)",
  );

  const { services, details } = loadLocal();
  const detailBySlug = new Map(details.map((d) => [String(d.slug).toLowerCase(), d]));

  let written = 0;
  let skipped = 0;

  for (const [index, service] of services.entries()) {
    const slug = String(service.slug || "").trim();
    if (!slug) continue;
    const detail = detailBySlug.get(slug.toLowerCase());

    const imageUrl = await uploadLocalImage(
      service.image,
      `services/${slug}.webp`,
      { width: 1400 },
    );
    const heroImageUrl = await uploadLocalImage(
      detail?.heroImage || service.image,
      `services/heroes/${slug}.webp`,
      { width: 2400 },
    );

    const payload = {
      title: service.title,
      slug,
      shortDescription: service.summary,
      description: service.summary,
      headline: detail?.headline || service.title,
      lead: detail?.lead || service.summary,
      challenge: detail?.challenge || "",
      approach: detail?.approach || "",
      benefits: detail?.benefits || "",
      capabilities: pipeRows(detail?.capabilities),
      outcomes: pipeRows(detail?.outcomes),
      icon: service.icon || "",
      iconUrl: service.iconUrl || "",
      imageUrl,
      bannerUrl: heroImageUrl,
      heroImageUrl,
      sortOrder: index,
      featured: true,
      status: "published",
      active: true,
    };

    const result = await upsertService(slug, payload);
    if (result === "written") written += 1;
    else skipped += 1;
  }

  console.log("Syncing header nav (remove Industries)…");
  await syncHeaderNav();

  console.log("Uploading contact + CTA media…");
  await uploadSiteAsset("/images/contact/hero-background.png", "contact/hero-background.webp");
  await uploadSiteAsset("/images/home/cta-band-bg.png", "home/cta-band-bg.webp");

  // Drop retired services if still present
  if (force) {
    for (const retired of ["microsoft-365-cloud", "managed-it"]) {
      const ref = db.collection("services").doc(retired);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.delete();
        console.log(`  deleted services/${retired}`);
      }
    }
  }

  await db.collection("activities").add({
    type: "cms.seed-services",
    message: `Services synced (written=${written}, skipped=${skipped}, force=${force})`,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`Done. written=${written} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
