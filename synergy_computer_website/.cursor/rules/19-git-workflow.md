# Git Workflow

## Branching

- `main` (or `master`) stays deployable.
- Feature branches: `feature/short-description` or match team convention.

## Commits

- Imperative, concise subject (`Add contact form validation`).
- Body explains why when the change is non-obvious.

## Pull Requests

- Small, focused diffs; link issue/ticket when applicable.
- Include screenshots or recordings for visual changes.
- Request review; address feedback before merge.

## Pre-merge

- Lint and tests pass locally or in CI.
- No secrets, `.env`, or large binary blobs unless explicitly allowed.

## Releases

- Tag or changelog per team process; note user-visible changes.

## Agent / AI Changes

- Follow same standards; human review required before production deploy.
