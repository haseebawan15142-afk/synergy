# Brand assets (source of truth)

Place **logo and marketing images** here. The app should copy or reference from `public/brand/` after build setup.

## Expected layout

```
.cursor/assets/
├── README.md                 ← this file
├── manifest.json             ← list files + usage (update when you add assets)
├── brand/
│   ├── logo-primary.svg      ← main header logo (preferred)
│   ├── logo-primary.png      ← fallback
│   ├── logo-footer.svg       ← light/dark footer variant if different
│   └── favicon.ico
├── icons/                    ← UI icons if not using a library
└── marketing/                ← hero, about, section imagery you provide
    ├── hero/
    ├── about/
    └── partners/               ← partner logos (until vendor packs arrive)
```

## Current status

| File | Status |
|------|--------|
| `brand/logo-*` | **Waiting** — add your logo files to `.cursor/assets/brand/` |
| `marketing/*` | **Waiting** — add images you mentioned |

> No image files were detected in the repo yet. After you drop files here, tell the agent to refresh `manifest.json` and sync to `public/brand/`.

## Usage rules

- Do not recolor the logo outside approved brand colors.
- Prefer **SVG** for logo; PNG @2× for raster fallback.
- Partner logos: only authorized marks from `technology-partners.md`.
- Optimize JPG/WebP for photos (`17-image-guidelines.md`).

## Public paths (after Next.js scaffold)

| Asset | Public URL |
|-------|------------|
| Primary logo | `/brand/logo-primary.svg` |
| Favicon | `/brand/favicon.ico` |
| Marketing | `/images/marketing/...` |

## Color palette

See `.cursor/docs/brand-colors.md` — **70%** white/off-white, **20%** black/gray, **10%** `#357C3C` Synergy Green.
