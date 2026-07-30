# Brand color system

> **Rule:** ~70% white/off-white · ~20% black/gray (type & structure) · ~10% Synergy Green (actions & emphasis).  
> Primary green matches legacy brand: `#357C3C`.

## Usage ratio (UI)

| Role | Share | Token(s) | Use for |
|------|-------|----------|---------|
| Canvas | ~70% | `surface`, `surface-muted`, `white` | Page background, cards, sections |
| Structure | ~20% | `ink`, `ink-muted`, `border`, `border-strong` | Headings, body, borders, dividers, footer text |
| Accent | ~10% | `synergy`, `synergy-dark`, `synergy-muted` | Primary buttons, links, icons, focus rings, active nav, badges |

Do **not** use Synergy Green for large background fields (heroes, full-width bands) except small CTA strips or icon accents.

---

## Token reference

### White / off-white (~70%)

| Token | Hex | Usage |
|-------|-----|--------|
| `white` | `#FFFFFF` | Cards, nav bar, modals |
| `surface` | `#FAFBFC` | Default page background |
| `surface-muted` | `#F4F6F8` | Alternating sections, subtle panels |

### Black / gray (~20%)

| Token | Hex | Usage |
|-------|-----|--------|
| `ink` | `#0D0D0D` | Primary headings, strong emphasis |
| `ink-secondary` | `#1A1A1A` | Secondary headings |
| `ink-body` | `#3D3D3D` | Body copy |
| `ink-muted` | `#6B7280` | Captions, meta, placeholders |
| `border` | `#E5E7EB` | Default borders |
| `border-strong` | `#9CA3AF` | Strong dividers, input borders (focus uses synergy) |

### Synergy Green (~10%)

| Token | Hex | Usage |
|-------|-----|--------|
| `synergy` | `#357C3C` | Primary buttons, links, icon accents, active states |
| `synergy-dark` | `#2A813E` | Button hover, pressed |
| `synergy-muted` | `#E6F2E8` | Optional: very light tint for badges (keep small) |

### Semantic (derived)

| Token | Maps to | Usage |
|-------|---------|--------|
| `on-synergy` | `#FFFFFF` | Text/icons on green buttons |
| `focus-ring` | `synergy` @ 2px | `:focus-visible` outlines |

---

## Accessibility

- Body text `ink-body` on `surface`: verify **≥ 4.5:1** (passes on white/off-white).
- `synergy` on `white` for **large text / UI components** only if contrast passes; use `synergy-dark` for small green text on white if needed.
- Links: default `text-synergy`, underline on hover or `focus-visible:ring-2 ring-synergy`.

---

## Logo & assets

Files live in **`.cursor/assets/`** (source) and are copied to **`public/brand/`** when the app is built. See `.cursor/assets/README.md`.

---

## Implementation

- CSS variables: `design-tokens/tokens.css`
- Tailwind: `design-tokens/tailwind-theme.extend.ts` (merge into `tailwind.config` on scaffold)

Do not hardcode `#357C3C` in components—use `bg-synergy`, `text-synergy`, etc.
