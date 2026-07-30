# Layout Rules

## Grid & Containers

- Use the project’s max-width container utility consistently (e.g. `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
- Section vertical rhythm: prefer a defined spacing scale (e.g. `py-12 md:py-16 lg:py-20`).

## Breakpoints

- Mobile-first: default styles for small screens, enhance at `sm`, `md`, `lg`, `xl` as in Tailwind config.
- Test critical pages at 320px, 768px, and 1280px minimum.

## Page Structure

- Header (sticky only if it does not obscure content or harm performance).
- Main landmark (`<main>`) wraps primary content.
- Footer with structured columns on large screens, stacked on small.

## Sections

- Hero: headline, subcopy, primary CTA, optional secondary CTA or trust signal.
- Feature/product grids: consistent card aspect ratios and alignment.
- Avoid horizontal scroll except intentional carousels with accessible controls.

## Responsive Images & Media

- Use responsive images (`srcset`, `sizes`) or framework image component.
- Reserve aspect ratio to prevent layout shift (CLS).
