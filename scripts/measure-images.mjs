import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

for (const rel of ["public/images/blog", "public/images/hero"]) {
  const dir = path.join(root, rel);
  const files = walk(dir);
  const sum = files.reduce((a, f) => a + fs.statSync(f).size, 0);
  console.log(`${rel}: ${(sum / 1024 / 1024).toFixed(1)} MB (${files.length} files)`);
  files
    .map((f) => ({ name: path.basename(f), size: fs.statSync(f).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 8)
    .forEach((f) => console.log(`  ${f.name}: ${(f.size / 1024).toFixed(0)} KB`));
}
