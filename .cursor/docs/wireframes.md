# Wireframes



> Structure aligned with design reference **[e360.com](https://www.e360.com/)** — see `design-reference-e360.md`.  

> Colors: Synergy 70/20/10 (`brand-colors.md`), not e360 branding.



## Conventions



- **Breakpoints:** mobile (375), tablet (768), desktop (1280)  

- **Annotations:** `[C]` component from design system, `[T]` placeholder text, `[IMG]` image  



## Global Chrome



### Header



```text

[Logo]  Nav: Services · Industries · Partners · About · Resources    [Contact Us — synergy green]

```



- Mobile: hamburger → drawer; focus trap + Escape  

- **Sticky:** yes (match e360)  

- **Search:** no (V1)  



### Footer



```text

[Logo / tagline]

Col1: Services    Col2: Industries    Col3: Company    Col4: Contact (Karachi HQ + email)

────────────────────────────────────────────────────────────

Privacy · Terms · LinkedIn · Facebook · © Synergy Computers (Pvt.) Ltd.

```



---



## Home (e360-style flow)



### Desktop



```text

┌─────────────────────────────────────────────────────────┐

│ HERO: H1, subcopy, [Contact Us] [Explore services]      │

├─────────────────────────────────────────────────────────┤

│ TRUST: “Our Principals” logo carousel / grid            │

├─────────────────────────────────────────────────────────┤

│ STORY: 40+ years, mission snippet, [About Us]           │

├─────────────────────────────────────────────────────────┤

│ PROBLEMS WE SOLVE: 5–6 cards (pain → Synergy outcome)   │

├─────────────────────────────────────────────────────────┤

│ (Optional V2) CASE STUDIES — skipped V1                 │

├─────────────────────────────────────────────────────────┤

│ EXPLORE SERVICES: card grid → /services/[slug]          │

├─────────────────────────────────────────────────────────┤

│ PARTNERS TEASER: “Experts in your stack” + [Partners]   │

├─────────────────────────────────────────────────────────┤

│ INDUSTRIES: sector tiles → /industries/[slug]           │

├─────────────────────────────────────────────────────────┤

│ (Optional) TESTIMONIALS                                 │

├─────────────────────────────────────────────────────────┤

│ CTA BAND: Meet with an expert + link to /contact        │

└─────────────────────────────────────────────────────────┘

```



### Mobile notes



- Hero: copy first, then optional `[IMG]`  

- Partner logos: horizontal scroll with snap  

- Problem cards: single column stack  



---



## Services Hub



- Intro + grid (e360 “Explore our Services”)  

- Optional FAQ accordion at bottom  



## Service Detail



- Hero (title, summary, primary CTA)  

- Problem / solution narrative (e360 card style)  

- Benefits, process steps  

- FAQ  

- Closing CTA → `/contact`  



## Contact



- Two column desktop: form | branches + phones + email  

- Single column mobile  

- Form posts to email (info@synergy.net.pk)  



---



## Design Files



| Screen | Reference | Status |

|--------|-----------|--------|

| Home | https://www.e360.com/ | Pattern locked |

| Contact | e360 footer CTA + standard contact | Draft |

| Figma | _Optional override_ | — |



## Open UX Decisions



- [x] Search: none V1  

- [ ] Quote flow: single contact form vs. multi-step (default: single)  

- [ ] Chat widget: none unless requested  



## Related



- `design-reference-e360.md` — section mapping  

- `site-map.md` — URLs  

- `.cursor/rules/05-layout-rules.md` — implementation  


