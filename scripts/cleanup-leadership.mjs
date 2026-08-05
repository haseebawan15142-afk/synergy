import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

loadEnvFile(resolve(process.cwd(), ".env.local"));

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

function badName(name) {
  const n = String(name || "")
    .trim()
    .toLowerCase();
  return !n || n === "n/a" || n === "na" || n === "null" || n === "undefined";
}

const snap = await db.collection("leadership").get();
let deleted = 0;
for (const doc of snap.docs) {
  const data = doc.data();
  if (badName(data.name)) {
    await doc.ref.delete();
    deleted += 1;
    console.log("deleted", doc.id, data.name);
  } else {
    console.log("keep", doc.id, data.name, "sortOrder=", data.sortOrder);
  }
}
console.log(`Done. Deleted ${deleted} invalid of ${snap.size}.`);
