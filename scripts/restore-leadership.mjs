import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { leadership } from "./migrate-data/leadership.mjs";

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

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

for (const [i, m] of leadership.entries()) {
  const id = m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await db.collection("leadership").doc(id).set(
    {
      name: m.name,
      designation: m.title,
      bio: m.bio,
      photoUrl: m.photoSrc || "",
      sortOrder: i,
      featured: i < 2,
      active: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log("restored", id, m.name, "sortOrder=", i);
}

console.log("Leadership restored.");
