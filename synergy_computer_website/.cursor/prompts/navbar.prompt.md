# Navbar — Generation Prompt

Use when implementing or updating the **site header / primary navigation**.

## Context

- Links: `.cursor/docs/site-map.md` (primary nav section)
- UX rules: `.cursor/rules/04-ui-ux-rules.md`, `05-layout-rules.md`, `13-accessibility.md`
- Global chrome: `.cursor/docs/wireframes.md` (Header)

## Task

Build a **responsive navbar** used across all pages: logo, primary links, optional search, primary CTA.

## Desktop Behavior

- Logo links to `/`.
- Nav items match site map (labels consistent with `website-content.md`).
- Visible **current page** indicator (`aria-current="page"` or design-system active state).
- Primary CTA button (e.g. Contact / Get a quote) — one accent style.

## Mobile Behavior

- Menu toggle with accessible name (`aria-expanded`, `aria-controls`).
- Focus trap while menu open; **Escape** closes; return focus to toggle.
- Body scroll lock only if needed; avoid layout shift when opening.
- Full-height drawer or dropdown — match wireframe decision.

## Implementation

- Client component only for interactivity; keep markup semantic (`<header>`, `<nav>`).
- Sticky header: optional — if sticky, ensure focusable content isn’t hidden under fixed bar (scroll-padding-top).
- Do not fetch data in navbar; links are static or from a shared `navConfig` constant.

## Accessibility Checklist

- [ ] All items keyboard reachable
- [ ] `:focus-visible` styles on links and toggle
- [ ] Toggle is `<button>`, not `<div>`
- [ ] Mobile menu id referenced by `aria-controls`

## Output

- Component path(s) and where imported (layout).
- `navConfig` structure if added.
- Screenshot description or note to verify at 375px and 1280px.

## Do Not

- Add nav items not in site map without noting `TODO:`.
- Hide critical links only in mobile overflow without alternative path in footer.
