# Final Checklist

Use before merging or shipping a page/feature.

## Design & UX

- [ ] Matches layout, spacing, and component rules
- [ ] Responsive at mobile, tablet, desktop
- [ ] Focus states and keyboard navigation work

## Code

- [ ] TypeScript strict; no new unjustified `any`
- [ ] Follows folder structure and coding standards
- [ ] No console noise or debug code left in

## Accessibility

- [ ] Semantic HTML, labels, alt text
- [ ] Color contrast checked on new UI
- [ ] `prefers-reduced-motion` respected for animations

## Performance

- [ ] Images optimized and sized correctly
- [ ] No obvious bundle bloat; lazy-load where appropriate
- [ ] CLS avoided (dimensions reserved for media)

## SEO & Content

- [ ] Title, meta description, H1 set
- [ ] Copy proofread; links work
- [ ] Structured data updated if page type changed

## Quality

- [ ] Lint/tests pass
- [ ] Manual smoke test of primary user path
- [ ] Analytics/events wired if required for this feature

## Sign-off

- [ ] Reviewer approved (or solo checklist completed for small fixes)
