/**
 * Seed Firestore `newsletterIssues` with Dynatrace + partner editions.
 * Usage: npm run cms:seed-newsletter
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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

const issues = [
  {
    id: "dynatrace-partner-pakistan",
    title: "Pakistan's only Dynatrace partner",
    slug: "dynatrace-partner-pakistan",
    excerpt:
      "Synergy Computers is the exclusive authorized Dynatrace partner in Pakistan — bringing AI-powered observability to banking, telecom, aviation, and the public sector.",
    body: "From application performance and infrastructure monitoring to digital experience and automated operations, Synergy delivers Dynatrace software intelligence across enterprise environments nationwide.",
    coverUrl: "/images/dynatrace/innovate-singapore-01.webp",
    topic: "Dynatrace",
    href: "/partners/dynatrace",
    featured: true,
    sortOrder: 1,
    publishedAt: "2026-06-01",
  },
  {
    id: "veritas-data-resilience",
    title: "Veritas: data resilience for Pakistani enterprises",
    slug: "veritas-data-resilience",
    excerpt:
      "Protect critical workloads with Veritas backup, recovery, and information management — delivered and supported locally by Synergy.",
    body: "",
    coverUrl: "/images/partners/hero/veritas.webp",
    topic: "Veritas",
    href: "/partners/veritas",
    featured: false,
    sortOrder: 2,
    publishedAt: "2026-05-15",
  },
  {
    id: "cohesity-modern-data",
    title: "Cohesity: modern data management",
    slug: "cohesity-modern-data",
    excerpt:
      "Consolidate backup, files, and object data on a single platform — with Synergy as your Cohesity delivery partner in Pakistan.",
    body: "",
    coverUrl: "/brand/cohesity/wordmark.svg",
    topic: "Cohesity",
    href: "/partners/cohesity",
    featured: false,
    sortOrder: 3,
    publishedAt: "2026-04-20",
  },
  {
    id: "hitachi-vantara-infrastructure",
    title: "Hitachi Vantara: infrastructure that scales",
    slug: "hitachi-vantara-infrastructure",
    excerpt:
      "Storage and data infrastructure for demanding workloads — Synergy helps design, deploy, and operate Hitachi Vantara solutions.",
    body: "",
    coverUrl: "/images/partners/hero/hitachi-vantara.webp",
    topic: "Hitachi Vantara",
    href: "/partners/hitachi-vantara",
    featured: false,
    sortOrder: 4,
    publishedAt: "2026-03-10",
  },
  {
    id: "observability-managed-it",
    title: "Observability & managed IT roundup",
    slug: "observability-managed-it",
    excerpt:
      "How Pakistani enterprises are pairing observability platforms with managed services to keep digital channels reliable.",
    body: "",
    coverUrl: "/images/partners/hero/dynatrace.webp",
    topic: "Insights",
    href: "/resources",
    featured: false,
    sortOrder: 5,
    publishedAt: "2026-02-01",
  },
];

async function main() {
  console.log("Seeding newsletterIssues…");
  const keep = new Set(issues.map((i) => i.id));
  const snap = await db.collection("newsletterIssues").get();
  let removed = 0;
  for (const doc of snap.docs) {
    if (!keep.has(doc.id)) {
      await doc.ref.delete();
      removed += 1;
      console.log(`  removed stale: ${doc.id}`);
    }
  }

  for (const issue of issues) {
    const { id, ...data } = issue;
    await db
      .collection("newsletterIssues")
      .doc(id)
      .set(
        {
          ...data,
          status: "published",
          active: true,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    console.log(`  upserted: ${id}`);
  }

  console.log(`Done. ${issues.length} editions, ${removed} removed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
