# Tailwind Rules

## Configuration

- Extend theme from `design-tokens/tailwind-theme.extend.ts` (colors: `surface`, `ink`, `synergy`, etc.) — see `.cursor/docs/brand-colors.md`.
- Avoid arbitrary one-off hex values in JSX when a token exists.

## Class Order

- Follow project convention if Prettier plugin is enabled; otherwise group: layout → spacing → typography → visual → state.

## Responsiveness

- Mobile-first prefixes: base styles, then `sm:`, `md:`, etc.
- Do not duplicate entire class strings per breakpoint; refactor repeated patterns into components.

## Arbitrary Values

- Use sparingly (`w-[347px]`); prefer design tokens.
- Document why when arbitrary values are required.

## Dark Mode

- If supported, use `dark:` variants and semantic tokens—not hard-coded light-only colors on shared components.

## Anti-patterns

- No `@apply` heavy layers unless the project already standardizes on it.
- Avoid inline `style={{}}` when Tailwind utilities suffice.
