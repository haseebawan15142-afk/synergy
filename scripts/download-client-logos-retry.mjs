/**
 * Retry failed logos via Wikipedia / Wikimedia / site icons / improved Clearbit.
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = "public/images/clients";

const RETRY = [
  {
    slug: "state-bank-of-pakistan",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/State_Bank_of_Pakistan_logo.svg/512px-State_Bank_of_Pakistan_logo.svg.png",
      "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/State_Bank_of_Pakistan_logo.svg/500px-State_Bank_of_Pakistan_logo.svg.png",
      "https://www.sbp.org.pk/images/sbp-logo.png",
    ],
  },
  {
    slug: "ubl",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/United_Bank_Limited_logo.svg/512px-United_Bank_Limited_logo.svg.png",
      "https://www.ubldigital.com/Content/images/ubl-logo.png",
      "https://logo.clearbit.com/ubl.com?size=512",
    ],
  },
  {
    slug: "bank-of-khyber",
    urls: [
      "https://www.bok.com.pk/assets/images/logo.png",
      "https://logo.clearbit.com/bok.com.pk?size=512",
    ],
  },
  {
    slug: "soneri-bank",
    urls: [
      "https://www.soneribank.com/wp-content/uploads/2020/07/soneri-logo.png",
      "https://logo.clearbit.com/soneribank.com?size=512",
    ],
  },
  {
    slug: "ztbl",
    urls: [
      "https://www.ztbl.com.pk/Style%20Library/Images/ztbl-logo.png",
      "https://logo.clearbit.com/ztbl.com.pk?size=512",
    ],
  },
  {
    slug: "celerity",
    urls: [
      "https://logo.clearbit.com/celerity.com?size=512",
      "https://www.google.com/s2/favicons?domain=celerity.com.pk&sz=256",
    ],
  },
  {
    slug: "nrsp-microfinance-bank",
    urls: [
      "https://www.nrspbank.com/themes/custom/nrsp/logo.svg",
      "https://www.nrspbank.com/sites/default/files/logo.png",
      "https://logo.clearbit.com/nrspbank.com?size=512",
    ],
  },
  {
    slug: "k-electric",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/K-Electric_logo.svg/512px-K-Electric_logo.svg.png",
      "https://www.ke.com.pk/wp-content/themes/ke/images/logo.png",
      "https://logo.clearbit.com/ke.com.pk?size=512",
    ],
  },
  {
    slug: "dg-cement",
    urls: [
      "https://www.dgcement.com/wp-content/uploads/2020/logo.png",
      "https://logo.clearbit.com/dgcement.com?size=512",
      "https://www.google.com/s2/favicons?domain=dgcement.com&sz=256",
    ],
  },
  {
    slug: "ntc",
    urls: [
      "https://www.ntc.net.pk/images/logo.png",
      "https://logo.clearbit.com/ntc.net.pk?size=512",
      "https://www.google.com/s2/favicons?domain=ntc.net.pk&sz=256",
    ],
  },
  {
    slug: "zong",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Zong_Pakistan_logo.svg/512px-Zong_Pakistan_logo.svg.png",
      "https://www.zong.com.pk/assets/images/zong-logo.png",
      "https://logo.clearbit.com/zong.com.pk?size=512",
    ],
  },
  {
    slug: "ptcl",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/PTCL_Logo.svg/512px-PTCL_Logo.svg.png",
      "https://www.ptcl.com.pk/Content/images/ptcl-logo.png",
      "https://logo.clearbit.com/ptcl.com.pk?size=512",
    ],
  },
  {
    slug: "sindh-bank",
    urls: [
      "https://www.sindhbankltd.com/Content/assets/images/logo.png",
      "https://logo.clearbit.com/sindhbankltd.com?size=512",
      "https://www.google.com/s2/favicons?domain=sindhbankltd.com&sz=256",
    ],
  },
  {
    slug: "nbp",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/National_Bank_of_Pakistan_logo.svg/512px-National_Bank_of_Pakistan_logo.svg.png",
      "https://www.nbp.com.pk/style/images/nbp-logo.png",
      "https://logo.clearbit.com/nbp.com.pk?size=512",
    ],
  },
  {
    slug: "parco",
    urls: [
      "https://www.parco.com.pk/images/parco-logo.png",
      "https://logo.clearbit.com/parco.com.pk?size=512",
      "https://www.google.com/s2/favicons?domain=parco.com.pk&sz=256",
    ],
  },
];

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 400) return null;
  return buf;
}

async function toWebp(input, outPath) {
  // SVG / raster both handled by sharp when possible
  await sharp(input, { density: 300 })
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

// Also re-crop failed ones from profile screenshot as last resort
const CLIENT_SRC =
  "C:/Users/Dell/.cursor/projects/c-Users-Dell-Desktop-synergy-computer-website/assets/c__Users_Dell_AppData_Roaming_Cursor_User_workspaceStorage_b17c251aaac616116728c0771e4fbc1a_images_image-84da45e5-f6cd-47ec-ac41-210c5aa26920.png";

const GRID_SLUGS = [
  "state-bank-of-pakistan",
  "meezan-bank",
  "standard-chartered",
  "ubl",
  "nadra",
  "mol-group",
  "mcb-islamic",
  "bank-of-punjab",
  "askari-bank",
  "bank-makramah",
  "bank-of-khyber",
  "berger",
  "fatima-group",
  "nrsp",
  "mcb",
  "allied-bank",
  "soneri-bank",
  "mobilink-microfinance-bank",
  "akdn",
  "ztbl",
  "celerity",
  "nrsp-microfinance-bank",
  "engro",
  "sngpl",
  "k-electric",
  "pakistan-customs",
  "dg-cement",
  "ntc",
  "jazz",
  "zong",
  "ffbl",
  "ptcl",
  "ktrade",
  "js-group",
  "ghani",
  "bank-al-habib",
  "national-bank-of-oman",
  "1link",
  "sindh-bank",
  "mcdonalds",
  "nbp",
  "parco",
];

async function cropFromScreenshot(slug) {
  const idx = GRID_SLUGS.indexOf(slug);
  if (idx < 0) return null;
  const rows = 6;
  const cols = 7;
  const meta = await sharp(CLIENT_SRC).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 517;
  // Manual grid from visual inspection of Company Profile screenshot
  const left = Math.round(width * 0.058);
  const top = Math.round(height * 0.245);
  const right = Math.round(width * 0.955);
  const bottom = Math.round(height * 0.97);
  const cellW = (right - left) / cols;
  const cellH = (bottom - top) / rows;
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const insetX = cellW * 0.08;
  const insetY = cellH * 0.12;
  const extract = {
    left: Math.round(left + c * cellW + insetX),
    top: Math.round(top + r * cellH + insetY),
    width: Math.round(cellW - insetX * 2),
    height: Math.round(cellH - insetY * 2),
  };
  return sharp(CLIENT_SRC)
    .extract(extract)
    .resize({ width: 360, height: 200, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 90 })
    .toBuffer();
}

for (const item of RETRY) {
  process.stdout.write(`${item.slug}... `);
  let buf = null;
  for (const url of item.urls) {
    try {
      buf = await fetchBuffer(url);
      if (buf) break;
    } catch {
      /* next */
    }
  }
  if (!buf) {
    try {
      buf = await cropFromScreenshot(item.slug);
      if (buf) process.stdout.write("crop ");
    } catch {
      /* ignore */
    }
  }
  if (!buf) {
    console.log("FAIL");
    continue;
  }
  try {
    const out = path.join(OUT, `${item.slug}.webp`);
    await toWebp(buf, out);
    const st = await fs.stat(out);
    console.log(`OK ${st.size}b`);
  } catch (e) {
    // If convert fails (e.g. ico), try screenshot crop
    try {
      const crop = await cropFromScreenshot(item.slug);
      if (!crop) throw e;
      await fs.writeFile(path.join(OUT, `${item.slug}.webp`), crop);
      console.log("OK crop-fallback");
    } catch {
      console.log(`FAIL ${e.message}`);
    }
  }
}

console.log("retry done");
