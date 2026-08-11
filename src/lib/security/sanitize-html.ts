import DOMPurify from "isomorphic-dompurify";

/**
 * TipTap (StarterKit + Link + Image) emits roughly:
 * p, br, strong/b, em/i, s, code, pre, h1–h6, blockquote, ul/ol/li, hr, a, img.
 * Scripts, event handlers, javascript: URLs, iframe/object/embed are stripped.
 */
const BLOG_ALLOWED_TAGS = [
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
] as const;

const BLOG_ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "class",
] as const;

/** Sanitize CMS blog HTML before dangerouslySetInnerHTML. */
export function sanitizeBlogHtml(dirty: string): string {
  const input = String(dirty || "");
  if (!input.trim()) return "";

  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [...BLOG_ALLOWED_TAGS],
    ALLOWED_ATTR: [...BLOG_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style", "link", "meta"],
    FORBID_ATTR: ["style", "srcdoc"],
    // http(s), mailto, tel only — blocks javascript:, data:, vbscript:, etc.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  // Harden links opened in a new tab (TipTap may set target=_blank).
  return clean.replaceAll(/<a\b([^>]*)>/gi, (_match, attrs: string) => {
    let next = attrs;
    if (/\btarget\s*=/i.test(next) && !/\brel\s*=/i.test(next)) {
      next += ' rel="noopener noreferrer"';
    }
    return `<a${next}>`;
  });
}
