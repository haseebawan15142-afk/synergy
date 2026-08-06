/**
 * Download client logos (Clearbit + fallbacks) and convert to WebP.
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "public/images/clients";

/** @type {{ slug: string, name: string, domains: string[] }[]} */
const CLIENTS = [
  { slug: "state-bank-of-pakistan", name: "State Bank of Pakistan", domains: ["sbp.org.pk"] },
  { slug: "meezan-bank", name: "Meezan Bank", domains: ["meezanbank.com"] },
  { slug: "standard-chartered", name: "Standard Chartered", domains: ["sc.com", "standardchartered.com"] },
  { slug: "ubl", name: "United Bank Limited", domains: ["ubldigital.com", "ubl.com.pk"] },
  { slug: "nadra", name: "NADRA", domains: ["nadra.gov.pk"] },
  { slug: "mol-group", name: "MOL Group", domains: ["molgroup.info", "mol.hu"] },
  { slug: "mcb-islamic", name: "MCB Islamic Bank", domains: ["mcbislamic.com", "mcb.com.pk"] },
  { slug: "bank-of-punjab", name: "Bank of Punjab", domains: ["bop.com.pk"] },
  { slug: "askari-bank", name: "Askari Bank", domains: ["askaribank.com"] },
  { slug: "bank-makramah", name: "Bank Makramah", domains: ["bankmakramah.com"] },
  { slug: "bank-of-khyber", name: "Bank of Khyber", domains: ["bok.com.pk"] },
  { slug: "berger", name: "Berger Paints Pakistan", domains: ["berger.com.pk"] },
  { slug: "fatima-group", name: "Fatima Group", domains: ["fatima-group.com"] },
  { slug: "nrsp", name: "NRSP", domains: ["nrsp.org.pk"] },
  { slug: "mcb", name: "MCB Bank", domains: ["mcb.com.pk"] },
  { slug: "allied-bank", name: "Allied Bank", domains: ["abl.com"] },
  { slug: "soneri-bank", name: "Soneri Bank", domains: ["soneribank.com"] },
  { slug: "mobilink-microfinance-bank", name: "Mobilink Microfinance Bank", domains: ["jazzcash.com.pk", "mobilinkbank.com"] },
  { slug: "akdn", name: "Aga Khan Development Network", domains: ["akdn.org"] },
  { slug: "ztbl", name: "Zarai Taraqiati Bank", domains: ["ztbl.com.pk"] },
  { slug: "celerity", name: "Celerity Logistics", domains: ["celerity.com.pk", "celeritylogistics.com"] },
  { slug: "nrsp-microfinance-bank", name: "NRSP Microfinance Bank", domains: ["nrspbank.com"] },
  { slug: "engro", name: "Engro Corporation", domains: ["engro.com"] },
  { slug: "sngpl", name: "Sui Northern Gas Pipelines", domains: ["sngpl.com.pk"] },
  { slug: "k-electric", name: "K-Electric", domains: ["ke.com.pk"] },
  { slug: "pakistan-customs", name: "Pakistan Customs", domains: ["fbr.gov.pk", "customes.gov.pk"] },
  { slug: "dg-cement", name: "DG Cement", domains: ["dgcement.com"] },
  { slug: "ntc", name: "National Telecommunication Corporation", domains: ["ntc.net.pk"] },
  { slug: "jazz", name: "Jazz", domains: ["jazz.com.pk"] },
  { slug: "zong", name: "Zong 4G", domains: ["zong.com.pk"] },
  { slug: "ffbl", name: "FFBL", domains: ["ffbl.com"] },
  { slug: "ptcl", name: "PTCL", domains: ["ptcl.com.pk"] },
  { slug: "ktrade", name: "KTrade Securities", domains: ["ktrade.pk"] },
  { slug: "js-group", name: "Jahangir Siddiqui & Co.", domains: ["js.com", "jsgroup.com"] },
  { slug: "ghani", name: "Ghani Global Holdings", domains: ["ghaniglobal.com", "ghanigroup.com"] },
  { slug: "bank-al-habib", name: "Bank AL Habib", domains: ["bankalhabib.com"] },
  { slug: "national-bank-of-oman", name: "National Bank of Oman", domains: ["nbo.om"] },
  { slug: "1link", name: "1LINK", domains: ["1link.net.pk"] },
  { slug: "sindh-bank", name: "Sindh Bank", domains: ["sindhbankltd.com", "sindhbank.com.pk"] },
  { slug: "mcdonalds", name: "McDonald's", domains: ["mcdonalds.com"] },
  { slug: "nbp", name: "National Bank of Pakistan", domains: ["nbp.com.pk"] },
  { slug: "parco", name: "PARCO", domains: ["parco.com.pk"] },
];

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 SynergyLogoFetcher/1.0",
      Accept: "image/*,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("image") && !ctype.includes("octet-stream")) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800) return null;
  return buf;
}

async function downloadLogo(domains) {
  for (const domain of domains) {
    const sources = [
      `https://logo.clearbit.com/${domain}?size=512`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ];
    for (const url of sources) {
      try {
        const buf = await fetchBuffer(url);
        if (!buf) continue;
        // Prefer larger Clearbit results
        if (url.includes("clearbit") || buf.length > 2500) return buf;
        if (buf.length > 1500) return buf;
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

async function toWebp(input, outPath) {
  await sharp(input)
    .ensureAlpha()
    .resize({
      width: 360,
      height: 200,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(outPath);
}

await fs.mkdir(OUT, { recursive: true });

const results = [];
for (const client of CLIENTS) {
  process.stdout.write(`${client.slug}... `);
  const buf = await downloadLogo(client.domains);
  const outPath = path.join(OUT, `${client.slug}.webp`);
  if (!buf) {
    console.log("FAIL");
    results.push({ ...client, ok: false });
    continue;
  }
  try {
    await toWebp(buf, outPath);
    const stat = await fs.stat(outPath);
    console.log(`OK ${stat.size}b`);
    results.push({ ...client, ok: true, bytes: stat.size });
  } catch (err) {
    console.log(`CONVERT FAIL ${err.message}`);
    results.push({ ...client, ok: false });
  }
}

const ok = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok);
console.log(`\nDone: ${ok}/${CLIENTS.length}`);
if (fail.length) {
  console.log("Failed:");
  for (const f of fail) console.log(` - ${f.slug} (${f.domains.join(", ")})`);
}
