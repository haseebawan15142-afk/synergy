# React Rules

## General

- Functional components and hooks only; no class components for new code.
- Keep components focused; extract hooks when logic is reused or clutters JSX.

## State

- Lift state only as far as needed; prefer URL/search params for shareable page state when appropriate.
- Avoid unnecessary `useEffect` for derived data—compute during render when possible.

## Effects

- Effects document dependencies accurately; clean up subscriptions, timers, and listeners.
- Fetch in route loaders, server components, or dedicated data hooks per project architecture—stay consistent.

## Keys & Lists

- Stable, unique keys from data ids—not array index for reorderable/filterable lists.

## Performance

- Memoize (`useMemo`, `useCallback`, `memo`) only when profiling or obvious hot paths justify it.
- Code-split heavy routes and below-the-fold widgets with dynamic import when beneficial.

## Server vs Client

- Follow the framework’s default (e.g. Server Components first); add `"use client"` only when needed for interactivity.
