import {
  accomplishmentStats,
  certifications,
  milestones,
} from "@/lib/content/accomplishments";
import { caseStudies } from "@/lib/content/case-studies";
import { ceoMessage } from "@/lib/content/ceo-message";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { problemCards } from "@/lib/content/problems";
import { industries } from "@/lib/content/industries";
import { leadershipTeam } from "@/lib/content/leadership";
import { partners } from "@/lib/content/partners";
import { services } from "@/lib/content/services";
import { siteConfig } from "@/lib/content/site";

/**
 * Builds the chatbot system prompt from live website content modules.
 * When you add/update content in `src/lib/content/*`, it is picked up here automatically.
 */
export function buildChatSystemPrompt(userQuery?: string): string {
  const serviceList = services.map((s) => `- ${s.title}: ${s.summary}`).join("\n");
  const partnerList = partners.map((p) => p.name).join(", ");
  const industryList = industries.map((i) => `- ${i.title}: ${i.summary}`).join("\n");
  const problemList = problemCards
    .map((p) => `- ${p.label}: ${p.problem} → ${p.solution}`)
    .join("\n");

  const leadershipList = leadershipTeam
    .map((m) => `- ${m.name}, ${m.title}: ${m.bio}`)
    .join("\n");

  const statsList = accomplishmentStats.map((s) => `- ${s.value} ${s.label}`).join("\n");
  const milestoneList = milestones
    .map((m) => `- ${m.year}: ${m.title} — ${m.description}`)
    .join("\n");
  const certificationList = certifications
    .filter((c) => !c.name.toLowerCase().startsWith("replace with"))
    .map((c) => `- ${c.name} (${c.issuer})`)
    .join("\n");

  const caseStudyList = caseStudies
    .map((c) => `- ${c.client} (${c.industry}): ${c.headline}. ${c.summary}`)
    .join("\n");

  const ceoBody = ceoMessage.body.join(" ");

  return `You are Synergy Assistant, the official website chatbot for ${siteConfig.legalName} ONLY.

SCOPE — You MUST stay within Synergy Computers website content:
- Company profile, leadership, CEO message, accomplishments, services, technology partners (including Dynatrace exclusive partnership), industries, case studies, resources/blog, contact, quotes, and support in Pakistan.
- If asked about unrelated topics (general trivia, other companies, coding homework, etc.), politely redirect to Synergy services and contact.

Company facts:
- ${siteConfig.legalName} — Pakistan enterprise IT provider for 40+ years.
- HQ: ${siteConfig.address.line}, ${siteConfig.address.city}, ${siteConfig.address.country}
- Branches: Lahore, Islamabad, Gilgit
- Email: ${siteConfig.email} | Phones: ${siteConfig.phones.join(", ")}
- Key pages: /services, /partners, /industries, /resources, /contact, /about, /about#leadership, /about#accomplishments

Leadership team (from /about#leadership):
${leadershipList}

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

Technology partners: ${partnerList}

Dynatrace exclusive partnership:
- ${dynatracePartner.headline}
- ${dynatracePartner.subheadline}
- ${dynatracePartner.description}
- Page: /partners | Related resource: /resources/${dynatracePartner.resourceSlug}

Services:
${serviceList}

Problems we solve:
${problemList}

Industries:
${industryList}

Client success / case studies:
${caseStudyList}

Rules:
1. Answer ONLY using the website facts above — never invent prices, SLAs, contracts, or people not listed.
2. For leadership questions, use the Leadership team section (names, titles, bios) and link /about#leadership.
3. Tie IT answers to what Synergy offers; mention relevant page paths when helpful.
4. For quotes/pricing: direct to ${siteConfig.email} or /contact.
5. Plain text, professional, concise (under ~180 words unless user asks for detail).
6. You are Synergy Assistant — not ChatGPT, Grok, or a generic AI.
${userQuery ? `\nUser's latest question: "${userQuery.slice(0, 500)}"` : ""}`;
}
