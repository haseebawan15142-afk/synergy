# Design reference: e360.com

> **Reference URL:** https://www.e360.com/  
> **Purpose:** Layout, section flow, enterprise B2B tone, and UX patterns for the new Synergy Computers site.  
> **Not** a competitor doc — do not copy e360 copy, logos, or colors.

## Brand overlay (Synergy wins)

Apply **Synergy** tokens from `.cursor/docs/brand-colors.md`, not e360’s palette:

| e360 pattern | Synergy implementation |
|--------------|-------------------------|
| Light, spacious sections | ~70% `surface` / `white` |
| Dark headlines & body | ~20% `ink`, `ink-body`, `ink-muted` |
| Primary CTAs & links | ~10% `synergy` (`#357C3C`), hover `synergy-dark` |
| Logo & images | `.cursor/assets/` → `public/brand/`, `public/images/` |

---

## What to emulate (structure & UX)

### Global chrome

- Clean top nav: logo left, primary links center/right, **one strong CTA** (e360: “Speak with an Expert” → Synergy: **Contact Us** / **Speak with an expert**).
- Sticky header on scroll (recommended).
- Footer: company info, legal links, social; optional newsletter (Synergy legacy had subscribe — optional V1).

### Homepage section order (map to Synergy)

| # | e360 section | Synergy equivalent | Content source |
|---|--------------|-------------------|----------------|
| 1 | Hero — H1 + subcopy + dual CTA | Same | `website-content.md` |
| 2 | “Trusted by…” logo strip | **Our Principals** | `technology-partners.md` |
| 3 | Longevity / culture story + CTA | **40+ years**, vision/mission teaser | `company-profile.md` |
| 4 | **Problems We Solve** — cards (challenge → outcome) | Service value props (5 V1 services) | `services.md` |
| 5 | Case studies (2-up + link) | Skip V1 or “Coming soon” | User decision |
| 6 | **Explore our Services** — service grid | Services hub cards | `services.md` |
| 7 | **Experts in tech stack** + partner CTA | Partner grid + “See all partners” | `/partners` |
| 8 | **Industry expertise** — sector tiles | 5 V1 industries | `industries.md` |
| 9 | Testimonials | Optional V1 (none on legacy) | TBD |
| 10 | **Meet with an Expert** — lead band + form | Contact CTA + `/contact` form | `company-profile.md` |

### “Problems We Solve” pattern (use on Home + service pages)

Each block:

1. **Service pillar** (short label) — e.g. Managed Services  
2. **Problem headline** — pain in customer language  
3. **Body** — how Synergy helps (outcome-focused)  
4. Optional link → service detail page  

Adapt e360’s tone for **Pakistan enterprise** and Synergy’s actual offerings (infrastructure, security, M365, backup, on-site, 24×7 maintenance).

### Service hub / detail

- Hub: intro paragraph + **card grid** (title, short description, deep link).  
- Detail: hero (H1, summary, CTA), benefits, process, FAQ, closing CTA — same rhythm as e360 service storytelling, Synergy copy.

### Partners page

- e360: “See All Partners” after logo row — use grid of principal logos + vendor links.  
- Synergy: names from legacy site until logos in `.cursor/assets/marketing/partners/`.

### Industries

- e360: grid of sector names linking to vertical pages.  
- Synergy: Banking, Healthcare, Education, Retail/hospitality, Government/SMB — per `industries.md`.

### CTAs (wording)

| e360 | Synergy suggestion |
|------|-------------------|
| Speak with an Expert | Contact Us / Speak with an expert |
| Discover Our Solutions | Explore our services |
| Explore Services | View all services |
| Read Case Study | _(when case studies live)_ |
| See All Partners | View all partners |
| Meet with an Expert | Get in touch |

All primary actions use **`synergy` button** style; secondary = outline or text link in `ink` with green hover.

---

## What not to copy

- e360 name, logos, client names (Yamaha, QuidelOrtho, etc.)  
- e360-specific services (Composable Enterprise, Office of Innovation) unless Synergy sells equivalent  
- California-centric testimonial quotes  
- e360 color scheme and typography — use Synergy tokens only  

---

## Typography & motion (guidance)

- e360: large confident **H1**, tight section headings, comfortable line length.  
- Synergy: match hierarchy (one H1 per page); system sans stack when fonts are defined.  
- Motion: subtle section fades only; respect `prefers-reduced-motion` (`07-animation-rules.md`).

---

## Responsive

- e360 is mobile-friendly: stacked hero, horizontal scroll or wrapped logo strips, hamburger nav.  
- Match breakpoints in `wireframes.md` (375 / 768 / 1280).

---

## Related docs

- `wireframes.md` — updated home structure  
- `homepage.prompt.md`, `hero.prompt.md`, `service-page.prompt.md`  
- `e360-analysis.md` — internal project/delivery framework (separate from this visual reference)

## Reference snapshot

- Captured: 2026-07-29  
- Homepage hero (e360): *“From Strategy to Scale: IT Solutions Built for What's Next”* — use as **structure reference only**; Synergy H1 from `website-content.md`.
