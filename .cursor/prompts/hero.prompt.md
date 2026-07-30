# Hero — Generation Prompt

Use for **page hero sections** (home, service detail, industry, about, etc.).

## Context

- Copy: `.cursor/docs/website-content.md` (per page)
- Layout: `.cursor/rules/05-layout-rules.md`, `02-design-principles.md`
- Motion: `animation.prompt.md`, `.cursor/rules/07-animation-rules.md`
- CTA patterns: `.cursor/rules/04-ui-ux-rules.md`

## Task

Implement a **hero section** for: `[PAGE NAME]` on route `[PATH]`.

State in your message:
- Page name and path
- Variant: `split` (text + image), `centered`, or `minimal` (inner pages)
- Primary CTA label + href
- Secondary CTA (optional)

## Structure

- **Eyebrow** (optional): category or trust line.
- **H1**: one per page — matches SEO/content doc.
- **Subcopy**: 1–3 sentences, benefit-led (`16-content-writing.md`).
- **Actions**: primary button + secondary link/button; min 44px touch targets.
- **Media** (optional): hero image or subtle background; reserve aspect ratio to prevent CLS.

## Visual Rules

- Align to container/grid; no full-bleed text without readable overlay/contrast.
- If text on image: gradient scrim + contrast check (WCAG AA).
- Use design-system button variants only.

## Accessibility

- H1 is real heading, not styled `div`.
- Decorative background images: empty alt or CSS background (no bogus alt).
- CTAs are `<a>` or `<button>` with visible focus.

## Performance

- Priority image only for LCP hero on homepage; elsewhere lazy-load if below fold.
- Prefer `picture` / framework Image with width/height.

## Output

- Component name and props (title, description, ctas, image).
- Mark any copy as `TODO:` if missing from docs.

## Do Not

- Use multiple H1s in one hero.
- Auto-play video with sound; if video background, respect reduced motion and provide static fallback.
