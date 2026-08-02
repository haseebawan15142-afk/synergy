# Service Page — Generation Prompt

Use for a **single service detail page** or the **services hub** (`/services`).

## Context

- Service facts: `.cursor/docs/services.md`
- Page copy blocks: `.cursor/docs/website-content.md`
- Vertical angles (optional): `.cursor/docs/industries.md`
- Proof: `.cursor/docs/case-studies.md`
- Rules: `.cursor/rules/04-ui-ux-rules.md`, `06-component-rules.md`, `13-accessibility.md`, `15-seo.md`

## Task

**Hub:** Listing page with intro, grid of service cards, optional FAQ.  
**Detail:** One service with hero, benefits, process, scope/inclusions, CTA, related case study.

Specify in your message: `hub` or `detail`, and the **service slug/name**.

## Detail Page Structure

1. **Hero** — service name (H1), 1–2 sentence summary, primary CTA (`hero.prompt.md`).
2. **Who it’s for** — audience (B2C/B2B) aligned with `services.md`.
3. **Benefits** — 3–6 outcome-focused bullets (not feature dumps).
4. **Process** — numbered steps from `services.md` service process.
5. **What’s included / optional add-ons** — table or lists; mark `TODO:` if unknown.
6. **FAQ** — 3–5 questions; use `<details>` or accessible accordion pattern.
7. **CTA** — contact form link, phone, or inline mini-form if project has one.
8. **Related** — link to relevant case study or industry page.

## Hub Page Structure

- H1: Services (or approved title from content doc).
- Short intro paragraph.
- Card grid: icon/title/excerpt/link per service in `services.md`.
- Optional comparison note or “Not sure? Contact us” CTA.

## Technical

- Reusable `ServiceCard`, `ProcessSteps`, `FAQ` components if not already present.
- Unique `title` / `meta description` per service URL in `site-map.md`.
- Schema: consider `Service` JSON-LD when copy is finalized (accurate only).

## Output

- Route/path implemented.
- Content gaps listed as `TODO:` with doc reference.
- Breadcrumbs: Home → Services → [Service name] (if pattern exists site-wide).

## Do Not

- Promise SLAs, response times, or prices not documented.
- Copy competitor wording from `competitor-analysis.md`.
