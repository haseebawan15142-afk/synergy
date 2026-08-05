/**
 * Reads generated blog meta + bodies and writes scripts/migrate-data/blogs.mjs
 * Usage: npm run cms:export-blogs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metaPath = resolve(root, "src/lib/content/blog-posts.generated.ts");
const bodiesPath = resolve(root, "src/lib/content/blog-bodies.generated.ts");
const imagesPath = resolve(root, "src/lib/content/blog-images.generated.ts");

if (!existsSync(metaPath)) {
  console.error("Missing blog-posts.generated.ts");
  process.exit(1);
}

const metaSrc = readFileSync(metaPath, "utf8");
const arrayMatch = metaSrc.match(/export const blogPostsGenerated[^=]*=\s*(\[[\s\S]*?\n\]);/);
if (!arrayMatch) {
  console.error("Could not parse blogPostsGenerated");
  process.exit(1);
}

const posts = Function(`"use strict"; return (${arrayMatch[1]});`)();

let bodies = {};
if (existsSync(bodiesPath)) {
  const bodySrc = readFileSync(bodiesPath, "utf8");
  const m = bodySrc.match(/export const blogBodiesGenerated[^=]*=\s*(\{[\s\S]*?\n\});/);
  if (m) bodies = Function(`"use strict"; return (${m[1]});`)();
}

let images = {};
if (existsSync(imagesPath)) {
  const imgSrc = readFileSync(imagesPath, "utf8");
  const m = imgSrc.match(/export const blogImagesGenerated[^=]*=\s*(\{[\s\S]*?\n\});/);
  if (m) images = Function(`"use strict"; return (${m[1]});`)();
}

const blogs = posts.map((p) => {
  const paragraphs = bodies[p.slug] || [];
  const bodyHtml = paragraphs.length
    ? paragraphs
        .map((line) => {
          if (String(line).startsWith("## ")) return `<h2>${String(line).slice(3)}</h2>`;
          return `<p>${String(line)}</p>`;
        })
        .join("\n")
    : `<p>${p.title}</p>`;
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: p.category,
    image: images[p.slug] || p.image || "",
    relatedServiceSlug: p.relatedServiceSlug || "",
    bodyHtml,
  };
});

const out = `export const blogs = ${JSON.stringify(blogs, null, 2)};\n`;
writeFileSync(resolve(root, "scripts/migrate-data/blogs.mjs"), out, "utf8");
console.log(`Wrote ${blogs.length} blogs to scripts/migrate-data/blogs.mjs`);
