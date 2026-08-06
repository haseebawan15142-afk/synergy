/**
 * Deploy firestore.rules using Admin SDK service account from .env.local
 * via the Firebase Rules REST API (no interactive firebase login).
 *
 * Usage: node scripts/deploy-firestore-rules.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

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
  console.error("Missing FIREBASE_ADMIN_* credentials in .env.local");
  process.exit(1);
}

const rulesPath = resolve(root, "firestore.rules");
if (!existsSync(rulesPath)) {
  console.error("firestore.rules not found");
  process.exit(1);
}

const source = readFileSync(rulesPath, "utf8");

async function main() {
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

  const headers = {
    Authorization: `Bearer ${token.token}`,
    "Content-Type": "application/json",
  };

  console.log(`Creating ruleset for project: ${projectId}…`);
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: {
          files: [{ name: "firestore.rules", content: source }],
        },
      }),
    },
  );
  const createBody = await createRes.json();
  if (!createRes.ok) {
    console.error("Failed to create ruleset:");
    console.error(JSON.stringify(createBody, null, 2));
    if (createRes.status === 403) {
      console.error(`
Permission denied. In Google Cloud Console → IAM, grant this service account:
  ${clientEmail}
the role: Firebase Rules Admin (roles/firebaserules.admin)
Then re-run: node scripts/deploy-firestore-rules.mjs
`);
    }
    process.exit(1);
  }

  const rulesetName = createBody.name;
  console.log(`Ruleset created: ${rulesetName}`);
  console.log("Publishing release cloud.firestore…");

  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        release: {
          name: `projects/${projectId}/releases/cloud.firestore`,
          rulesetName,
        },
      }),
    },
  );

  // Some projects need PUT create if release missing
  let releaseBody = await releaseRes.json();
  if (!releaseRes.ok) {
    const putRes = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: `projects/${projectId}/releases/cloud.firestore`,
          rulesetName,
        }),
      },
    );
    releaseBody = await putRes.json();
    if (!putRes.ok) {
      console.error("Failed to publish release:");
      console.error(JSON.stringify(releaseBody, null, 2));
      process.exit(1);
    }
  }

  console.log("Firestore rules deployed successfully.");
  console.log(JSON.stringify(releaseBody, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
