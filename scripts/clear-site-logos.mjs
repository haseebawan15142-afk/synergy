import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnv(resolve(root, ".env.local"));

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:
        process.env.FIREBASE_ADMIN_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const before = (await db.collection("settings").doc("site").get()).data() || {};
console.log("Before:", {
  logoUrl: before.logoUrl || null,
  darkLogoUrl: before.darkLogoUrl || null,
  footerLogoUrl: before.footerLogoUrl || null,
});

// Respect admin clear: wipe logo fields so site shows text brand.
await db.collection("settings").doc("site").set(
  {
    logoUrl: "",
    darkLogoUrl: "",
    footerLogoUrl: "",
    updatedAt: new Date().toISOString(),
  },
  { merge: true },
);

const after = (await db.collection("settings").doc("site").get()).data() || {};
console.log("After:", {
  logoUrl: after.logoUrl || null,
  darkLogoUrl: after.darkLogoUrl || null,
  footerLogoUrl: after.footerLogoUrl || null,
});
