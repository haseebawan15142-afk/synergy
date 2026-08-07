/**
 * Seed Firestore `offices` from company-profile defaults.
 * Usage: npm run cms:seed-offices
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
  console.error("Missing Firebase Admin credentials");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

const offices = [
  {
    id: "karachi",
    label: "Karachi — Head Office",
    city: "Karachi",
    country: "Pakistan",
    isHeadOffice: true,
    addressLines: ["56-D, K.D.A Scheme No.1", "Main Miran M. Shah Road", "Karachi"],
    phones: ["021-34527060", "021-34540908", "021-34547068"],
    fax: "021-34540907",
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    lat: 24.8821,
    lng: 67.0642,
    mapX: 44,
    mapY: 88,
    landmarkName: "Mazar-e-Quaid",
    landmarkImageUrl: "/images/offices/karachi-mazar-e-quaid.webp",
    landmarkBackgroundUrl: "/images/offices/bg-karachi-mazar.webp",
    sortOrder: 1,
  },
  {
    id: "islamabad",
    label: "Islamabad Office",
    city: "Islamabad",
    country: "Pakistan",
    addressLines: ["Units B & C, Block-1, Diplomatic Enclave G-5", "Islamabad"],
    phones: ["051-2828347-9", "051-2822951"],
    fax: "2824125",
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    lat: 33.7182,
    lng: 73.0674,
    mapX: 53,
    mapY: 40,
    landmarkName: "Faisal Mosque",
    landmarkImageUrl: "/images/offices/islamabad-faisal-vivid.webp",
    landmarkBackgroundUrl: "/images/offices/bg-islamabad-faisal.webp",
    sortOrder: 2,
  },
  {
    id: "lahore",
    label: "Lahore Office",
    city: "Lahore",
    country: "Pakistan",
    addressLines: ["House 130-F, Model Town", "Lahore"],
    phones: ["042-5846575-76", "042-5856475"],
    fax: "042-5856476",
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    lat: 31.4828,
    lng: 74.3214,
    mapX: 70,
    mapY: 48,
    landmarkName: "Minar-e-Pakistan",
    landmarkImageUrl: "/images/offices/lahore-minar-e-pakistan.webp",
    landmarkBackgroundUrl: "/images/offices/bg-lahore-minar.webp",
    sortOrder: 3,
  },
  {
    id: "gilgit",
    label: "Gilgit Office",
    city: "Gilgit",
    country: "Pakistan",
    addressLines: ["Gilgit"],
    phones: [],
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    addressPending: true,
    lat: 35.9208,
    lng: 74.308,
    mapX: 63,
    mapY: 14,
    landmarkName: "Gilgit",
    landmarkImageUrl: "/images/offices/gilgit-valley.webp",
    landmarkBackgroundUrl: "/images/offices/bg-gilgit-valley.webp",
    sortOrder: 4,
  },
  {
    id: "middle-east",
    label: "Synergy Computers Middle East",
    city: "Ras Al Khaimah",
    country: "United Arab Emirates",
    addressLines: [
      "CWEP0328 Compass Building",
      "Al Shohada Road, Al Hamra Industrial Zone-FZ",
      "Ras Al Khaimah, United Arab Emirates",
      "P.O. Box: 10055",
    ],
    phones: [],
    email: "info@synergy.net.pk",
    website: "https://www.synergy-me.ae",
    lat: 25.6845,
    lng: 55.7782,
    landmarkName: "Ras Al Khaimah",
    landmarkImageUrl: "/images/offices/ras-al-khaimah.webp",
    landmarkBackgroundUrl: "/images/offices/bg-rak-coast.webp",
    sortOrder: 5,
  },
];

async function main() {
  console.log("Seeding offices…");
  for (const office of offices) {
    const { id, ...data } = office;
    await db
      .collection("offices")
      .doc(id)
      .set(
        {
          ...data,
          active: true,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    console.log(`  upserted: ${id}`);
  }
  console.log(`Done. ${offices.length} offices.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
