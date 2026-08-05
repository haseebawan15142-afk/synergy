/**
 * Create (or promote) the first Firebase Auth admin user + Firestore profile.
 *
 * Requires in .env.local:
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY
 *   ADMIN_EMAIL
 *   ADMIN_PASSWORD
 *
 * Usage: npm run admin:seed
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
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
loadEnvFile(resolve(process.cwd(), ".env"));

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD;

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Admin SDK credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local",
  );
  process.exit(1);
}

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const auth = getAuth();
const db = getFirestore();

async function main() {
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`Found existing Auth user: ${user.uid}`);
    await auth.updateUser(user.uid, { password });
    console.log("Password updated.");
  } catch (err) {
    if (err?.code === "auth/user-not-found") {
      user = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: "Site Admin",
      });
      console.log(`Created Auth user: ${user.uid}`);
    } else {
      throw err;
    }
  }

  const userRef = db.collection("users").doc(user.uid);
  const existing = await userRef.get();
  await userRef.set(
    {
      email,
      displayName: user.displayName || "Site Admin",
      role: "admin",
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );
  console.log("Firestore users/{uid} set with role: admin");

  await db.collection("activities").add({
    type: "admin.seed",
    message: "Admin account seeded",
    actorEmail: email,
    actorUid: user.uid,
    entity: "users",
    entityId: user.uid,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("Activity logged.");

  const settingsRef = db.collection("settings").doc("site");
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set({
      companyName: "Synergy Computers",
      tagline: "IT Solutions Pakistan",
      legalName: "Synergy Computers (Pvt.) Ltd.",
      description:
        "Pakistan's premium IT solutions provider — infrastructure, enterprise applications, security, and 24×7 support for over 40 years.",
      email: "info@synergy.net.pk",
      phoneDisplay: "021-34527060",
      phoneTel: "+922134527060",
      phones: ["021-34527060", "021-34540908", "021-34547068"],
      addressLine: "56-D, K.D.A Scheme No.1 Main Miran Muhammad Shah Road",
      addressCity: "Karachi",
      addressCountry: "Pakistan",
      socialLinkedin: "https://www.linkedin.com/company/synergy-computers/",
      socialFacebook: "https://www.facebook.com/SynergyCompuetsPvtLtd/",
      socialTwitter: "",
      socialInstagram: "",
      googleMapsUrl: "",
      businessHours: "Mon–Fri, 9:00 AM – 6:00 PM",
      copyright: "© Synergy Computers (Pvt.) Ltd. All rights reserved.",
      mission: "",
      vision: "",
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: user.uid,
    });
    console.log("Initialized settings/site defaults.");
  } else {
    console.log("settings/site already exists — left unchanged.");
  }

  console.log("\nDone. Sign in at /admin/login with ADMIN_EMAIL.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
