# UI/UX Rules

## Navigation

- Primary nav items visible on desktop; accessible mobile menu with focus trap when open.
- Current page/section indicated for wayfinding (aria-current or visible state).
- Footer repeats key links: contact, hours, policies, social (if applicable).

## Forms

- Visible labels (not placeholder-only).
- Inline validation with clear error messages linked via `aria-describedby`.
- Success and failure states announced to assistive tech where appropriate.

## Feedback

- Loading: skeletons or spinners with `aria-busy` / live regions for async actions.
- Empty states: explain what to do next.
- Errors: human-readable; suggest recovery when possible.

## Interaction

- Touch targets at least 44×44px on mobile.
- Hover effects have keyboard/focus equivalents.
- Destructive actions require confirmation when irreversible.

## Content Hierarchy

- H1 once per page; logical heading order (no skipped levels for styling).
- CTAs use action verbs (“Get a quote”, “View specs”, “Contact us”).
