# Animation Rules

## Philosophy

- Motion supports understanding (enter/exit, feedback), not decoration.
- Keep durations short: typically 150–300ms for UI; longer only for hero or storytelling when approved.

## Accessibility

- Respect `prefers-reduced-motion`: disable or replace with instant state changes.
- No flashing content that violates WCAG seizure guidelines.

## Performance

- Animate `transform` and `opacity` preferentially; avoid animating layout-heavy properties when possible.
- Pause or reduce animations off-screen (Intersection Observer or library equivalent).

## Patterns

- Page transitions: subtle fade/slide; avoid blocking interaction.
- Modals/menus: consistent easing; focus management paired with open/close animation.
- Micro-interactions on buttons: scale or underline, not excessive bounce.

## Libraries

- Use the project’s chosen motion library consistently; do not mix conflicting animation systems without reason.
