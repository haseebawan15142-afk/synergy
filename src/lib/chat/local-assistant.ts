import {
  accomplishmentStats,
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
import { findPartnerInQuery } from "@/lib/chat/site-knowledge";

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

function fallbackReply(knowledge: ChatSiteKnowledge): string {
  const email = knowledge.settings.email || siteConfig.email;
  const phone = knowledge.settings.phones?.[0] || siteConfig.phones[0];
  return `I'm Synergy Assistant for ${siteConfig.legalName}. I answer questions about our IT services, technology partners, industries, and how to contact us in Pakistan.

Try asking:
• "What IT services do you offer?"
• "Do you provide backup and cloud support?"
• "How can I contact your Karachi office?"

Email: ${email} | Phone: ${phone} | /contact`;
}

function samplePartnerNames(knowledge: ChatSiteKnowledge, max = 3): string {
  const names = knowledge.partners.slice(0, max).map((p) => p.name);
  if (!names.length) return "our technology principals";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and more`;
}

function hasPartnerNamed(knowledge: ChatSiteKnowledge, name: string): boolean {
  const needle = name.toLowerCase();
  return knowledge.partners.some(
    (p) =>
      p.name.toLowerCase() === needle ||
      (p.slug || "").toLowerCase() === needle ||
      p.name.toLowerCase().includes(needle),
  );
}

/** Works without an API key — answers from live CMS + site content only. */
export function replyFromLocalKnowledge(
  userMessage: string,
  knowledge: ChatSiteKnowledge,
): LocalReply {
  const q = normalize(userMessage);
  if (!q) return { reply: fallbackReply(knowledge), matched: false };

  const { partners, services, industries, caseStudies, settings } = knowledge;
  const email = settings.email || siteConfig.email;
  const phones = settings.phones?.filter(Boolean).length
    ? settings.phones.filter(Boolean)
    : siteConfig.phones;

  if (includesAny(q, ["hello", "hi", "hey", "salam", "assalam", "good morning", "good evening"])) {
    return {
      matched: true,
      reply: `Hello! I'm Synergy Assistant for ${siteConfig.legalName} — Pakistan's enterprise IT partner for 40+ years.\n\nI can help with:\n• Our services (infrastructure, backup, cloud, managed IT, on-site support)\n• Technology partners (${samplePartnerNames(knowledge)})\n• Industries we serve\n• Contact & quotes\n\nWhat would you like to know?`,
    };
  }

  if (
    includesAny(q, ["who are you", "what are you", "your name", "synergy assistant", "this bot"])
  ) {
    return {
      matched: true,
      reply: `I'm Synergy Assistant — the official helper for ${siteConfig.legalName}. I answer questions about Synergy's services, partners, industries, and contact details using live information from this website. For project quotes, our team at ${email} can help.`,
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

  // Named partner first (live CMS) — before generic "partners" keyword matches.
  const matchedPartner = findPartnerInQuery(knowledge, q);
  if (matchedPartner) {
    const blurb =
      matchedPartner.shortDescription ||
      `We provide implementation, integration, and support aligned to your environment in Pakistan.`;
    const path = matchedPartner.slug
      ? `/partners/${matchedPartner.slug}`
      : "/partners";
    return {
      matched: true,
      reply: `Yes — ${siteConfig.name} works with ${matchedPartner.name} as a technology partner.\n\n${blurb}\n\nSee ${path} or email ${email} for a scoped discussion.`,
    };
  }

  // Known vendors that are NOT in the live CMS list → do not claim partnership
  const knownMissing = [
    "veritas",
    "cohesity",
    "dynatrace",
    "oracle",
    "utimaco",
    "dell",
    "netapp",
    "hitachi",
    "automation anywhere",
    "nutanix",
    "ibm",
    "cisco",
    "lenovo",
    "fujitsu",
    "arctera",
    "pure storage",
    "red hat",
  ];
  for (const name of knownMissing) {
    if (q.includes(name) && !hasPartnerNamed(knowledge, name)) {
      const label = name.replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        matched: true,
        reply: `I don't see ${label} in our current live partners list on the website.\n\nCurrent principals: ${partners.map((p) => p.name).join(", ") || "see /partners"}.\n\nFor the latest partnership status, contact ${email} or browse /partners.`,
      };
    }
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
    if (!partners.length) {
      return {
        matched: true,
        reply: `I don't have an active partners list right now. Browse /partners or email ${email} and our team can share current technology principals.`,
      };
    }
    const names = partners.map((p) => `• ${p.name}`).join("\n");
    return {
      matched: true,
      reply: `Synergy partners with leading global technology principals:\n\n${names}\n\nWe integrate these with implementation, support, and maintenance across Pakistan. Details: /partners`,
    };
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
      ...service.summary
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .slice(0, 6),
    ];
    if (includesAny(q, keys)) {
      return {
        matched: true,
        reply: `${service.title}\n\n${service.summary}\n\nSynergy delivers this with vendor-aligned solutions and nationwide support. Details: /services/${service.slug}\n\nRequest a quote: /contact or ${email}`,
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
      reply: `Synergy supports banking and financial institutions with secure, available infrastructure, data protection, and managed operations — backed by 40+ years serving enterprise clients in Pakistan. Contact ${email} to discuss your environment.`,
    };
  }

  if (includesAny(q, ["health", "healthcare", "hospital", "medical", "clinic"])) {
    return {
      matched: true,
      reply: `Our healthcare sector work focuses on secure, reliable systems for care delivery. Synergy provides infrastructure, backup, and support scoped to your compliance needs. See /industries/healthcare or contact ${email}.`,
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
      reply: `Contact ${siteConfig.name}\n\n• Email: ${email}\n• Phone: ${phones.join(", ")}\n• Fax: ${siteConfig.fax}\n• Head office: ${siteConfig.address.line}, ${siteConfig.address.city}, ${siteConfig.address.country}\n\nNationwide offices: ${officeLocationsDetailed
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

  if (includesAny(q, ["dynatrace", "observability", "exclusive partner"]) && knowledge.hasDynatrace) {
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

  const backupPartners = ["veritas", "cohesity", "arctera"].filter((n) =>
    hasPartnerNamed(knowledge, n),
  );
  const securityPartners = ["utimaco", "knowbe4"].filter((n) => hasPartnerNamed(knowledge, n));
  const storagePartners = ["dell", "netapp", "hitachi", "ddn", "pure"].filter((n) =>
    hasPartnerNamed(knowledge, n),
  );

  const topicReplies: { terms: string[]; reply: string }[] = [
    {
      terms: ["backup", "recovery", "data availability", "veritas", "cohesity", "restore", "ransomware"],
      reply: `Synergy provides data backup & recovery and data availability solutions${
        backupPartners.length
          ? ` with partners such as ${backupPartners.map((n) => n.replace(/\b\w/g, (c) => c.toUpperCase())).join(" and ")}`
          : ""
      }.\n\nService: /services/data-backup-recovery\nContact: ${email}`,
    },
    {
      terms: ["cloud", "microsoft", "365", "m365", "azure", "office 365", "teams", "sharepoint"],
      reply: `Synergy helps with Microsoft 365 & cloud — migration, collaboration, security baselines, and governance.\n\nService: /services/microsoft-365-cloud\nContact: /contact`,
    },
    {
      terms: ["managed", "maintenance", "24", "sla", "monitoring", "noc", "outsourc"],
      reply: `Managed IT & maintenance — SLA-backed 24×7 support across your infrastructure.\n\nService: /services/managed-it\nPhone: ${phones[0]}`,
    },
    {
      terms: ["on site", "onsite", "on-site", "engineer", "field", "dispatch"],
      reply: `On-site IT support — Synergy engineers at your location for deployment, troubleshooting, and project delivery.\n\nService: /services/on-site-it-support\nBranches nationwide.`,
    },
    {
      terms: ["network", "infrastructure", "wifi", "lan", "wan", "switch", "router", "data center", "datacenter"],
      reply: `Network & infrastructure — design, modernization, and management from strategy through deployment.\n\nService: /services/network-infrastructure\nContact: ${email}`,
    },
    {
      terms: ["security", "utimaco", "firewall", "cyber", "encryption", "hsm"],
      reply: `Security is core to Synergy's portfolio${
        securityPartners.length
          ? ` (partners include ${securityPartners.map((n) => n.replace(/\b\w/g, (c) => c.toUpperCase())).join(" and ")})`
          : ""
      }.\n\nStart at /services or /contact for a security review.`,
    },
    ...(knowledge.hasDynatrace
      ? [
          {
            terms: ["dynatrace", "observability", "monitor", "apm", "performance"],
            reply: `Synergy works with Dynatrace and observability practices for application performance in Pakistan.\n\nSee /partners and /resources, or /contact for implementation.`,
          },
        ]
      : []),
    {
      terms: ["rpa", "automation anywhere", "robotic", "automation"],
      reply: hasPartnerNamed(knowledge, "automation")
        ? `Synergy supports robotic process automation through partners such as Automation Anywhere.\n\nBrowse /resources or /contact for a discovery call.`
        : `Synergy can discuss automation and RPA for your environment. Contact ${email} or see /services.`,
    },
    {
      terms: ["oracle", "database", "erp"],
      reply: hasPartnerNamed(knowledge, "oracle")
        ? `Synergy is an Oracle partner — we support enterprise applications and infrastructure aligned to Oracle environments. See /partners or contact ${email}.`
        : `For database and ERP discussions, contact ${email} or see /services.`,
    },
    {
      terms: ["dell", "server", "storage", "netapp", "hitachi", "ddn"],
      reply: storagePartners.length
        ? `Synergy supplies and supports enterprise hardware and storage with partners including ${knowledge.partners
            .filter((p) =>
              ["dell", "netapp", "hitachi", "ddn", "pure"].some((n) =>
                p.name.toLowerCase().includes(n),
              ),
            )
            .map((p) => p.name)
            .join(", ")}. See /partners or /contact.`
        : `Synergy supplies and supports enterprise hardware and storage. See /partners or /contact.`,
    },
    {
      terms: ["blog", "resource", "article", "news", "insight"],
      reply: `Synergy's Resources section has articles on infrastructure, storage, observability, and managed IT in Pakistan: /resources`,
    },
    {
      terms: ["pakistan", "karachi", "local", "in pakistan"],
      reply: `${siteConfig.legalName} is headquartered in Karachi with branches across Pakistan. We deliver nationwide IT services, support, and integration for enterprise clients. Contact: ${email}`,
    },
  ];

  for (const topic of topicReplies) {
    if (includesAny(q, topic.terms)) {
      return { matched: true, reply: topic.reply };
    }
  }

  let best: { score: number; reply: string } | null = null;
  for (const service of services) {
    const score = scoreOverlap(q, `${service.title} ${service.summary}`);
    if (score >= 2 && (!best || score > best.score)) {
      best = {
        score,
        reply: `Based on your question, you may be interested in:\n\n${service.title}\n${service.summary}\n\nDetails: /services/${service.slug}\nContact: ${email}`,
      };
    }
  }

  if (best) return { matched: true, reply: best.reply };

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

  return { reply: fallbackReply(knowledge), matched: false };
}

/** Snippets for LLM context based on the user's latest message. */
export function buildLocalContextForQuery(
  userMessage: string,
  knowledge: ChatSiteKnowledge,
): string {
  const local = replyFromLocalKnowledge(userMessage, knowledge);
  if (local.matched) {
    return `Relevant Synergy knowledge for this question:\n${local.reply}`;
  }

  const serviceLines = knowledge.services.map((s) => `- ${s.title}: ${s.summary}`).join("\n");
  const partnerLine = knowledge.partners.map((p) => p.name).join(", ");
  return `General Synergy services:\n${serviceLines}\n\nCurrent partners: ${partnerLine || "see /partners"}`;
}
