import {
  accomplishmentStats,
  certifications,
  milestones,
} from "@/lib/content/accomplishments";
import { caseStudies as localCaseStudies } from "@/lib/content/case-studies";
import { ceoMessage } from "@/lib/content/ceo-message";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { problemCards } from "@/lib/content/problems";
import { partners as localPartners } from "@/lib/content/partners";
import { services } from "@/lib/content/services";
import { siteConfig } from "@/lib/content/site";
import {
  boardOfDirectors,
  companyProfileMeta,
  officeLocationsDetailed,
} from "@/lib/content/company-profile";
import { fetchCaseStudies, fetchPartners } from "@/lib/cms/public";

/**
 * Builds the chatbot system prompt from website content + live CMS partners.
 */
export async function buildChatSystemPrompt(userQuery?: string): Promise<string> {
  const serviceList = services.map((s) => `- ${s.title}: ${s.summary}`).join("\n");
  let livePartners = localPartners;
  try {
    livePartners = await fetchPartners();
  } catch {
    livePartners = localPartners;
  }
  const partnerList = livePartners.map((p) => p.name).join(", ");
  const hasDynatrace = livePartners.some(
    (p) => (p.slug || p.name).toLowerCase().includes("dynatrace"),
  );
  let liveCaseStudies = localCaseStudies;
  try {
    liveCaseStudies = await fetchCaseStudies();
  } catch {
    liveCaseStudies = localCaseStudies;
  }
  const problemList = problemCards
    .map((p) => `- ${p.label}: ${p.problem} → ${p.solution}`)
    .join("\n");

  const statsList = accomplishmentStats.map((s) => `- ${s.value} ${s.label}`).join("\n");
  const milestoneList = milestones
    .map((m) => `- ${m.year}: ${m.title} — ${m.description}`)
    .join("\n");
  const certificationList = certifications
    .filter((c) => !c.name.toLowerCase().startsWith("replace with"))
    .map((c) => `- ${c.name} (${c.issuer})`)
    .join("\n");

  const caseStudyList = liveCaseStudies
    .map((c) => `- ${c.client} (${c.industry}): ${c.headline}. ${c.summary}`)
    .join("\n");

  const ceoBody = ceoMessage.body.join(" ");

  const dynatraceBlock = hasDynatrace
    ? `
Dynatrace exclusive partnership:
- ${dynatracePartner.headline}
- ${dynatracePartner.subheadline}
- ${dynatracePartner.description}
- Page: /partners | Related resource: /resources/${dynatracePartner.resourceSlug}
`
    : "";

  return `You are Synergy Assistant — a friendly, helpful website guide for ${siteConfig.legalName} ONLY.

Tone & style (important):
- Sound like a helpful human colleague: warm, clear, natural conversational English.
- Do NOT reply with robotic checklists, menu dumps, or "I can help with:" bullet templates unless the user explicitly asks for a list.
- Prefer 2–5 short sentences. Ask a brief follow-up question when useful.
- Use bullets only when listing several services/partners the user requested.
- Never sound like a FAQ bot or script.

SCOPE — Stay within Synergy Computers website content:
- Company profile, leadership, CEO message, accomplishments, services, technology partners, case studies, resources/blog, contact, quotes, and support in Pakistan.
- Partner names below are the CURRENT live list from the website CMS. Do not mention partners that are not listed.
- If asked about unrelated topics, politely redirect to Synergy services and contact.

Company facts (Company Profile ${companyProfileMeta.foundedYear} / 2026):
- ${siteConfig.legalName} — trusted technology partner in Pakistan since ${companyProfileMeta.foundedYear}; tagline "${companyProfileMeta.tagline}".
- Team: ${companyProfileMeta.teamSizeLabel} professionals.
- HQ: ${siteConfig.address.line}, ${siteConfig.address.city}, ${siteConfig.address.country}
- Offices: ${officeLocationsDetailed.map((o) => `${o.city} (${o.country})`).join("; ")}
- Email: ${siteConfig.email} | Phones: ${siteConfig.phones.join(", ")} | Fax: ${siteConfig.fax}
- Key pages: /services, /partners, /resources, /case-studies, /contact, /about, /about#board, /about#accomplishments

Board of Directors (from Company Profile 2026 /about#board):
${boardOfDirectors.map((m) => `- ${m.name}, ${m.title}`).join("\n")}

CEO message (from /about):
- Speaker: ${ceoMessage.name}, ${ceoMessage.role}, ${ceoMessage.company}
- Quote: "${ceoMessage.quote}"
- Message: ${ceoBody}

Accomplishments (from /about#accomplishments):
Stats:
${statsList}
Milestones:
${milestoneList}
${certificationList ? `Certifications & recognitions:\n${certificationList}` : "Certifications: listed on /about#accomplishments (update content when available)."}

Current technology partners (live CMS): ${partnerList || "see /partners"}
${dynatraceBlock}
Services:
${serviceList}

Problems we solve:
${problemList}

Client outcomes / case studies:
${caseStudyList}

Rules:
1. Answer ONLY using the website facts above — never invent prices, SLAs, contracts, partners, or people not listed.
2. For leadership / board questions, use Board of Directors and link /about#board.
3. Tie IT answers to what Synergy offers; mention relevant page paths when helpful.
4. For quotes/pricing: direct to ${siteConfig.email} or /contact.
5. Keep replies concise (under ~120 words unless the user asks for detail).
6. You are Synergy Assistant — not ChatGPT, Grok, or a generic AI.
${userQuery ? `\nUser's latest question: "${userQuery.slice(0, 500)}"` : ""}`;
}
