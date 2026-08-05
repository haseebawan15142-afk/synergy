/**
 * Download themed hero backgrounds for partner detail pages (Unsplash, free license).
 * Usage: node scripts/download-partner-heroes.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/images/partners/hero");
mkdirSync(outDir, { recursive: true });

/** slug → Unsplash source (w=1920) */
const heroes = {
  veritas:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80",
  dynatrace:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
  utimaco:
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80",
  oracle:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  netapp:
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1920&q=80",
  "hitachi-vantara":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80",
  infor:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
  "dell-technologies":
    "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=1920&q=80",
  ddn: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80&sat=-20",
  convene:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
  innovative:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
  "automation-anywhere":
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1920&q=80",
};

async function download(slug, url) {
  const dest = resolve(outDir, `${slug}.webp`);
  if (existsSync(dest)) {
    console.log(`skip ${slug} (exists)`);
    return;
  }
  const res = await fetch(url, {
    headers: { "User-Agent": "SynergyComputersWebsite/1.0 (partner hero assets)" },
  });
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(1920, 1080, { fit: "cover", position: "centre" })
    .webp({ quality: 78 })
    .toFile(dest);
  console.log(`✓ ${slug}.webp`);
}

async function main() {
  for (const [slug, url] of Object.entries(heroes)) {
    try {
      await download(slug, url);
    } catch (error) {
      console.error(`✗ ${slug}:`, error instanceof Error ? error.message : error);
    }
  }
}

main();
