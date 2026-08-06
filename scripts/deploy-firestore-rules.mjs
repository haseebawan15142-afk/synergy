/**
 * Deploy firestore.rules (+ storage.rules) using Admin SDK credentials from .env.local
 * via the Firebase Rules REST API.
 *
 * Usage:
 *   node scripts/deploy-firestore-rules.mjs
 *   node scripts/deploy-firestore-rules.mjs --storage   // include Storage rules
 *   node scripts/deploy-firestore-rules.mjs --all
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const includeStorage =
  process.argv.includes("--storage") || process.argv.includes("--all");

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
  console.error("Missing FIREBASE_ADMIN_* credentials in .env.local");
  process.exit(1);
}

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to get access token");
  return token.token;
}

async function deployRules({ token, fileName, releaseId, label }) {
  const filePath = resolve(root, fileName);
  if (!existsSync(filePath)) {
    throw new Error(`${fileName} not found`);
  }
  const source = readFileSync(filePath, "utf8");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  console.log(`\n→ Creating ${label} ruleset…`);
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: {
          files: [{ name: fileName, content: source }],
        },
      }),
    },
  );
  const createBody = await createRes.json();
  if (!createRes.ok) {
    console.error(JSON.stringify(createBody, null, 2));
    if (createRes.status === 403) {
      console.error(`
Permission denied. Grant Firebase Rules Admin to:
  ${clientEmail}
`);
    }
    throw new Error(`Failed to create ${label} ruleset`);
  }

  const rulesetName = createBody.name;
  console.log(`  Ruleset: ${rulesetName}`);
  console.log(`→ Publishing release ${releaseId}…`);

  const releaseName = `projects/${projectId}/releases/${releaseId}`;
  const patchRes = await fetch(
    `https://firebaserules.googleapis.com/v1/${releaseName}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        release: { name: releaseName, rulesetName },
      }),
    },
  );

  if (patchRes.ok) {
    console.log(`✓ ${label} rules deployed.`);
    return;
  }

  const postRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ name: releaseName, rulesetName }),
    },
  );
  const postBody = await postRes.json();
  if (!postRes.ok) {
    console.error(JSON.stringify(postBody, null, 2));
    throw new Error(`Failed to publish ${label} release`);
  }
  console.log(`✓ ${label} rules deployed.`);
}

async function main() {
  console.log(`Project: ${projectId}`);
  const token = await getAccessToken();

  await deployRules({
    token,
    fileName: "firestore.rules",
    releaseId: "cloud.firestore",
    label: "Firestore",
  });

  if (includeStorage) {
    await deployRules({
      token,
      fileName: "storage.rules",
      releaseId: "cloud.storage",
      label: "Storage",
    });
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
