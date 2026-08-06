# Synergy Computers Website — Project Status

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Framer Motion  
**Repo:** `haseebawan15142-afk/synergy` · branch `main`  
**Local:** `http://localhost:3000`  
**Last updated:** 4 August 2026

---

## What this project is

Enterprise marketing site for **Synergy Computers (Pvt.) Ltd.** (Pakistan IT / infrastructure partner). Includes homepage, services, industries, partners, about (CEO + leadership), careers, resources/blog, case studies, contact, and an AI chat widget grounded in site content.

---

## Completed

### Core site & pages
- [x] Homepage with video hero, solutions, services, industries, partners teaser, story/stats, client success, recent updates, CTA
- [x] Services listing + detail pages
- [x] Industries listing + detail pages
- [x] Partners page (including Dynatrace exclusive section)
- [x] About page — CEO message video, leadership photos/bios, accomplishments
- [x] Careers page (hero, tracks, culture, hiring process, jobs/application UI, locations, community, CTA)
- [x] Resources / blog listing + post pages (migrated content + images)
- [x] Case studies
- [x] Contact page + form UI
- [x] Global navbar (mega menus), footer, theme selector (light / dark / system)
- [x] Responsive layout polish for mobile and desktop

### Hero video system
- [x] Rotating hero clips from `public/videos/hero/` (`landing-01` … `04`)
- [x] Config in `src/lib/content/hero-videos.ts`
- [x] `HeroVideoBackground` — mobile/slow connection uses poster; desktop rotates with crossfade
- [x] Re-encode script `npm run optimize:videos` — **30fps**, 720p max, CRF ~31–32, no audio, `+faststart`
- [x] WebM (VP9) variants generated and wired as `<source type="video/webm">`
- [x] Crossfade waits for `readyState >= HAVE_ENOUGH_DATA` before starting the incoming layer
- [x] Outgoing layer paused after crossfade (avoid dual full-bitrate decode)
- [x] Clip 1 replaced / re-encoded from Downloads source when requested
- [x] Hero “At a glance” stats panel removed from hero content

### Performance & payload
- [x] Image optimize script `npm run optimize:images` (Sharp) — blog @ **1280px**, WebP + AVIF; regenerates `blog-images.generated.ts`
- [x] Blog images cut from ~**19.2 MB** sources to ~**9.2 MB** optimized pairs
- [x] Oversized unused hero stills optimized then **removed** (live hero is video-only)
- [x] Dead image carousel path removed (`HeroBackgroundCarousel`, `hero-slides*`, `sync-hero-images`)
- [x] **GSAP removed** — animation consolidated on **Framer Motion** only (`PremiumTitle`, parallax ported; dead `GsapScrollEffects` deleted)
- [x] Aurora blobs: cheap radial gradients instead of heavy live blur; fully disabled while hero video is in view (`hero-video-presence`)
- [x] `HeroExperienceLayer` mousemove throttled with `requestAnimationFrame`
- [x] `next.config.ts` cleaned (no empty remote patterns; `optimizePackageImports` for framer-motion + lucide-react)
- [x] Nested duplicate project folder that broke Vercel builds excluded / removed
- [x] Production build verified — homepage **First Load JS ~171 kB** (page ~15.5 kB)

### Content & features
- [x] Leadership content restored (CEO, COO, CTO, Sales) with photos under `public/images/leadership/`
- [x] CEO video at `public/videos/my-ceo-video.mp4`
- [x] Careers content + hero background image
- [x] Nav link: Careers → `/careers`
- [x] Chat widget UI upgrades (quick replies, localStorage, richer rendering)
- [x] Chat knowledge expanded from site content (leadership, CEO, accomplishments, case studies, Dynatrace, services, partners, industries)
- [x] Design tokens / ink text contrast tweaks
- [x] Company Profile 2026 sync — gap analysis in `MISSING-CONTENT.md`; PDF-backed offices, board, expertise, industries, partners, stats (see `src/lib/content/company-profile.ts`)
- [x] Homepage Selected Clientele + Partnerships infinite logo marquees (profile screenshots); removed duplicate PartnersStrip / PartnerTicker carousels
- [x] Service detail pages upgraded (Arcana-style sober layout): hero banner, challenge/approach/benefits, capabilities, outcomes, process, CTA

### Tooling
- [x] `npm run dev` / `build` / `start` / `lint`
- [x] `npm run optimize:videos`
- [x] `npm run optimize:images`
- [x] `ASSETS-GUIDE.md` + `README.md`

### Dead code removed (cleanup pass)
- [x] `HeroBackgroundCarousel`, `NavDropdown`, `ServiceCategoryIcons`, `GsapScrollEffects`
- [x] Unused `content/index` barrel, unused motion variants, unused `ThemeToggle` alias
- [x] `gsap` dependency uninstalled

---

## Pending / recommended next

### High value
| Item | Why |
|------|-----|
| Manual Chrome Performance check (4× CPU) through one hero crossfade | Confirm ~60fps after video + aurora + RAF work; not fully automated in session |
| Hero WebM vs MP4 size pass | Some WebMs are **larger** than MP4; consider deleting oversized WebMs or re-encoding at higher VP9 CRF so Chromium still gets a smaller decode path without bigger download |
| Contact form SMTP / email delivery | README notes SMTP env vars “when ready”; form UI exists — wiring + production test still needed |
| Confirm Groq / chat on production | Ensure `GROQ_API_KEY` (and any chat env) is set on Vercel |

### Medium
| Item | Why |
|------|-----|
| Optional: drop on-disk `.avif` copies under `public/images/blog` | `next/image` already serves AVIF from WebP sources; dual files inflate deploy size (~half of blog folder) |
| Homepage media budget | Hero videos still ~**8 MB** total under `public/videos/hero/` — largest remaining marketing-page weight |
| Blog body migration | Some posts may still point users to legacy `synergy.net.pk` when full body text isn’t migrated |
| QA pass across all main routes on mobile + desktop | Visual/regression check after performance + GSAP removal |

### Nice to have
| Item | Why |
|------|-----|
| Bundle analyzer (`@next/bundle-analyzer`) | Deeper chunk report beyond Next build table |
| Rename `GsapParallax` → e.g. `ScrollParallax` | Naming leftover after GSAP removal (behavior already Framer-based) |
| SEO / analytics extras | Sitemap, robots, Search Console, analytics — only if not already configured on host |
| Accessibility sweep | Keyboard/focus on mega menu, chat, careers form |

### Ops
| Item | Why |
|------|-----|
| Keep `main` deploy green on Vercel | Watch for failed deploys from old commits; current tree should be clean of nested `@cursor/sdk` project |
| Document env vars for the team | `.env.example` → production checklist (Groq, SMTP, any future CMS keys) |

---

## Key paths (quick map)

| Area | Path |
|------|------|
| Homepage | `src/app/page.tsx` |
| Hero video UI | `src/components/home/HeroVideoBackground.tsx` |
| Hero video config | `src/lib/content/hero-videos.ts` |
| Careers | `src/app/careers/page.tsx`, `src/components/careers/*`, `src/lib/content/careers.ts` |
| About / CEO / leadership | `src/components/about/*`, `src/lib/content/ceo-message.ts`, `leadership.ts` |
| Blog images map | `src/lib/content/blog-images.ts` (+ `.generated.ts`) |
| Chat | `src/components/chat/ChatWidget.tsx`, `src/lib/chat/*` |
| Video optimize | `scripts/optimize-videos.mjs` |
| Image optimize | `scripts/optimize-images.mjs` |
| Global styles / aurora | `src/app/globals.css` |

---

## How to re-run optimizers

```bash
npm run optimize:videos   # hero + CEO → 30fps MP4 + WebM + posters
npm run optimize:images   # blog (and optional public/images/hero) → WebP/AVIF
npm run build             # production build
```

---

## Summary

**Done:** Full marketing site with video hero, careers, leadership/CEO, blog, partners, chat, and a large performance pass (images, videos, GSAP removal, aurora/mousemove/crossfade fixes).

**Pending:** Manual performance confirmation, optional WebM/AVIF disk cleanup, contact email wiring, production env verification, and a full QA pass.
