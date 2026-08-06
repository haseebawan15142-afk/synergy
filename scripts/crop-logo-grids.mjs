/**
 * Crop logo cells from Company Profile screenshot grids.
 * Clients: 6x7, Partners: 4x5
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const ASSETS =
  "C:/Users/Dell/.cursor/projects/c-Users-Dell-Desktop-synergy-computer-website/assets";

const CLIENT_SRC = path.join(
  ASSETS,
  "c__Users_Dell_AppData_Roaming_Cursor_User_workspaceStorage_b17c251aaac616116728c0771e4fbc1a_images_image-84da45e5-f6cd-47ec-ac41-210c5aa26920.png",
);
const PARTNER_SRC = path.join(
  ASSETS,
  "c__Users_Dell_AppData_Roaming_Cursor_User_workspaceStorage_b17c251aaac616116728c0771e4fbc1a_images_image-14efbb7e-f3e9-4da1-9110-2f67ffb9dfbc.png",
);

const clients = [
  // row 1
  "state-bank-of-pakistan",
  "meezan-bank",
  "standard-chartered",
  "ubl",
  "nadra",
  "mol-group",
  "mcb-islamic",
  // row 2
  "bank-of-punjab",
  "askari-bank",
  "bank-makramah",
  "bank-of-khyber",
  "berger",
  "fatima-group",
  "nrsp",
  // row 3
  "mcb",
  "allied-bank",
  "soneri-bank",
  "mobilink-microfinance-bank",
  "akdn",
  "ztbl",
  "celerity",
  // row 4
  "nrsp-microfinance-bank",
  "engro",
  "sngpl",
  "k-electric",
  "cabinet-division",
  "dg-cement",
  "ntc",
  // row 5
  "jazz",
  "zong",
  "ffbl",
  "ptcl",
  "ktrade",
  "js-bank",
  "ghani",
  // row 6 — skip duplicate NBP seal variant (index 41 kept as nbp; index 40 mcdonalds, 38 1link)
  "bank-al-habib",
  "unknown-red-seal", // will drop after inspection if not identifiable
  "1link",
  "nbp-seal-alt", // duplicate NBP variant — will skip in content
  "mcdonalds",
  "nbp",
  "parco",
];

const partners = [
  // row 1
  "hitachi-vantara",
  "dynatrace",
  "infor",
  "enterprisedb",
  "automation-anywhere",
  // row 2
  "bmc-helix",
  "supermicro",
  "oracle",
  "hexagon",
  "cohesity",
  // row 3
  "convene",
  "red-hat",
  "pure-storage",
  "cisco",
  "arctera",
  // row 4
  "knowbe4",
  "utimaco",
  "netapp",
  "proxmox",
  "fujitsu",
];

async function detectGrid(imagePath, rows, cols, { topRatio = 0.28, bottomPad = 0.04 } = {}) {
  const img = sharp(imagePath);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error(`No dimensions for ${imagePath}`);

  // Sample luminance to find content bounding box of the logo grid
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isInk = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // non-near-white pixel
    return r < 245 || g < 245 || b < 245;
  };

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const yStart = Math.floor(height * topRatio);
  const yEnd = Math.floor(height * (1 - bottomPad));
  const xPad = Math.floor(width * 0.05);

  for (let y = yStart; y < yEnd; y += 2) {
    for (let x = xPad; x < width - xPad; x += 2) {
      if (isInk(x, y)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Expand slightly so borders are included then we'll inset
  minX = Math.max(0, minX - 4);
  minY = Math.max(0, minY - 4);
  maxX = Math.min(width - 1, maxX + 4);
  maxY = Math.min(height - 1, maxY + 4);

  const gridW = maxX - minX + 1;
  const gridH = maxY - minY + 1;
  const cellW = gridW / cols;
  const cellH = gridH / rows;

  return { width, height, minX, minY, cellW, cellH, rows, cols };
}

async function cropGrid(imagePath, names, rows, cols, outDir, opts) {
  await fs.mkdir(outDir, { recursive: true });
  const grid = await detectGrid(imagePath, rows, cols, opts);
  console.log(path.basename(imagePath), grid);

  const inset = 6; // trim cell borders
  for (let i = 0; i < names.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const left = Math.round(grid.minX + c * grid.cellW + inset);
    const top = Math.round(grid.minY + r * grid.cellH + inset);
    const width = Math.max(8, Math.round(grid.cellW - inset * 2));
    const height = Math.max(8, Math.round(grid.cellH - inset * 2));
    const out = path.join(outDir, `${names[i]}.webp`);
    await sharp(imagePath)
      .extract({ left, top, width, height })
      .webp({ quality: 88 })
      .toFile(out);
  }
  console.log(`Wrote ${names.length} → ${outDir}`);
}

await cropGrid(CLIENT_SRC, clients, 6, 7, "public/images/clients", { topRatio: 0.22 });
await cropGrid(PARTNER_SRC, partners, 4, 5, "public/images/partners/profile", {
  topRatio: 0.28,
});
console.log("done");
