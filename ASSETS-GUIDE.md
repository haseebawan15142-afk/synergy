# Synergy Website — Assets Guide

Use this guide when you want to **replace images, videos, logos, or other media** on the site.

All public files live under:

```
synergy_computer_website/public/
```

In the browser they are served from the site root. Example:  
`public/videos/hero/landing-01.mp4` → `https://yoursite.com/videos/hero/landing-01.mp4`

---

## Quick reference

| What you want to change | Folder | Config file to edit |
|-------------------------|--------|---------------------|
| **Landing page hero videos** (4 clips, rotate) | `public/videos/hero/` | `src/lib/content/hero-videos.ts` |
| CEO message video (About page) | `public/videos/` | `src/lib/content/ceo-message.ts` |
| Company logo | `public/brand/` | Header/footer components |
| Partner logos | `public/images/partners/` | `src/lib/content/partners.ts` |
| Dynatrace logo | `public/brand/dynatrace/` | `src/lib/content/dynatrace-partner.ts` |
| Service card images (homepage) | `public/images/services/` | `src/lib/content/services.ts` |
| Case study images | `public/images/case-studies/` | `src/lib/content/case-studies.ts` |
| Dynatrace gallery (Partners page) | `public/images/dynatrace/` | `src/lib/content/dynatrace-partner.ts` |
| Hero image slides (backup carousel) | `public/images/hero/` | Run `npm run sync:hero` |
| Blog post images | `public/images/blog/` | `src/lib/content/blog-images.generated.ts` |

---

## 1. Landing page hero videos (your 4 Downloads clips)

**Where files are placed:**

```
public/videos/hero/
├── landing-01.mp4   ← from Downloads: 1992-153555258.mp4
├── landing-02.mp4   ← from Downloads: 110923-689949643.mp4
├── landing-03.mp4   ← from Downloads: 304598_medium.mp4
└── landing-04.mp4   ← from Downloads: 192779-893446888_medium.mp4
```

**How it works:**
- Only the **homepage hero** (top of landing page) uses these videos.
- They play **one after another** with a smooth crossfade (~1.2 seconds).
- Each clip shows for **8 seconds** before switching to the next.
- Component: `src/components/home/HeroVideoBackground.tsx`
- List of videos: `src/lib/content/hero-videos.ts`

**To replace a video:**
1. Copy your new `.mp4` into `public/videos/hero/` (same name, e.g. replace `landing-02.mp4`).
2. Or add a new file and update the path in `src/lib/content/hero-videos.ts`:

```ts
export const heroVideos: HeroVideo[] = [
  { src: "/videos/hero/landing-01.mp4" },
  { src: "/videos/hero/landing-02.mp4" },
  // add or remove entries here
];
```

**To change speed / fade:**
Edit in `src/lib/content/hero-videos.ts`:
- `heroVideoIntervalMs` — how long each clip stays (default `8000` = 8 sec)
- `heroVideoTransitionMs` — fade duration (default `1200` = 1.2 sec)

**Tips:**
- Use `.mp4` (H.264) for best browser support.
- Keep file sizes reasonable; `landing-01.mp4` is ~74 MB — consider compressing if the site feels slow.
- After replacing files, hard-refresh the browser (`Ctrl + Shift + R`).

**Original Downloads mapping:**

| Project file | Your Downloads file |
|--------------|---------------------|
| `landing-01.mp4` | `1992-153555258.mp4` |
| `landing-02.mp4` | `110923-689949643.mp4` |
| `landing-03.mp4` | `304598_medium.mp4` |
| `landing-04.mp4` | `192779-893446888_medium.mp4` |

---

## 2. Other videos

| File | Used on | Config |
|------|---------|--------|
| `public/videos/ceo-message-demo.mp4` | About page — CEO message section | `src/lib/content/ceo-message.ts` |
| `public/videos/ceo-message-demo-poster.jpg` | Thumbnail before video loads | `src/lib/content/ceo-message.ts` |

Replace the `.mp4` and `.jpg`, then update `videoSrc` / `posterSrc` in `ceo-message.ts` if you rename files.

---

## 3. Logos & brand

```
public/brand/
├── logo.svg                      → Main Synergy logo (header)
└── dynatrace/
    └── wordmark.svg              → Dynatrace partner logo
```

---

## 4. Homepage section images

### Services cards

```
public/images/services/
├── on-site-it-support.jpg
├── network-infrastructure.jpg
├── data-backup-recovery.jpg
├── microsoft-365-cloud.jpg
└── managed-it.jpg
```

Edit paths in: `src/lib/content/services.ts` → `image` field on each service.

### Case studies carousel

```
public/images/case-studies/
├── multinational-bank-data-resilience.jpg
├── healthcare-network-modernization.jpg
└── power-utility-infrastructure.jpg
```

Edit: `src/lib/content/case-studies.ts`

### Partner logos

```
public/images/partners/
```

Edit: `src/lib/content/partners.ts` → `logo` field.

---

## 5. Partners page — Dynatrace

```
public/images/dynatrace/
├── innovate-singapore-01.jpg
├── innovate-singapore-02.jpg
└── innovate-singapore-03.jpg
```

Edit: `src/lib/content/dynatrace-partner.ts` → `gallery` array.

---

## 6. Hero image slides (optional backup)

Add images to `public/images/hero/` then run:

```bash
npm run sync:hero
```

Currently the homepage hero uses **videos**, not this carousel.

---

## 7. Blog images

```
public/images/blog/
```

Generated map: `src/lib/content/blog-images.generated.ts`

---

## 8. Removed old stock videos

These Mixkit/stock files were deleted. Only your Downloads clips are on the landing hero now:

- `hero-background-01.mp4`, `02`, `03`
- `solutions-background.mp4` (Solutions section no longer has video background)

---

## 9. After any asset change

1. Save the file in `public/…`
2. Update the matching file in `src/lib/content/` if paths changed
3. Restart dev server if needed: `npm run dev`
4. Hard refresh: `Ctrl + Shift + R`
5. Push to GitHub for Vercel deploy

---

## 10. Performance — compress videos & images

After adding or replacing large media, run:

```bash
npm run optimize:videos   # H.264 720p MP4 + poster JPG (hero + CEO)
npm run optimize:images   # Compress public/images/blog + hero
```

**Hero videos** (`public/videos/hero/`): used only on the homepage hero. Mobile/slow connections get a static poster instead of video (`HeroVideoBackground.tsx`).

**CEO video** (`public/videos/my-ceo-video.mp4`): click-to-play on About page, `preload="none"`.

**Config for hero rotation:** `src/lib/content/hero-videos.ts`  
**Timing / fade:** `heroVideoIntervalMs`, `heroVideoTransitionMs` in the same file.

---

## Folder tree

```
public/
├── brand/                    Logos
├── images/
│   ├── blog/
│   ├── case-studies/
│   ├── dynatrace/
│   ├── hero/
│   ├── partners/
│   └── services/
└── videos/
    ├── hero/                 ★ Landing page background (4 clips)
    ├── ceo-message-demo.mp4
    └── ceo-message-demo-poster.jpg
```
