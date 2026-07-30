# TypeScript Rules

## Strictness

- Enable and maintain strict mode; no new `any` without a short comment and follow-up to type properly.
- Prefer `unknown` over `any` at boundaries; narrow with type guards.

## Types vs Interfaces

- Match existing project style for object shapes; be consistent within a module.
- Export types used by consumers; keep internal types file-local when possible.

## Props & Data

- Define explicit props interfaces/types for components.
- Model API responses with dedicated types or schema validation (Zod, etc.) if the project uses it.

## Enums

- Prefer `as const` objects or union types unless enums are already established in the codebase.

## Null Safety

- Use optional chaining and nullish coalescing; avoid non-null assertions (`!`) unless invariant is proven.

## Imports

- Use path aliases as configured (`@/components`, etc.); no deep relative `../../../` when alias exists.
