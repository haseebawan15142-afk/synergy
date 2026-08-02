# Performance

## Targets

- **LCP** < 2.5s, **INP** < 200ms, **CLS** < 0.1 on key pages (mobile, slow 4G in lab tools).

## Assets

- Optimize images (WebP/AVIF where supported); correct dimensions; lazy-load below fold.
- Self-host or subset fonts; use `font-display: swap`.

## JavaScript

- Minimize client bundle; dynamic import for heavy widgets.
- Tree-shake; avoid importing entire libraries for one function.

## Rendering

- Prefer static or cached server rendering for marketing pages when using SSR frameworks.
- Avoid layout thrashing; batch DOM reads/writes in animations.

## Network

- Cache static assets with long TTL and fingerprinted filenames.
- Preconnect only to critical third-party origins.

## Monitoring

- Run Lighthouse or WebPageTest before major releases; track regressions in CI if configured.
