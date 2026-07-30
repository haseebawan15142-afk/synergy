# Testing

## Scope

- Unit tests for pure utilities and complex hooks.
- Component tests for critical UI (forms, nav, checkout/inquiry flows if present).
- E2E for smoke paths: home → product/service → contact on supported browsers.

## Tools

- Use the stack defined in the repo (Vitest/Jest, Testing Library, Playwright/Cypress)—do not introduce duplicates.

## Practices

- Test behavior and accessibility roles, not implementation details.
- Mock network at boundaries; prefer MSW or framework mocks consistently.

## Coverage

- No arbitrary percentage goal; cover regressions and business-critical paths.
- Add a test when fixing a bug to prevent recurrence.

## CI

- Tests run on PR; fix failures before merge.
- Do not skip or disable tests without team agreement and a tracked issue.
