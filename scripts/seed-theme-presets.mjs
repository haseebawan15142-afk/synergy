/**
 * Seed Pakistani event theme presets into Firestore `themePresets`.
 *
 * Usage:
 *   npm run cms:seed-theme-presets
 *   npm run cms:seed-theme-presets -- --force
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

const force = process.argv.includes("--force") || process.env.FORCE_MIGRATE === "1";

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

const DEFAULT_THEME = {
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

function withPalette(overrides) {
  return {
    ...DEFAULT_THEME,
    ...overrides,
    buttonBg: overrides.buttonBg || overrides.primary || DEFAULT_THEME.buttonBg,
  };
}

const PRESETS = [
  {
    id: "default",
    name: "Default / Corporate",
    eventKey: "default",
    emoji: "🏢",
    description: "Original Synergy Computers brand look.",
    isDefault: true,
    category: "seasonal",
    bannerEnabled: false,
    bannerMessage: "",
    tokens: { ...DEFAULT_THEME },
  },
  {
    id: "independence-day",
    name: "Independence Day",
    eventKey: "independence-day",
    emoji: "🇵🇰",
    description: "Celebrate 14 August with green & white.",
    category: "national",
    startDate: "08-14",
    endDate: "08-14",
    bannerEnabled: true,
    bannerMessage: "Happy Independence Day, Pakistan! 🇵🇰",
    tokens: withPalette({
      primary: "#01411c",
      secondary: "#0a3d2a",
      accent: "#f8fafc",
      background: "#f4faf6",
      buttonBg: "#01411c",
    }),
  },
  {
    id: "pakistan-day",
    name: "Pakistan Day",
    eventKey: "pakistan-day",
    emoji: " Crescent",
    description: "Formal green & white for 23 March.",
    category: "national",
    startDate: "03-23",
    endDate: "03-23",
    bannerEnabled: true,
    bannerMessage: "Pakistan Day — unity, faith, discipline.",
    tokens: withPalette({
      primary: "#006600",
      secondary: "#004d00",
      accent: "#f1f5f9",
      background: "#f7faf7",
      buttonBg: "#006600",
    }),
  },
  {
    id: "defence-day",
    name: "Defence Day",
    eventKey: "defence-day",
    emoji: "🛡️",
    description: "Muted deep green & gold — respectful tone.",
    category: "national",
    startDate: "09-06",
    endDate: "09-06",
    bannerEnabled: true,
    bannerMessage: "Honouring the defenders of Pakistan.",
    tokens: withPalette({
      primary: "#1b4332",
      secondary: "#081c15",
      accent: "#c9a227",
      background: "#f6f7f4",
      buttonBg: "#1b4332",
    }),
  },
  {
    id: "quaid-e-azam-day",
    name: "Quaid-e-Azam Day",
    eventKey: "quaid-e-azam-day",
    emoji: "🕊️",
    description: "Formal green & white for 25 December.",
    category: "national",
    startDate: "12-25",
    endDate: "12-25",
    bannerEnabled: true,
    bannerMessage: "Remembering Quaid-e-Azam Muhammad Ali Jinnah.",
    tokens: withPalette({
      primary: "#0b3d2e",
      secondary: "#06261c",
      accent: "#f1f5f9",
      background: "#f7faf8",
      buttonBg: "#0b3d2e",
    }),
  },
  {
    id: "kashmir-solidarity-day",
    name: "Kashmir Solidarity Day",
    eventKey: "kashmir-solidarity-day",
    emoji: "🤝",
    description: "Understated solidarity accent — 5 February.",
    category: "national",
    startDate: "02-05",
    endDate: "02-05",
    bannerEnabled: true,
    bannerMessage: "Standing in solidarity with Kashmir.",
    tokens: withPalette({
      primary: "#0f172a",
      secondary: "#1e293b",
      accent: "#0d5c3d",
      background: "#f8fafc",
      buttonBg: "#0d5c3d",
    }),
  },
  {
    id: "ramadan",
    name: "Ramadan",
    eventKey: "ramadan",
    emoji: "🌙",
    description: "Calm deep blue & gold. Edit dates yearly.",
    category: "religious",
    startDate: "02-18",
    endDate: "03-19",
    bannerEnabled: true,
    bannerMessage: "Ramadan Mubarak — peace and reflection.",
    tokens: withPalette({
      primary: "#0c2340",
      secondary: "#081628",
      accent: "#d4af37",
      background: "#f5f7fb",
      buttonBg: "#0c2340",
    }),
  },
  {
    id: "eid-ul-fitr",
    name: "Eid-ul-Fitr",
    eventKey: "eid-ul-fitr",
    emoji: "✨",
    description: "Bright festive palette. Edit dates yearly.",
    category: "religious",
    startDate: "03-20",
    endDate: "03-22",
    bannerEnabled: true,
    bannerMessage: "Eid Mubarak from Synergy Computers!",
    tokens: withPalette({
      primary: "#0f766e",
      secondary: "#115e59",
      accent: "#fbbf24",
      background: "#f0fdfa",
      buttonBg: "#0d9488",
    }),
  },
  {
    id: "eid-ul-adha",
    name: "Eid-ul-Adha",
    eventKey: "eid-ul-adha",
    emoji: "🕌",
    description: "Bright festive palette. Edit dates yearly.",
    category: "religious",
    startDate: "05-27",
    endDate: "05-29",
    bannerEnabled: true,
    bannerMessage: "Eid-ul-Adha Mubarak!",
    tokens: withPalette({
      primary: "#047857",
      secondary: "#065f46",
      accent: "#f59e0b",
      background: "#ecfdf5",
      buttonBg: "#059669",
    }),
  },
  {
    id: "new-year",
    name: "New Year",
    eventKey: "new-year",
    emoji: "🎆",
    description: "Clean minimal seasonal refresh.",
    category: "seasonal",
    startDate: "01-01",
    endDate: "01-01",
    bannerEnabled: true,
    bannerMessage: "Happy New Year from Synergy Computers!",
    tokens: withPalette({
      primary: "#334155",
      secondary: "#1e293b",
      accent: "#38bdf8",
      background: "#f8fafc",
      buttonBg: "#334155",
    }),
  },
];

// Fix pakistan-day emoji - I accidentally put " Crescent" - should be crescent/moon flag related
PRESETS.find((p) => p.id === "pakistan-day").emoji = "🇵🇰";

async function main() {
  console.log(`Seeding theme presets${force ? " (force)" : ""}…`);
  let written = 0;
  let skipped = 0;

  for (const preset of PRESETS) {
    const ref = db.collection("themePresets").doc(preset.id);
    const snap = await ref.get();
    if (snap.exists && !force) {
      console.log(`  skip: ${preset.id}`);
      skipped += 1;
      continue;
    }
    const { id, ...data } = preset;
    await ref.set(
      {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    );
    console.log(`  upserted: ${id}`);
    written += 1;

    const legacy = db.collection("theme").doc(`preset_${id}`);
    if ((await legacy.get()).exists) await legacy.delete();
  }

  await db.collection("theme").doc("originalBaseline").set(
    {
      ...DEFAULT_THEME,
      kind: "baseline",
      label: "Original Synergy corporate (pre event presets)",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`Done. wrote=${written} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
