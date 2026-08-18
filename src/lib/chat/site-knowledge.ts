import { invalidateCmsCache } from "@/lib/cms/cache";
import {
  fetchLeadership,
  fetchPartners,
  fetchServices,
  fetchSiteSettings,
} from "@/lib/cms/public";
import { caseStudies } from "@/lib/content/case-studies";
import { industries } from "@/lib/content/industries";
import type { Partner } from "@/lib/content/partners";
import type { Service } from "@/lib/content/services";
import type { LeadershipMember } from "@/lib/content/leadership";
import type { SiteSettings } from "@/lib/firebase/collections";

/**
 * Live website catalog for the chatbot.
 * Partners / services / settings come from Admin CMS (Firestore).
 * After admin delete/update, chat must not keep listing removed rows.
 */
export type ChatSiteKnowledge = {
  partners: Partner[];
  services: Service[];
  industries: typeof industries;
  caseStudies: typeof caseStudies;
  leadership: LeadershipMember[];
  settings: SiteSettings;
  /** True when Dynatrace is still an active CMS partner */
  hasDynatrace: boolean;
  loadedAt: number;
};

let memory: ChatSiteKnowledge | null = null;
const CHAT_TTL_MS = 8_000;

async function loadFresh(): Promise<ChatSiteKnowledge> {
  // Drop shared CMS map so chat sees deletes/updates even if site cache is warm.
  invalidateCmsCache("partners");
  invalidateCmsCache("services");
  invalidateCmsCache("settings");

  const [partners, services, settings, leadership] = await Promise.all([
    fetchPartners(),
    fetchServices(),
    fetchSiteSettings(),
    fetchLeadership(),
  ]);

  const hasDynatrace = partners.some(
    (p) => (p.slug || p.name).toLowerCase().includes("dynatrace"),
  );

  return {
    partners,
    services,
    industries,
    caseStudies,
    leadership,
    settings,
    hasDynatrace,
    loadedAt: Date.now(),
  };
}

/** Short-lived knowledge snapshot for /api/chat (fresh after admin CMS edits). */
export async function loadChatSiteKnowledge(force = false): Promise<ChatSiteKnowledge> {
  if (!force && memory && Date.now() - memory.loadedAt < CHAT_TTL_MS) {
    return memory;
  }
  memory = await loadFresh();
  return memory;
}

export function partnerNamesList(knowledge: ChatSiteKnowledge): string {
  return knowledge.partners.map((p) => p.name).join(", ");
}

export function findPartnerInQuery(
  knowledge: ChatSiteKnowledge,
  query: string,
): Partner | null {
  const q = query.toLowerCase();
  for (const partner of knowledge.partners) {
    const name = partner.name.toLowerCase();
    const first = name.split(" ")[0] ?? "";
    if (name && (q.includes(name) || (first.length > 3 && q.includes(first)))) {
      return partner;
    }
  }
  return null;
}
