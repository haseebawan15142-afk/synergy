# Footer — Generation Prompt

Use when implementing or updating the **site footer**.

## Context

- Links & legal pages: `.cursor/docs/site-map.md` (utility / legal)
- Contact & hours: `.cursor/docs/company-profile.md`
- Nav labels: `.cursor/docs/website-content.md` (footer section)
- Rules: `.cursor/rules/04-ui-ux-rules.md`, `13-accessibility.md`

## Task

Build a **responsive footer** with structured columns, contact info, legal links, and copyright.

## Content Columns (adjust to site map)

1. **Shop / Products** — if applicable  
2. **Services** — top service links  
3. **Company** — About, Partners, Case studies, Careers (if any)  
4. **Contact** — address, phone (click-to-call `tel:`), email (`mailto:`), hours  

## Required Elements

- © year and business name (Synergy Computer).
- Privacy, Terms, Warranty/Returns links (or `TODO:` if pages not built yet).
- Social icons with accessible labels (`aria-label` + external link handling if needed).

## Layout

- Desktop: multi-column grid aligned with site container utilities.
- Mobile: stacked sections with clear headings per column.
- Use `<footer>` and optional `<nav aria-label="Footer">` per link group.

## Technical

- Shared `Footer` component in layout; no page duplicates.
- Phone/email must match `company-profile.md` when filled; otherwise `TODO:` placeholders.
- Optional: organization schema address — only when data is verified.

## Accessibility

- [ ] Link text descriptive (not “click here”)
- [ ] Icon-only social links have accessible names
- [ ] Sufficient contrast for text and links

## Output

- Component path and props/config if any.
- List of footer links with target paths.
- Missing legal pages flagged for follow-up.

## Do Not

- Invent addresses, phone numbers, or policy URLs.
- Omit footer nav that duplicates header without reason — footer is backup for discovery and legal.
