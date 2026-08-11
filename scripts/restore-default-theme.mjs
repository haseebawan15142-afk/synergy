/**
 * Restore the original Synergy corporate theme (pre event-presets look).
 * Matches design-tokens: green #357c3c + accent #14b8a6.
 *
 * Usage: npm run cms:restore-default-theme
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

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

/** Original Synergy site brand (before event theme presets). */
const ORIGINAL_THEME = {
  primary: "#357c3c",
  secondary: "#2a813e",
  accent: "#14b8a6",
  text: "#0f172a",
  textMuted: "#64748b",
  buttonBg: "#357c3c",
  buttonText: "#ffffff",
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderRadius: "0.75rem",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSizeBase: "16px",
  containerWidth: "80rem",
  spacing: "1rem",
  animationsEnabled: true,
  darkModeDefault: "system",
};

const current = await db.collection("theme").doc("tokens").get();
console.log("Before:", {
  primary: current.data()?.primary,
  accent: current.data()?.accent,
});

await db.collection("theme").doc("previousTokens").set(
  { ...(current.data() || {}), updatedAt: FieldValue.serverTimestamp() },
  { merge: true },
);

await db.collection("theme").doc("tokens").set(
  { ...ORIGINAL_THEME, updatedAt: FieldValue.serverTimestamp() },
  { merge: true },
);

// Permanent baseline so admin can always return to pre-preset look
await db.collection("theme").doc("originalBaseline").set(
  {
    ...ORIGINAL_THEME,
    kind: "baseline",
    label: "Original Synergy corporate (pre event presets)",
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

await db.collection("themePresets").doc("default").set(
  {
    kind: "preset",
    name: "Default / Corporate",
    eventKey: "default",
    isDefault: true,
    tokens: ORIGINAL_THEME,
    startDate: "",
    endDate: "",
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

await db.collection("theme").doc("activePreset").set(
  {
    presetId: "default",
    eventKey: "default",
    activatedAt: new Date().toISOString(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

const after = await db.collection("theme").doc("tokens").get();
console.log("After (original Synergy brand):", {
  primary: after.data()?.primary,
  secondary: after.data()?.secondary,
  accent: after.data()?.accent,
  buttonBg: after.data()?.buttonBg,
});
console.log("Done. Hard-refresh the public site.");
