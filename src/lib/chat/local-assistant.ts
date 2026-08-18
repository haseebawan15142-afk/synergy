import {
  accomplishmentStats,
  milestones,
} from "@/lib/content/accomplishments";
import { caseStudies } from "@/lib/content/case-studies";
import { ceoMessage } from "@/lib/content/ceo-message";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { problemCards } from "@/lib/content/problems";
import { industries } from "@/lib/content/industries";
import { partners } from "@/lib/content/partners";
import { services } from "@/lib/content/services";
import { siteConfig } from "@/lib/content/site";
import { boardOfDirectors, companyProfileMeta, officeLocationsDetailed } from "@/lib/content/company-profile";

export type LocalReply = {
  reply: string;
  /** true when we matched company/services/partners (not the generic fallback). */
  matched: boolean;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((t) => text.includes(t));
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 2);
}

function scoreOverlap(query: string, corpus: string): number {
  const qTokens = new Set(tokenize(query));
  const cTokens = tokenize(corpus);
  if (!qTokens.size || !cTokens.length) return 0;
  let hits = 0;
  for (const t of cTokens) {
    if (qTokens.has(t)) hits += 1;
  }
  return hits;
}

const FALLBACK_REPLY = `I'm Synergy Assistant for ${siteConfig.legalName}. I answer questions about our IT services, technology partners, industries, and how to contact us in Pakistan.

Try asking:
• "What IT services do you offer?"
• "Do you provide backup and cloud support?"
• "How can I contact your Karachi office?"

Email: ${siteConfig.email} | Phone: ${siteConfig.phones[0]} | /contact`;

/** Works without an API key — answers from Synergy site content only. */
export function replyFromLocalKnowledge(userMessage: string): LocalReply {
  const q = normalize(userMessage);
  if (!q) return { reply: FALLBACK_REPLY, matched: false };

  if (includesAny(q, ["hello", "hi", "hey", "salam", "assalam", "good morning", "good evening"])) {
    return {
      matched: true,
      reply: `Hello! I'm Synergy Assistant for ${siteConfig.legalName} — Pakistan's enterprise IT partner for 40+ years.\n\nI can help with:\n• Our services (infrastructure, backup, cloud, managed IT, on-site support)\n• Technology partners (Veritas, Dell, Dynatrace, and more)\n• Industries we serve\n• Contact & quotes\n\nWhat would you like to know?`,
    };
  }

  if (
    includesAny(q, ["who are you", "what are you", "your name", "synergy assistant", "this bot"])
  ) {
    return {
      matched: true,
      reply: `I'm Synergy Assistant — the official helper for ${siteConfig.legalName}. I answer questions about Synergy's services, partners, industries, and contact details using information from this website. For project quotes, our team at ${siteConfig.email} can help.`,
    };
  }

  if (
    includesAny(q, ["synergy", "synergy computer", "your company", "this company", "about synergy"])
  ) {
    return {
      matched: true,
      reply: `${siteConfig.legalName} has been a trusted technology partner in Pakistan since ${companyProfileMeta.foundedYear}, with ${companyProfileMeta.teamSizeLabel} professionals.\n\nWe deliver:\n• Infrastructure solutions\n• Enterprise applications\n• Support, maintenance & SLAs\n• System integration\n\nOffices: Karachi (HQ), Islamabad, Lahore, Gilgit, plus Middle East (Ras Al Khaimah).\n\nLearn more: /about | Services: /services`,
    };
  }

  if (
    includesAny(q, [
      "technology",
      "technologies",
      "vendor",
      "vendors",
      "partner",
      "partners",
      "stack",
      "which tool",
      "what tool",
      "software",
      "platform",
      "principal",
    ]) ||
    (q.includes("use") && includesAny(q, ["they", "synergy", "you", "which", "what"]))
  ) {
    const names = partners.map((p) => `• ${p.name}`).join("\n");
    return {
      matched: true,
      reply: `Synergy partners with leading global technology principals:\n\n${names}\n\nWe integrate these with implementation, support, and maintenance across Pakistan. Details: /partners`,
    };
  }

  for (const partner of partners) {
    const name = partner.name.toLowerCase();
    if (q.includes(name) || q.includes(name.split(" ")[0] ?? "")) {
      return {
        matched: true,
        reply: `Yes — ${siteConfig.name} works with ${partner.name} as a technology partner.\n\nWe provide implementation, integration, and support aligned to your environment in Pakistan. See /partners or email ${siteConfig.email} for a scoped discussion.`,
      };
    }
  }

  if (
    includesAny(q, [
      "service",
      "services",
      "offer",
      "provide",
      "do you do",
      "what do you",
      "it service",
      "it services",
      "it support",
      "it solution",
      "it solutions",
      "what can you",
      "capabilities",
    ])
  ) {
    const lines = services.map((s) => `• ${s.title} — ${s.summary}`);
    return {
      matched: true,
      reply: `${siteConfig.name} offers these IT services:\n\n${lines.join("\n")}\n\nFull list: /services — tell me which area you need (e.g. backup, cloud, managed IT).`,
    };
  }

  for (const service of services) {
    const keys = [
      service.slug.replace(/-/g, " "),
      service.title.toLowerCase(),
      ...service.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      ...service.summary.toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 6),
    ];
    if (includesAny(q, keys)) {
      return {
        matched: true,
        reply: `${service.title}\n\n${service.summary}\n\nSynergy delivers this with vendor-aligned solutions and nationwide support. Details: /services/${service.slug}\n\nRequest a quote: /contact or ${siteConfig.email}`,
      };
    }
  }

  for (const card of problemCards) {
    const blob = `${card.label} ${card.problem} ${card.solution}`.toLowerCase();
    if (scoreOverlap(q, blob) >= 2 || q.includes(card.label.toLowerCase())) {
      return {
        matched: true,
        reply: `${card.label}\n\nChallenge: ${card.problem}\n\nHow Synergy helps: ${card.solution}\n\nRelated service: /services/${card.serviceSlug}`,
      };
    }
  }

  if (includesAny(q, ["industry", "industries", "sector", "sectors"])) {
    const lines = industries.map((i) => `• ${i.title} — ${i.summary}`);
    return {
      matched: true,
      reply: `Synergy serves these sectors in Pakistan:\n\n${lines.join("\n")}\n\nDetails: /industries`,
    };
  }

  for (const industry of industries) {
    const keys = [
      industry.slug.replace(/-/g, " "),
      industry.title.toLowerCase(),
      ...industry.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
    ];
    if (includesAny(q, keys)) {
      return {
        matched: true,
        reply: `${industry.title}\n\n${industry.summary}\n\nSynergy provides IT infrastructure, security, and support tailored to this sector. More: /industries/${industry.slug}`,
      };
    }
  }

  if (includesAny(q, ["bank", "banking", "finance", "financial"])) {
    return {
      matched: true,
      reply: `Synergy supports banking and financial institutions with secure, available infrastructure, data protection, and managed operations — backed by 40+ years serving enterprise clients in Pakistan. Contact ${siteConfig.email} to discuss your environment.`,
    };
  }

  if (includesAny(q, ["health", "healthcare", "hospital", "medical", "clinic"])) {
    return {
      matched: true,
      reply: `Our healthcare sector work focuses on secure, reliable systems for care delivery. Synergy provides infrastructure, backup, and support scoped to your compliance needs. See /industries/healthcare or contact ${siteConfig.email}.`,
    };
  }

  if (includesAny(q, ["education", "school", "university", "college", "lab"])) {
    return {
      matched: true,
      reply: `Synergy supports education institutions with device lifecycle, labs, networking, and reliable IT support. See /industries/education or /contact for assistance.`,
    };
  }

  if (
    includesAny(q, [
      "contact",
      "phone",
      "email",
      "call",
      "address",
      "office",
      "karachi",
      "lahore",
      "islamabad",
      "gilgit",
      "branch",
      "branches",
      "reach",
      "quote",
      "pricing",
      "price",
      "cost",
      "proposal",
    ])
  ) {
    return {
      matched: true,
      reply: `Contact ${siteConfig.name}\n\n• Email: ${siteConfig.email}\n• Phone: ${siteConfig.phones.join(", ")}\n• Fax: ${siteConfig.fax}\n• Head office: ${siteConfig.address.line}, ${siteConfig.address.city}, ${siteConfig.address.country}\n\nNationwide offices: ${officeLocationsDetailed
        .filter((o) => o.country === "Pakistan")
        .map((o) => o.city)
        .join(", ")}.\nMiddle East: Ras Al Khaimah (synergy-me.ae).\n\nBoard (Company Profile 2026): ${boardOfDirectors
        .map((m) => `${m.name} (${m.title})`)
        .join("; ")}.\n\nOnline form: /contact`,
    };
  }

  if (
    includesAny(q, [
      "leadership",
      "leader",
      "leaders",
      "board",
      "director",
      "directors",
      "chairman",
      "ceo",
      "management",
      "executive",
      "executives",
      "who is the ceo",
      "who leads",
    ]) ||
    boardOfDirectors.some((m) => q.includes(m.name.toLowerCase().replace(/^mr\.\s*/i, "")))
  ) {
    return {
      matched: true,
      reply: `Board of Directors at ${siteConfig.legalName} (Company Profile 2026):\n\n${boardOfDirectors
        .map((m) => `• ${m.name} — ${m.title}`)
        .join("\n")}\n\nMore: /about#board`,
    };
  }

  if (includesAny(q, ["ceo message", "message from", "vision", "mission", "quote"])) {
    return {
      matched: true,
      reply: `Message from our ${ceoMessage.role} (${ceoMessage.name}):\n\n"${ceoMessage.quote}"\n\n${ceoMessage.body.join("\n\n")}\n\nWatch / read more: /about`,
    };
  }

  if (
    includesAny(q, [
      "accomplishment",
      "accomplishments",
      "milestone",
      "milestones",
      "certification",
      "certifications",
      "track record",
      "achievement",
    ])
  ) {
    const stats = accomplishmentStats.map((s) => `• ${s.value} ${s.label}`).join("\n");
    const ms = milestones.map((m) => `• ${m.year}: ${m.title} — ${m.description}`).join("\n");
    return {
      matched: true,
      reply: `Synergy accomplishments:\n\n${stats}\n\nKey milestones:\n${ms}\n\nMore: /about#accomplishments`,
    };
  }

  if (includesAny(q, ["case study", "case studies", "client success", "success stor"])) {
    const lines = caseStudies.map((c) => `• ${c.client}: ${c.headline}`);
    return {
      matched: true,
      reply: `Selected client outcomes:\n\n${lines.join("\n")}\n\nDetails on the homepage Client Success section, or ask about a specific industry.`,
    };
  }

  if (includesAny(q, ["dynatrace", "observability", "exclusive partner"])) {
    return {
      matched: true,
      reply: `${dynatracePartner.headline}\n\n${dynatracePartner.subheadline}\n\n${dynatracePartner.description}\n\nMore: /partners`,
    };
  }

  if (includesAny(q, ["about", "who are", "history", "years", "experience", "founded", "legacy"])) {
    return {
      matched: true,
      reply: `${siteConfig.legalName} has served Pakistan for over 40 years as an enterprise IT solutions provider — hardware, applications, integration, and 24×7 maintenance.\n\nBoard: /about#board\nAccomplishments: /about#accomplishments\nServices: /services`,
    };
  }

  const topicReplies: { terms: string[]; reply: string }[] = [
    {
      terms: ["backup", "recovery", "data availability", "veritas", "cohesity", "restore", "ransomware"],
      reply: `Synergy provides data backup & recovery and data availability solutions with partners such as Veritas and enterprise storage vendors.\n\nService: /services/data-backup-recovery\nContact: ${siteConfig.email}`,
    },
    {
      terms: ["cloud", "microsoft", "365", "m365", "azure", "office 365", "teams", "sharepoint"],
      reply: `Synergy helps with Microsoft 365 & cloud — migration, collaboration, security baselines, and governance.\n\nService: /services/microsoft-365-cloud\nContact: /contact`,
    },
    {
      terms: ["managed", "maintenance", "24", "sla", "monitoring", "noc", "outsourc"],
      reply: `Managed IT & maintenance — SLA-backed 24×7 support across your infrastructure.\n\nService: /services/managed-it\nPhone: ${siteConfig.phones[0]}`,
    },
    {
      terms: ["on site", "onsite", "on-site", "engineer", "field", "dispatch"],
      reply: `On-site IT support — Synergy engineers at your location for deployment, troubleshooting, and project delivery.\n\nService: /services/on-site-it-support\nBranches nationwide.`,
    },
    {
      terms: ["network", "infrastructure", "wifi", "lan", "wan", "switch", "router", "data center", "datacenter"],
      reply: `Network & infrastructure — design, modernization, and management from strategy through deployment.\n\nService: /services/network-infrastructure\nContact: ${siteConfig.email}`,
    },
    {
      terms: ["security", "utimaco", "firewall", "cyber", "encryption", "hsm"],
      reply: `Security is core to Synergy's portfolio (partners include Utimaco and enterprise security vendors).\n\nStart at /services or /contact for a security review.`,
    },
    {
      terms: ["dynatrace", "observability", "monitor", "apm", "performance"],
      reply: `Synergy works with Dynatrace and observability practices for application performance in Pakistan.\n\nSee /partners and /resources, or /contact for implementation.`,
    },
    {
      terms: ["rpa", "automation anywhere", "robotic", "automation"],
      reply: `Synergy supports robotic process automation through partners such as Automation Anywhere.\n\nBrowse /resources or /contact for a discovery call.`,
    },
    {
      terms: ["oracle", "database", "erp"],
      reply: `Synergy is an Oracle partner — we support enterprise applications and infrastructure aligned to Oracle environments. See /partners or contact ${siteConfig.email}.`,
    },
    {
      terms: ["dell", "server", "storage", "netapp", "hitachi", "ddn"],
      reply: `Synergy supplies and supports enterprise hardware and storage with partners including Dell Technologies, NetApp, Hitachi Vantara, and DDN. See /partners or /contact.`,
    },
    {
      terms: ["blog", "resource", "article", "news", "insight"],
      reply: `Synergy's Resources section has 140+ articles on infrastructure, storage, observability, and managed IT in Pakistan: /resources`,
    },
    {
      terms: ["pakistan", "karachi", "local", "in pakistan"],
      reply: `${siteConfig.legalName} is headquartered in Karachi with branches across Pakistan. We deliver nationwide IT services, support, and integration for enterprise clients. Contact: ${siteConfig.email}`,
    },
  ];

  for (const topic of topicReplies) {
    if (includesAny(q, topic.terms)) {
      return { matched: true, reply: topic.reply };
    }
  }

  // Best-effort match: pick highest-scoring service or industry
  let best: { score: number; reply: string } | null = null;
  for (const service of services) {
    const score = scoreOverlap(q, `${service.title} ${service.summary}`);
    if (score >= 2 && (!best || score > best.score)) {
      best = {
        score,
        reply: `Based on your question, you may be interested in:\n\n${service.title}\n${service.summary}\n\nDetails: /services/${service.slug}\nContact: ${siteConfig.email}`,
      };
    }
  }

  if (best) return { matched: true, reply: best.reply };

  // Off-topic — still redirect to company scope
  if (
    includesAny(q, [
      "weather",
      "football",
      "cricket score",
      "recipe",
      "joke",
      "bitcoin",
      "stock",
      "movie",
      "who is president",
      "write code",
      "homework",
    ])
  ) {
    return {
      matched: true,
      reply: `I'm focused on ${siteConfig.name} — our IT services, partners, and contact details in Pakistan. I can't help with that topic, but I can explain what services we offer or how to reach our team.\n\nTry: "What services does Synergy provide?" or /contact`,
    };
  }

  return { reply: FALLBACK_REPLY, matched: false };
}

/** Snippets for LLM context based on the user's latest message. */
export function buildLocalContextForQuery(userMessage: string): string {
  const local = replyFromLocalKnowledge(userMessage);
  if (local.matched) {
    return `Relevant Synergy knowledge for this question:\n${local.reply}`;
  }

  const serviceLines = services.map((s) => `- ${s.title}: ${s.summary}`).join("\n");
  return `General Synergy services:\n${serviceLines}`;
}
