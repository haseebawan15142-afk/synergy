import { industries } from "@/lib/content/industries";
import { partners } from "@/lib/content/partners";
import { services } from "@/lib/content/services";
import { siteConfig } from "@/lib/content/site";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((t) => text.includes(t));
}

/** Works without an API key — answers from Synergy site content. */
export function replyFromLocalKnowledge(userMessage: string): string {
  const q = normalize(userMessage);

  if (includesAny(q, ["hello", "hi", "hey", "salam", "assalam"])) {
    return `Hello! I'm Synergy Assistant for ${siteConfig.legalName}. Ask about our services, technology partners, industries, or how to reach our team in Karachi.`;
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
    ]) ||
    (q.includes("use") && includesAny(q, ["they", "synergy", "you", "which", "what"]))
  ) {
    const names = partners.map((p) => p.name).join(", ");
    return `Synergy works with leading global technology principals, including:\n\n${names}\n\nWe combine these with in-house integration and 24×7 support across infrastructure, data protection, cloud, security, and automation. See /partners or ask about a specific service area.`;
  }

  if (includesAny(q, ["service", "services", "offer", "provide", "do you do", "what do you"])) {
    const lines = services.map((s) => `• ${s.title} — ${s.summary}`);
    return `Our main service areas:\n\n${lines.join("\n")}\n\nDetails: /services — or tell me which area you care about (backup, cloud, managed IT, etc.).`;
  }

  for (const service of services) {
    const keys = [
      service.slug.replace(/-/g, " "),
      ...service.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
    ];
    if (includesAny(q, keys) || q.includes(service.title.toLowerCase())) {
      return `${service.title}\n\n${service.summary}\n\nWe tailor scope and pricing to your environment. Request a quote: /contact or ${siteConfig.email}.`;
    }
  }

  if (includesAny(q, ["industry", "industries", "sector", "bank", "health", "education", "smb"])) {
    const lines = industries.map((i) => `• ${i.title} — ${i.summary}`);
    return `We support clients across:\n\n${lines.join("\n")}\n\nLearn more: /industries`;
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
      "branch",
      "reach",
      "quote",
      "pricing",
      "price",
      "cost",
    ])
  ) {
    return `Contact ${siteConfig.name}\n\n• Email: ${siteConfig.email}\n• Phone: ${siteConfig.phones.join(", ")}\n• Head office: ${siteConfig.address.line}, ${siteConfig.address.city}, ${siteConfig.address.country}\n\nBranches: Lahore, Islamabad, Gilgit.\n\nOnline form: /contact — we provide quotes tailored to your project.`;
  }

  if (includesAny(q, ["about", "who are", "history", "years", "experience"])) {
    return `${siteConfig.legalName} has served Pakistan for over 40 years as an enterprise IT solutions provider — hardware, applications, integration, and 24×7 maintenance. HQ in Karachi with nationwide coverage. More: /about`;
  }

  if (includesAny(q, ["backup", "recovery", "data availability", "veritas", "cohesity"])) {
    return `We provide data backup & recovery and data availability solutions (partners include Veritas and related enterprise storage vendors). Service: /services/data-backup-recovery — contact ${siteConfig.email} for assessment.`;
  }

  if (includesAny(q, ["cloud", "microsoft", "365", "m365", "azure"])) {
    return `We help with Microsoft 365 & cloud — migration, collaboration, and governance. Service: /services/microsoft-365-cloud. Contact us for a scoped quote.`;
  }

  if (includesAny(q, ["managed", "support", "24", "maintenance", "sla"])) {
    return `Managed IT & maintenance — SLA-backed support across your infrastructure, including 24×7 options. Details: /services/managed-it. Call ${siteConfig.phones[0]} to discuss your environment.`;
  }

  if (includesAny(q, ["security", "utimaco", "firewall", "protect"])) {
    return `Security is part of our portfolio (partners include Utimaco and enterprise security vendors). Start at /services or /contact for a review.`;
  }

  if (includesAny(q, ["dynatrace", "observability", "monitor", "apm"])) {
    return `We work with Dynatrace and observability practices for application performance. See /partners and /resources, or /contact for implementation support in Pakistan.`;
  }

  if (includesAny(q, ["rpa", "automation anywhere", "robotic"])) {
    return `We support robotic process automation through partners such as Automation Anywhere. Browse /resources for RPA articles or /contact for a discovery call.`;
  }

  if (includesAny(q, ["blog", "resource", "article", "news"])) {
    return `Our Resources section has 140+ articles on infrastructure, storage, observability, and managed IT: /resources`;
  }

  return `I can help with Synergy services, technology partners, industries, contact details, and quotes.\n\nTry: "What services do you offer?" or "How do I contact the Karachi office?"\n\nEmail: ${siteConfig.email} | Phone: ${siteConfig.phones[0]} | /contact`;
}
