# Media optimization report

Generated: 2026-08-05T06:01:32.078Z

## Summary

- Converted to WebP: **31**
- Removed unused blog AVIF siblings: **147** (deleted in the same pass / prior cleanup; `next/image` serves AVIF from WebP)
- Removed oversized WebM (MP4 kept): **4**
- Skipped: **11** (brand PNGs with transparency; 2 posters with under 8% WebP gain)
- Approx space saved: **~8 MB** from WebP conversions + WebM removals, plus **~4.3 MB** from AVIF sibling cleanup (**~12+ MB** total vs pre-optimize tree)

## Firebase Storage key mapping

Local `public/` paths are preserved. When uploading to Firebase Storage, use `storageKey` from the JSON report (e.g. `/images/services/x.webp` → `services/x.webp`).

## Converted files

| Original | New | Before | After | Reduction | Refs updated |
|---|---|---:|---:|---:|---|
| `/images/careers/hero-background.png` | `/images/careers/hero-background.webp` | 1430 KB | 45 KB | 96.8% | yes |
| `/images/case-studies/healthcare-network-modernization.jpg` | `/images/case-studies/healthcare-network-modernization.webp` | 332 KB | 108 KB | 67.5% | yes |
| `/images/case-studies/multinational-bank-data-resilience.jpg` | `/images/case-studies/multinational-bank-data-resilience.webp` | 72 KB | 38 KB | 47.1% | yes |
| `/images/case-studies/power-utility-infrastructure.jpg` | `/images/case-studies/power-utility-infrastructure.webp` | 55 KB | 26 KB | 52.4% | yes |
| `/images/dynatrace/innovate-singapore-01.jpg` | `/images/dynatrace/innovate-singapore-01.webp` | 122 KB | 102 KB | 16.3% | yes |
| `/images/dynatrace/innovate-singapore-02.jpg` | `/images/dynatrace/innovate-singapore-02.webp` | 72 KB | 65 KB | 9.5% | yes |
| `/images/dynatrace/innovate-singapore-03.jpg` | `/images/dynatrace/innovate-singapore-03.webp` | 61 KB | 53 KB | 13.5% | yes |
| `/images/leadership/ceo.jpg` | `/images/leadership/ceo.webp` | 384 KB | 129 KB | 66.4% | yes |
| `/images/leadership/coo.jpg` | `/images/leadership/coo.webp` | 257 KB | 53 KB | 79.3% | yes |
| `/images/leadership/cto.jpg` | `/images/leadership/cto.webp` | 308 KB | 75 KB | 75.7% | yes |
| `/images/leadership/sales-head.jpg` | `/images/leadership/sales-head.webp` | 276 KB | 63 KB | 77.2% | yes |
| `/images/partners/automation-anywhere.jpg` | `/images/partners/automation-anywhere.webp` | 33 KB | 5 KB | 86.1% | yes |
| `/images/partners/convene.jpg` | `/images/partners/convene.webp` | 37 KB | 4 KB | 88% | yes |
| `/images/partners/ddn.jpg` | `/images/partners/ddn.webp` | 26 KB | 2 KB | 90.5% | yes |
| `/images/partners/dell.jpg` | `/images/partners/dell.webp` | 17 KB | 3 KB | 80.5% | yes |
| `/images/partners/dynatrace.jpg` | `/images/partners/dynatrace.webp` | 12 KB | 3 KB | 78.3% | n/a |
| `/images/partners/hitachi-vantara.jpg` | `/images/partners/hitachi-vantara.webp` | 9 KB | 3 KB | 71.5% | yes |
| `/images/partners/infor.jpg` | `/images/partners/infor.webp` | 24 KB | 2 KB | 92.3% | yes |
| `/images/partners/innovative.jpg` | `/images/partners/innovative.webp` | 32 KB | 4 KB | 87% | yes |
| `/images/partners/netapp.jpg` | `/images/partners/netapp.webp` | 19 KB | 1 KB | 93.8% | yes |
| `/images/partners/oracle.jpg` | `/images/partners/oracle.webp` | 30 KB | 3 KB | 89.8% | yes |
| `/images/partners/utimaco.jpg` | `/images/partners/utimaco.webp` | 24 KB | 2 KB | 90.1% | yes |
| `/images/partners/veritas.jpg` | `/images/partners/veritas.webp` | 32 KB | 3 KB | 90.3% | yes |
| `/images/services/data-backup-recovery.jpg` | `/images/services/data-backup-recovery.webp` | 73 KB | 39 KB | 46.3% | yes |
| `/images/services/managed-it.jpg` | `/images/services/managed-it.webp` | 76 KB | 39 KB | 48.9% | yes |
| `/images/services/microsoft-365-cloud.jpg` | `/images/services/microsoft-365-cloud.webp` | 68 KB | 34 KB | 50.2% | yes |
| `/images/services/network-infrastructure.jpg` | `/images/services/network-infrastructure.webp` | 107 KB | 87 KB | 18.4% | yes |
| `/images/services/on-site-it-support.jpg` | `/images/services/on-site-it-support.webp` | 78 KB | 45 KB | 41.7% | yes |
| `/videos/hero/landing-01-poster.jpg` | `/videos/hero/landing-01-poster.webp` | 33 KB | 24 KB | 28.8% | yes |
| `/videos/hero/landing-03-poster.jpg` | `/videos/hero/landing-03-poster.webp` | 71 KB | 60 KB | 15.7% | yes |
| `/videos/hero/landing-04-poster.jpg` | `/videos/hero/landing-04-poster.webp` | 29 KB | 21 KB | 26.1% | yes |

## Skipped (with reason)

- /brand/favicon.png — PNG kept (transparency required)
- /brand/footer-light-logo.png — PNG kept (transparency required)
- /brand/logo-footer.png — PNG kept (transparency required)
- /brand/logo-inner.png — PNG kept (transparency required)
- /brand/logo-primary.png — PNG kept (transparency required)
- /brand/logo-user-provided.png — PNG kept (transparency required)
- /brand/logo.png — PNG kept (transparency required)
- /brand/scl-mark-source.png — PNG kept (transparency required)
- /brand/scl-mark.png — PNG kept (transparency required)
- /videos/hero/landing-02-poster.jpg — conversion skipped (WebP 144KB vs 150KB, save 4.1%)
- /videos/my-ceo-video-poster.jpg — conversion skipped (WebP 144KB vs 150KB, save 4.1%)
