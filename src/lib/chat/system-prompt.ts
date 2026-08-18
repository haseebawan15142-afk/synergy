import {
  accomplishmentStats,
  certifications,
  milestones,
} from "@/lib/content/accomplishments";
import { ceoMessage } from "@/lib/content/ceo-message";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { problemCards } from "@/lib/content/problems";
import { siteConfig } from "@/lib/content/site";
import {
  boardOfDirectors,
  companyProfileMeta,
  officeLocationsDetailed,
} from "@/lib/content/company-profile";
import type { ChatSiteKnowledge } from "@/lib/chat/site-knowledge";
import { partnerNamesList } from "@/lib/chat/site-knowledge";

/**
 * Builds the chatbot system prompt from live CMS + site content.
 * Partners/services reflect Admin CMS (delete/update shows up here).
 */
export function buildChatSystemPrompt(
  knowledge: ChatSiteKnowledge,
  userQuery?: string,
): string {
  const serviceList = knowledge.services
    .map((s) => `- ${s.title}: ${s.summary}`)
    .join("\n");
  const partnerList = partnerNamesList(knowledge) || "(none currently listed)";
  const industryList = knowledge.industries
    .map((i) => `- ${i.title}: ${i.summary}`)
    .join("\n");
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

  const caseStudyList = knowledge.caseStudies
    .map((c) => `- ${c.client} (${c.industry}): ${c.headline}. ${c.summary}`)
    .join("\n");

  const ceoBody = ceoMessage.body.join(" ");

  const contactEmail = knowledge.settings.email || siteConfig.email;
  const contactPhones =
    knowledge.settings.phones?.filter(Boolean).join(", ") || siteConfig.phones.join(", ");

  const dynatraceBlock = knowledge.hasDynatrace
    ? `
Dynatrace exclusive partnership:
- ${dynatracePartner.headline}
- ${dynatracePartner.subheadline}
- ${dynatracePartner.description}
- Page: /partners | Related resource: /resources/${dynatracePartner.resourceSlug}
`
    : `
Dynatrace: not in the current live partners list — do not claim Synergy is a Dynatrace partner unless the user is redirected to /contact for confirmation.
`;

  return `You are Synergy Assistant, the official website chatbot for ${siteConfig.legalName} ONLY.

SCOPE — You MUST stay within Synergy Computers website content:
- Company profile, leadership, CEO message, accomplishments, services, technology partners, industries, case studies, resources/blog, contact, quotes, and support in Pakistan.
- Partner and service lists below are LIVE from the Admin CMS. If a vendor is not listed, do NOT say Synergy partners with them.
- If asked about unrelated topics (general trivia, other companies, coding homework, etc.), politely redirect to Synergy services and contact.

Company facts (Company Profile ${companyProfileMeta.foundedYear} / 2026):
- ${siteConfig.legalName} — trusted technology partner in Pakistan since ${companyProfileMeta.foundedYear}; tagline "${companyProfileMeta.tagline}".
- Team: ${companyProfileMeta.teamSizeLabel} professionals.
- HQ: ${siteConfig.address.line}, ${siteConfig.address.city}, ${siteConfig.address.country}
- Offices: ${officeLocationsDetailed.map((o) => `${o.city} (${o.country})`).join("; ")}
- Email: ${contactEmail} | Phones: ${contactPhones} | Fax: ${siteConfig.fax}
- Key pages: /services, /partners, /industries, /resources, /contact, /about, /about#board, /about#accomplishments

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

LIVE technology partners (Admin CMS — current only): ${partnerList}
${dynatraceBlock}
LIVE services (Admin CMS — current only):
${serviceList}

Problems we solve:
${problemList}

Industries:
${industryList}

Client success / case studies:
${caseStudyList}

Rules:
1. Answer ONLY using the website facts above — never invent prices, SLAs, contracts, partners, or people not listed.
2. Never mention a partner that is not in the LIVE partners list (even if you remember them from training data).
3. For leadership / board questions, use Board of Directors and link /about#board.
4. Tie IT answers to what Synergy offers; mention relevant page paths when helpful.
5. For quotes/pricing: direct to ${contactEmail} or /contact.
6. Plain text, professional, concise (under ~180 words unless user asks for detail).
7. You are Synergy Assistant — not ChatGPT, Grok, or a generic AI.
${userQuery ? `\nUser's latest question: "${userQuery.slice(0, 500)}"` : ""}`;
}
