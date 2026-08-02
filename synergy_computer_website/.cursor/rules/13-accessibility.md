# Accessibility

## Standard

Target **WCAG 2.1 Level AA** for all public pages and critical flows.

## Semantics

- Use native elements (`button`, `a`, `nav`, `main`, `header`, `footer`) before ARIA widgets.
- Custom controls need roles, labels, and keyboard behavior matching native patterns.

## Keyboard

- Full tab order; visible `:focus-visible` styles on all interactive elements.
- Modals: focus trap, Escape to close, return focus to trigger.

## Images

- Meaningful `alt` text; decorative images `alt=""`.
- Complex diagrams: longer description nearby or in accessible text.

## Color & Contrast

- Text and UI meet contrast ratios; verify with tooling for brand colors.

## Forms

- Associate labels with inputs; group related fields with `fieldset`/`legend` when appropriate.
- Error summaries for multi-field forms when useful.

## Testing

- Quick pass: keyboard-only navigation, VoiceOver/NVDA spot check, axe DevTools on key templates.
