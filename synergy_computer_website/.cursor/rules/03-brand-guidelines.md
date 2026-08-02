# Brand Guidelines



## Brand Name



Use **Synergy Computers** or **Synergy Computers (Pvt.) Ltd.** in customer-facing copy as appropriate; legacy site uses “SCL” internally.



## Voice



- **Professional** — Confident, helpful, not salesy.

- **Plain language** — Explain tech without jargon when possible; define terms when needed.

- **Local & reliable** — Emphasize service, support, and expertise where accurate.



## Terminology



- Prefer “we” / “our team” for the business; “you” for the customer.

- Use consistent product category names across nav, URLs, and headings.



## Color system (70 / 20 / 10)



Full spec: `.cursor/docs/brand-colors.md` · tokens: `design-tokens/`



| Share | Role | Tokens |

|-------|------|--------|

| **~70%** | White / off-white — spacious layouts | `surface`, `surface-muted`, `white` |

| **~20%** | Black / gray — typography & structure | `ink`, `ink-body`, `ink-muted`, `border` |

| **~10%** | **Synergy Green** — actions & emphasis | `synergy` `#357C3C`, hover `synergy-dark` `#2A813E` |



**Synergy Green is for:** primary buttons, text links, icons, highlights, active nav, focus rings, small badges — **not** large background areas.



**Neutrals carry the layout; green draws attention to what to do next.**



## Design reference

- **UX / layout:** https://www.e360.com/ — documented in `.cursor/docs/design-reference-e360.md`.
- **Colors:** Synergy 70/20/10 — never e360’s brand colors.

## Logo & Marks



- Source files: **`.cursor/assets/brand/`** → deploy to **`public/brand/`** in the app.

- Do not stretch, recolor, or add effects outside approved assets.

- Maintain clear space around the logo (minimum height of letter “S” on all sides unless brand kit says otherwise).



## Colors & Typography



- Use Tailwind tokens from `design-tokens/tailwind-theme.extend.ts` — no raw `#357C3C` in components.

- Typography: _[TODO: font family when confirmed — legacy site uses theme default sans]_



## Imagery



- Marketing and section images: **`.cursor/assets/marketing/`**

- Partner logos: **`.cursor/assets/marketing/partners/`** or vendor-approved files

- Inventory: `.cursor/assets/manifest.json`



## Legal & Disclaimers



- Prices, offers, and stock: use approved disclaimer language where required.

- Warranty and return policy links must match official business documents.


