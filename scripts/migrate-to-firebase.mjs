/**
 * Migrate local content modules into Firestore.
 * Requires Admin SDK env vars (same as admin:seed).
 *
 * Usage: npm run cms:migrate
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

async function upsert(col, id, data) {
  await db
    .collection(col)
    .doc(id)
    .set({ ...data, updatedAt: FieldValue.serverTimestamp(), migratedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function loadTsModule(relPath) {
  // Prefer compiled-like import via tsx-less approach: read and eval is fragile.
  // Instead parse known JSON-like exports by dynamically importing after registering ts-node — not available.
  // Use a small node script that imports from built paths — content is TS.
  // Fallback: spawn next-compatible dynamic import of .ts via jiti if present.
  try {
    const jiti = require("jiti")(import.meta.url);
    return jiti(resolve(root, relPath));
  } catch {
    // Manual minimal migration data embedded from known sources via dynamic import of .mjs mirrors
    return null;
  }
}

async function main() {
  console.log("Migrating content to Firestore…");

  // Inline migration from duplicated source-of-truth structures (keeps script runnable without jiti)
  const { services } = await import(pathToFileURL(resolve(root, "scripts/migrate-data/services.mjs")).href);
  const { leadership } = await import(pathToFileURL(resolve(root, "scripts/migrate-data/leadership.mjs")).href);
  const { jobs } = await import(pathToFileURL(resolve(root, "scripts/migrate-data/jobs.mjs")).href);
  const { partners } = await import(pathToFileURL(resolve(root, "scripts/migrate-data/partners.mjs")).href);
  const { site } = await import(pathToFileURL(resolve(root, "scripts/migrate-data/site.mjs")).href);

  const { nav: _nav, ...siteSettings } = site;
  await upsert("settings", "site", siteSettings);
  console.log("✓ settings/site");

  for (const s of services) {
    await upsert("services", s.slug, {
      title: s.title,
      slug: s.slug,
      description: s.summary,
      shortDescription: s.summary,
      imageUrl: s.image,
      sortOrder: services.indexOf(s),
      featured: true,
      status: "published",
      active: true,
    });
  }
  console.log(`✓ services (${services.length})`);

  for (const [i, m] of leadership.entries()) {
    const id = m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await upsert("leadership", id, {
      name: m.name,
      designation: m.title,
      bio: m.bio,
      photoUrl: m.photoSrc || "",
      sortOrder: i,
      featured: i < 2,
      active: true,
    });
  }
  console.log(`✓ leadership (${leadership.length})`);

  for (const [i, j] of jobs.entries()) {
    await upsert("careers", j.slug, {
      ...j,
      skills: [],
      description: `${j.title} — ${j.department} — ${j.location}`,
      status: "open",
      sortOrder: i,
      active: true,
    });
  }
  console.log(`✓ careers (${jobs.length})`);

  for (const [i, p] of partners.entries()) {
    const id = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await upsert("partners", id, {
      name: p.name,
      logoUrl: p.logo,
      website: p.href,
      sortOrder: i,
      featured: true,
      active: true,
    });
  }
  console.log(`✓ partners (${partners.length})`);

  // Blogs: migrate meta from generated JSON if present
  const blogsPath = resolve(root, "scripts/migrate-data/blogs.mjs");
  if (existsSync(blogsPath)) {
    const { blogs } = await import(pathToFileURL(blogsPath).href);
    let n = 0;
    for (const b of blogs) {
      await upsert("blogs", b.slug, {
        title: b.title,
        slug: b.slug,
        excerpt: b.title,
        bodyHtml: `<p>${b.title}</p>`,
        category: b.category || "General",
        tags: [],
        featuredImageUrl: b.image || "",
        author: "Synergy Computers",
        status: "published",
        publishedAt: b.date || null,
        relatedServiceSlug: b.relatedServiceSlug || "",
        featured: false,
        views: 0,
        readingTime: 3,
      });
      n += 1;
      if (n % 25 === 0) console.log(`  … ${n} blogs`);
    }
    console.log(`✓ blogs (${n})`);
  } else {
    console.log("• blogs.mjs not found — skipping blog body migration (run npm run cms:export-blogs first)");
  }

  await upsert("navigation", "primary", {
    items: site.nav || [],
  });
  await upsert("navigation", "footer", {
    items: [
      { id: "about", label: "About", href: "/about" },
      { id: "services", label: "Services", href: "/services" },
      { id: "partners", label: "Partners", href: "/partners" },
      { id: "resources", label: "Resources", href: "/resources" },
      { id: "contact", label: "Contact", href: "/contact" },
    ],
  });
  console.log("✓ navigation");

  await db.collection("activities").add({
    type: "cms.migrate",
    message: "Content migration completed",
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log("\nDone. Public site will prefer Firestore when collections are non-empty.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
