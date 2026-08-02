# Coding Standards

## General

- Small, reviewable commits; one logical change per PR when possible.
- No commented-out dead code; remove or restore with a ticket reference if temporarily needed.

## Formatting

- Use project Prettier/ESLint config; run lint before pushing.
- Consistent quotes, semicolons, and import order per tooling.

## Naming

- Variables: descriptive (`productList`, not `data`).
- Event handlers: `handleSubmit`, `onClick` props for callbacks from parents.
- Booleans: `isOpen`, `hasError`, `canSubmit`.

## Error Handling

- Fail visibly in UI for user actions; log server-side details without exposing secrets.
- Never swallow errors silently in catch blocks.

## Security

- Sanitize user HTML; avoid `dangerouslySetInnerHTML` unless content is trusted and sanitized.
- Environment variables for secrets; never commit API keys.

## Dependencies

- Add packages with purpose; prefer built-in or existing stack before new libraries.
