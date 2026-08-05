# Company Profile PDF → Website Gap Analysis

**Source:** `SCL — Company Profile — 2026` (Downloads/`Company Profile.pdf`, 23 pages)  
**Audited against:** `src/app`, `src/components`, `src/lib/content`, `src/lib/cms`  
**Date:** 5 August 2026  
**Rule:** Only PDF-traceable facts should be added. Ambiguous items stay as TODO.

---

## A. Facts extracted from the PDF

### Identity & positioning
| Fact | PDF source |
|------|------------|
| Legal name Synergy Computers (Pvt.) Ltd. (SCL) | Cover / throughout |
| Tagline: “We Do IT Better” | p.1 |
| Trusted technology partner in Pakistan **since 1981** | p.2 |
| **200+** skilled professionals | p.2 |
| Offices: **Karachi, Islamabad, Lahore, Gilgit** | p.2, p.23 |
| End-to-end: enterprise hardware/software, system integration, cloud, cybersecurity, IT consultancy, professional training | p.2 |
| Sectors: Banking & Financial Services, Telecommunications, Power & Utilities, Healthcare, Education, Hospitality, large Enterprise | p.2 |
| One-window technology partner | p.7 |
| Core capabilities: IT Infrastructure; Third-Party Software; Support, Maintenance & SLAs; System Integration | p.22 |
| Expertise pillars: Infrastructure Solution; Support and Services; Enterprise Application | p.8 |

### Board of Directors (p.3)
| Name | Role |
|------|------|
| Mr. Aman Ullah Khan | Chairman |
| Mr. Iqbal Ahmed | CEO |
| Mr. Tariq Bhatti | Director |
| Mr. Innayat Ullah Khan | Director |

Divisions named: Administration, HR, Finance, Hardware Support & Integration Services, Sales & Marketing (Hardware / Software). Org chart exists (p.4) but individual manager names are not readable from text extract.

### Offices & contact (p.23)
| Location | Address / phones |
|----------|------------------|
| Karachi HQ | 56-D, K.D.A Scheme No.1, Main Miran M. Shah Road; Tel 021-34527060, 34540908, 34547068; Fax 021-34540907 |
| Islamabad | Units B & C, Block-1, Diplomatic Enclave G-5; Tel 051-2828347-9, 051-2822951; Fax 2824125 |
| Lahore | House 130-F, Model Town; Tel 042-5846575-76, 042-5856475; Fax 042-5856476 |
| Gilgit | City named only — **no street address in PDF** |
| Middle East | Synergy Computers Middle East; CWEP0328 Compass Building, Al Shohada Road, Al Hamra Industrial Zone-FZ, Ras Al Khaimah, UAE; P.O. Box 10055; www.synergy-me.ae |
| Shared | www.synergy.net.pk · info@synergy.net.pk |

### Partners with narrative copy in PDF
Infor, Automation Anywhere, Dynatrace, BMC Helix, Oracle (software + hardware), EnterpriseDB (Postgres), KnowBe4, Hexagon, Nutanix, Convene, Innovative (Virtua ILMS — **178 libraries worldwide, 6 in Pakistan under Synergy**), Hitachi Vantara, Dell Technologies, NetApp, Cohesity, Pure Storage, Proxmox, DDN, Lenovo, Red Hat, Utimaco, Fujitsu, IBM, Supermicro.

Partnerships intro (p.7) + logo pages (p.5–7) — individual client logo names **not extractable as text** (image-only).

### Explicitly NOT in the PDF (do not invent)
- Named certifications / awards list
- Numeric “enterprise clients” count (100+ / 300+ on site are **not** in PDF)
- Mission / Vision wording currently on `/about` (not printed as Mission/Vision in PDF)
- COO / CTO / Head of Sales names & bios (not in PDF board page)
- Gilgit street address
- Social media URLs (LinkedIn/Facebook already on site from other sources — keep; not from this PDF)

---

## B. Current website inventory (summary)

| Area | Primary files | Notes |
|------|---------------|--------|
| Site/contact | `src/lib/content/site.ts`, Footer, Contact | Karachi only; no branch/ME addresses |
| About copy | `src/app/(site)/about/page.tsx` | Generic 40+ years; Mission/Vision not in PDF |
| Leadership | `leadership.ts` + CMS | Amanullah Khan as **CEO** (conflicts with PDF Chairman) |
| CEO message | `ceo-message.ts` | Placeholder name “Chief Executive Officer” |
| Stats | `accomplishments.ts`, `StorySection.tsx` | **100+ vs 300+ clients inconsistency**; cert placeholders |
| Partners | `partners.ts` + CMS | 12 partners; many PDF vendors missing |
| Services | `services.ts` | 5 offerings; PDF 3 pillars + 4 core capabilities not modeled |
| Industries | `industries.ts` | SMB/Edu/Health/Retail/Gov — missing Banking, Telecom, Power |
| Clients | Admin CMS only | No public clientele section; PDF logos unreadable |
| Careers offices | `careers.ts` | Cities only |

---

## C. Gap matrix

| # | PDF content | Website status | Action |
|---|-------------|----------------|--------|
| 1 | Founded / serving since **1981** | Vague “1980s” / “40+ years” | Update milestones + About copy |
| 2 | **200+** professionals | Home only (StorySection) | Align Accomplishments stats; drop non-PDF client counts |
| 3 | Client count | 100+ / 300+ invented | Remove; replace with PDF-backed stats |
| 4 | Board of Directors | Missing | Add Board section from PDF |
| 5 | Leadership title conflict (Amanullah CEO vs Chairman) | Inconsistent | Keep ops leadership as-is; document TODO; Board uses PDF titles |
| 6 | CEO identity (Iqbal Ahmed) | Placeholder CEO message | TODO comment + use PDF name only if no conflicting media claim |
| 7 | Branch + ME addresses/phones/fax | Missing (Contact note points to PDF) | Add `offices` data; render on Contact (+ Careers) |
| 8 | Tagline “We Do IT Better” | Unused | Optional site description enrichment |
| 9 | Expertise pillars (3) + core capabilities (4) | Partial via 5 services | Add About expertise section from PDF |
| 10 | Industries Banking / Telecom / Power & Utilities | Missing as industry cards | Add industries from PDF wording |
| 11 | Partners BMC Helix, EDB, KnowBe4, Hexagon, Nutanix, Cohesity, Pure, Proxmox, Lenovo, Red Hat, Fujitsu, IBM, Supermicro | Missing | Add local partner entries (PDF copy); SVG wordmark placeholders until brand assets exist |
| 12 | Innovative Virtua 178 / 6 Pakistan | Wrong/outdated Innovative blurb | Correct from PDF |
| 13 | Enrich Infor, Dynatrace, AA, Oracle, etc. | Partial | Align overviews to PDF where thinner |
| 14 | Selected Clientele logos | No public page; PDF image-only | **TODO** — do not invent names |
| 15 | Certifications / awards | Fake placeholders | Remove placeholders; show empty TODO state |
| 16 | Professional training / cybersecurity / consultancy as services | Mentioned in About PDF; not first-class services | Reflect in About expertise copy only (no invented service pages) |
| 17 | Mission / Vision | Present but not in PDF | Leave unchanged; note in TODO |
| 18 | Firestore rules / new collections | N/A if local TS only | No new collections → no rules change |

---

## D. Implementation order (this work)

1. About (copy, expertise, board, stats/milestones/certs cleanup)  
2. Contact / Footer / offices data  
3. Industries  
4. Partners (+ Innovative Virtua correction)  
5. Home Story stats alignment  
6. Docs (`PROJECT-STATUS.md`) + lint/build  

No new secrets, API routes, or Firestore collections required for this pass.
