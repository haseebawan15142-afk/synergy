# Folder Structure

## Recommended Layout

```
src/
├── app/                 # Routes, layouts, metadata (framework-specific)
├── components/
│   ├── ui/              # Buttons, inputs, cards (primitives)
│   └── ...              # Page sections (Hero, Footer, etc.)
├── lib/                 # Utilities, constants, API clients
├── hooks/               # Shared React hooks
├── types/               # Shared TypeScript types
├── styles/              # Global CSS, Tailwind entry if needed
└── assets/              # Static imports (icons, local media)
public/                  # Static files served as-is
```

## Naming

- Files: `kebab-case.tsx` for components or match existing convention consistently.
- Routes: clear, SEO-friendly slugs aligned with nav labels.

## Colocation

- Tests next to source (`*.test.tsx`) or under `__tests__`—match what the repo uses once tests exist.
- Storybook or docs only if introduced in the project.

## Boundaries

- `components/ui` must not import from page-specific feature folders.
- Cross-feature shared code moves to `lib/` or `hooks/`.

## Cursor Assets

- `.cursor/rules/` — agent and team standards (this set).
- `.cursor/docs/`, `.cursor/prompts/`, `.cursor/templates/` — supporting material; not runtime code.
