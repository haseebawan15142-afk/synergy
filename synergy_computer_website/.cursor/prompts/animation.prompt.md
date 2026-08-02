# Animation — Generation Prompt

Use when adding or refining **motion** (transitions, scroll reveals, micro-interactions).

## Context

- `.cursor/rules/07-animation-rules.md`
- `.cursor/rules/13-accessibility.md` (`prefers-reduced-motion`)
- `.cursor/rules/14-performance.md`

## Task

Implement animation for: `[DESCRIBE FEATURE — e.g. mobile menu, hero entrance, section reveal, button hover]`.

## Principles

- Motion clarifies state change or draws attention to primary action — not decoration-only.
- Duration: **150–300ms** for UI; longer only with explicit approval.
- Easing: consistent (e.g. ease-out for enter, ease-in for exit).
- Animate **`transform`** and **`opacity`** preferentially.

## Reduced Motion (Required)

```css
@media (prefers-reduced-motion: reduce) {
  /* disable or set duration to 0; keep functionality instant */
}
```

Or use framework hook/util if project provides one. **Never** skip this.

## Patterns (choose one fit)

| Pattern | Use case |
|---------|----------|
| CSS transition | hover, focus, accordion height |
| CSS `@keyframes` | simple loop loaders |
| View Transitions API | page transitions if supported & progressive |
| Motion library | complex orchestration — only if already in repo |

## Anti-patterns

- Parallax on critical content paths
- Scroll-jacking
- Animating `width`/`height`/`top`/`left` on large sections without need
- Infinite distracting loops in hero

## Performance

- Pause off-screen animations when possible.
- No layout thrashing; batch reads/writes.

## Output

- Files changed and animation approach chosen.
- How reduced motion is handled (code path).
- List of elements affected and durations used.

## Do Not

- Add a new animation dependency without justification.
- Block interaction during long intro sequences.
