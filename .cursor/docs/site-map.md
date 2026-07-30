# Site Map

> Information architecture for nav, footer, and URL structure. Update when pages are added or cut.

## Primary Navigation

```text
Home (/)
├── Products (/products)
│   ├── [Category] (/products/[category])
│   └── [Product detail] (/products/[slug])
├── Services (/services)
│   └── [Service detail] (/services/[slug])
├── Industries (/industries)
│   └── [Industry] (/industries/[slug])
├── Partners (/partners)
├── About (/about)
├── Case Studies (/case-studies)
│   └── [Study] (/case-studies/[slug])
├── Resources (/resources)          # optional: blog, guides
│   └── [Article] (/resources/[slug])
└── Contact (/contact)
```

## Utility / Legal

| Page | URL | In footer |
|------|-----|-----------|
| Privacy Policy | /privacy | Yes |
| Terms of Use | /terms | Yes |
| Warranty & Returns | /warranty | Yes |
| Careers | /careers | Optional |
| Sitemap (HTML) | /sitemap | Optional |

## Page Inventory

| Page | URL | Template | Priority | Content doc |
|------|-----|----------|----------|-------------|
| Home | / | Home | P0 | website-content.md |
| Contact | /contact | Contact | P0 | website-content.md |
| Services hub | /services | Listing | P0 | services.md |
| About | /about | About | P1 | company-profile.md |
| Partners | /partners | Partners | P1 | technology-partners.md |

## Redirects (Launch)

| From (legacy) | To (new — draft) | Type |
|---------------|------------------|------|
| `https://synergy.net.pk/index` | `/` | 301 |
| `/about` | `/about` | 301 |
| `/contact` | `/contact` | 301 |
| `/awards` | `/about#awards` or `/awards` | 301 |
| `/career` | `/careers` | 301 |
| `/blog` | `/resources` | 301 |
| `/infrastructure-solutions` | `/services/network-infrastructure` _(confirm)_ | 301 |
| `/enterprise-applications` | `/services` | 301 |
| `/robotic-process-automation-solutions` | `/services` | 301 |
| `/data-availability-solutions` | `/services/data-backup-recovery` | 301 |
| `/security` | `/services` or security service page | 301 |
| `/privacy-policy` | `/privacy` | 301 |
| `/terms-and-conditions` | `/terms` | 301 |

Full legacy URL list: `old-website-extract.md`.

## SEO Notes

- Hub pages target broad terms; detail pages target long-tail  
- Breadcrumbs: Home → Section → Page  

## Out of Scope (V1)

- _[Customer portal login]_  
- _[Full e-commerce checkout]_  

## Sync

- Visual structure: `wireframes.md`  
- Copy per URL: `website-content.md`  
