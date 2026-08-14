/**
 * Server-safe blog HTML sanitizer (no jsdom / isomorphic-dompurify).
 * Vercel serverless often 500s when jsdom loads; this keep TipTap markup
 * without native DOM dependencies.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "s",
  "strike",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
  "img",
  "span",
]);

const SELF_CLOSING = new Set(["br", "hr", "img"]);

const VOID_STRIP = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "style",
  "link",
  "meta",
  "textarea",
  "button",
  "svg",
  "math",
]);

function isSafeHttpUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^javascript:/i.test(v) || /^vbscript:/i.test(v) || /^data:/i.test(v)) return false;
  return /^(https?:|mailto:|tel:|\/|#)/i.test(v);
}

function isFirebaseImageUrl(value: string): boolean {
  const src = value.trim().toLowerCase();
  return (
    src.includes("firebasestorage.googleapis.com") ||
    src.includes("storage.googleapis.com") ||
    src.includes(".firebasestorage.app")
  );
}

function sanitizeAttrs(tag: string, rawAttrs: string): string {
  const attrs: string[] = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawAttrs))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (name.startsWith("on")) continue;
    if (name === "style" || name === "srcdoc") continue;

    if (tag === "a") {
      if (name === "href" && isSafeHttpUrl(value)) {
        attrs.push(`href="${value.replace(/"/g, "&quot;")}"`);
      } else if (name === "target" && value === "_blank") {
        attrs.push('target="_blank"');
      } else if (name === "rel") {
        /* set below */
      } else if (name === "title" || name === "class") {
        attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
      }
      continue;
    }

    if (tag === "img") {
      if (name === "src" && isSafeHttpUrl(value) && isFirebaseImageUrl(value)) {
        attrs.push(`src="${value.replace(/"/g, "&quot;")}"`);
      } else if (name === "alt" || name === "title" || name === "width" || name === "height" || name === "class") {
        attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
      }
      continue;
    }

    if (name === "class" || name === "title") {
      attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }
  }

  if (tag === "a") {
    const hasTarget = attrs.some((a) => a.startsWith("target="));
    const hasHref = attrs.some((a) => a.startsWith("href="));
    if (hasHref && hasTarget && !attrs.some((a) => a.startsWith("rel="))) {
      attrs.push('rel="noopener noreferrer"');
    }
  }

  if (tag === "img" && !attrs.some((a) => a.startsWith("src="))) {
    return ""; // drop image without safe firebase src
  }

  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

/** Sanitize CMS blog HTML before dangerouslySetInnerHTML. */
export function sanitizeBlogHtml(dirty: string): string {
  const input = String(dirty || "");
  if (!input.trim()) return "";

  // Remove whole forbidden blocks first (including inner text).
  let html = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<\/?(script|iframe|object|embed|form|style|link|meta|textarea|button)(\s[^>]*)?\/?>/gi, "");

  html = html.replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (full, rawName: string, rawAttrs = "") => {
    const name = rawName.toLowerCase();
    const closing = full.startsWith("</");

    if (VOID_STRIP.has(name)) return "";
    if (!ALLOWED_TAGS.has(name)) return "";

    if (closing) return `</${name}>`;

    const attrs = sanitizeAttrs(name, rawAttrs || "");
    if (name === "img" && !attrs) return "";

    if (SELF_CLOSING.has(name)) return `<${name}${attrs}>`;
    return `<${name}${attrs}>`;
  });

  return html;
}
