/**
 * Push the digital brand palette into Firestore `theme/tokens`.
 * Usage: node scripts/apply-brand-theme.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

/** Full digital palette from brand brief. */
const THEME = {
  primary: "#7C3AED",
  secondary: "#C026D3",
  accent: "#FF6A00",
  text: "#F5F0FF",
  textMuted: "#C9C3D6",
  buttonBg: "#7C3AED",
  buttonText: "#ffffff",
  background: "#05030A",
  surface: "#12101C",
  border: "#3A2A58",
  borderRadius: "1rem",
  shadow: "0 16px 48px rgba(124, 58, 237, 0.22)",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSizeBase: "16px",
  containerWidth: "80rem",
  spacing: "1rem",
  animationsEnabled: true,
  darkModeDefault: "dark",
};

const db = getFirestore();
await db.collection("theme").doc("tokens").set(
  {
    ...THEME,
    activePresetId: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);
await db.collection("themePresets").doc("default").set(
  {
    kind: "preset",
    name: "Default / Digital Brand",
    eventKey: "default",
    isDefault: true,
    tokens: THEME,
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);
console.log("Theme updated:", THEME.primary, THEME.accent, THEME.background);
