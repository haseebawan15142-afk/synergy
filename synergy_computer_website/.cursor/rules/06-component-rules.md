# Component Rules

## Organization

- Shared UI in `components/ui/` (primitives) and `components/` (composed sections).
- One component per file; name matches export (PascalCase).
- Co-locate component-specific styles only when Tailwind utilities are insufficient.

## Props & API

- Prefer explicit props over sprawling `...rest` unless wrapping native elements intentionally.
- Document non-obvious props with brief JSDoc when behavior isn’t obvious from types.
- Default variants via a single pattern (e.g. `cva` or documented class maps)—stay consistent with existing code.

## Composition

- Prefer composition (children, slots) over boolean prop explosion.
- Keep presentational components free of data fetching; containers/pages own data.

## Reuse

- Before adding a component, search for an existing one to extend.
- Extract after the second duplication, not prematurely.

## States

- Every interactive component supports: default, hover, focus-visible, disabled, and loading where relevant.
