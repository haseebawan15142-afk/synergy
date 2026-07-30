# Homepage — Generation Prompt

Use this when building or refactoring the Synergy Computer homepage.

## Context

- Read `.cursor/rules/` (especially design, layout, UI/UX, accessibility, performance, SEO).
- **Design reference:** `.cursor/docs/design-reference-e360.md` ([e360.com](https://www.e360.com/) layout; Synergy colors from `brand-colors.md`).
- Pull factual copy from `.cursor/docs/website-content.md`, `company-profile.md`, `services.md`, `technology-partners.md`.
- IA must match `.cursor/docs/site-map.md` and structure in `.cursor/docs/wireframes.md`.

## Task

Implement (or update) the **homepage** as a production-ready page: clear hierarchy, mobile-first, accessible, and performant.

## Required Sections (in order unless wireframes say otherwise)

Follow `wireframes.md` / e360-style flow:

1. **Hero** — H1, value proposition, primary + secondary CTA (see `hero.prompt.md`).
2. **Trust strip** — “Our Principals” partner logos (`technology-partners.md`).
3. **Story band** — 40+ years / why Synergy + link to About.
4. **Problems we solve** — cards mapping pains to Synergy services (link to `/services/...`).
5. **Services overview** — grid of V1 service cards.
6. **Partners teaser** — stack expertise + CTA to `/partners`.
7. **Industries** — sector tiles to `/industries/...`.
8. **Social proof** — testimonials if available; else omit (V1).
9. **Closing CTA** — “Meet with an expert” → `/contact`.

## Technical Requirements

- One `<h1>` on the page; logical heading order.
- Semantic landmarks: `<main>`, sections with headings or `aria-labelledby`.
- Images: optimized, explicit dimensions, meaningful `alt`.
- No new colors/fonts outside Tailwind theme tokens.
- Respect `prefers-reduced-motion` for any motion (see `animation.prompt.md`).

## SEO

- Set title and meta description from `website-content.md` (or draft placeholders clearly marked `TODO:`).
- Internal links use real routes from `site-map.md`.

## Output

- List files created/changed.
- Note any missing content blocked on docs (use `TODO:` in UI, not invented facts).
- Confirm keyboard nav and focus states on interactive elements.

## Do Not

- Invent pricing, partner tiers, or legal claims.
- Add heavy animation libraries without project precedent.
- Duplicate navbar/footer logic inline — use shared components (see `navbar.prompt.md`, `footer.prompt.md`).
