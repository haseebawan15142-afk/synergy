/**
 * Replace Firestore `leadership` collection with Board of Directors (Company Profile 2026).
 * Usage: npm run cms:seed-board
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/^mr\.\s*/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const { leadership } = await import(
    pathToFileURL(resolve(root, "scripts/migrate-data/leadership.mjs")).href
  );

  console.log("Seeding Board of Directors into leadership collection…");

  const snap = await db.collection("leadership").get();
  const keepIds = new Set(leadership.map((m) => slugify(m.name)));
  let removed = 0;
  for (const doc of snap.docs) {
    if (!keepIds.has(doc.id)) {
      await doc.ref.delete();
      removed += 1;
      console.log(`  removed stale: ${doc.id}`);
    }
  }

  for (const [i, m] of leadership.entries()) {
    const id = slugify(m.name);
    await db
      .collection("leadership")
      .doc(id)
      .set(
        {
          name: m.name,
          designation: m.title,
          bio: m.bio,
          photoUrl: m.photoSrc || "",
          department: "Board of Directors",
          linkedin: "",
          sortOrder: i,
          featured: true,
          active: true,
          updatedAt: FieldValue.serverTimestamp(),
          migratedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    console.log(`  ✓ ${m.name} — ${m.title}`);
  }

  await db.collection("activities").add({
    type: "cms.seed-board",
    message: `Board of Directors seeded (${leadership.length} members, ${removed} stale removed)`,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`\nDone. ${leadership.length} board members written, ${removed} old profiles removed.`);
  console.log("Open /admin/leadership — now labeled Board of Directors.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
