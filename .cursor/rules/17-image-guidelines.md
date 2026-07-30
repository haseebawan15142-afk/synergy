# Image Guidelines

## Quality & Format

- Use high-quality source assets; export for web (WebP/AVIF + fallback if needed).
- Product photos: consistent background and angle style across catalog when possible.

## Dimensions

- Serve at display size (or 2× for retina); never ship 4000px-wide images in cards.

## Naming & Organization

- Descriptive filenames (`synergy-logo-primary.svg`, `hero-office.webp`).
- **Source:** `.cursor/assets/` (brand + marketing).
- **Runtime (Next.js):** `public/brand/`, `public/images/marketing/` — sync from assets when adding files.
- Document entries in `.cursor/assets/manifest.json`.

## Alt Text

- Describe what matters for the message; include product name in product images.

## Heroes & Banners

- Safe area for text overlay; test crop on mobile.
- Avoid text baked into images when HTML text is possible (SEO and accessibility).

## Icons

- Prefer SVG for UI icons; consistent stroke/size with the design system.

## Legal

- Only use images the business has rights to; retain attribution when required.
