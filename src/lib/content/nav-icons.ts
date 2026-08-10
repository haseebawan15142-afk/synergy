/**
 * Lucide icon keys for mega-menu / mobile nav links.
 * Matched to Synergy services, industries, company, and insights items.
 */
export type NavIconKey =
  | "headset"
  | "network"
  | "databaseBackup"
  | "cloud"
  | "serverCog"
  | "landmark"
  | "radio"
  | "zap"
  | "heartPulse"
  | "graduationCap"
  | "hotel"
  | "building2"
  | "shield"
  | "factory"
  | "users"
  | "award"
  | "messageSquare"
  | "newspaper"
  | "mail"
  | "handshake"
  | "cpu"
  | "boxes"
  | "globe"
  | "briefcase"
  | "chevronRight";

/** Admin picker options (label + key). */
export const NAV_ICON_OPTIONS: { value: NavIconKey; label: string }[] = [
  { value: "headset", label: "Headset / support" },
  { value: "network", label: "Network" },
  { value: "databaseBackup", label: "Database / backup" },
  { value: "cloud", label: "Cloud" },
  { value: "serverCog", label: "Server / managed IT" },
  { value: "landmark", label: "Landmark / banking" },
  { value: "radio", label: "Telecom" },
  { value: "zap", label: "Power / energy" },
  { value: "heartPulse", label: "Healthcare" },
  { value: "graduationCap", label: "Education" },
  { value: "hotel", label: "Hospitality" },
  { value: "building2", label: "Building / company" },
  { value: "shield", label: "Shield / government" },
  { value: "factory", label: "Factory / industrial" },
  { value: "users", label: "Users / board" },
  { value: "award", label: "Award / accomplishments" },
  { value: "messageSquare", label: "Message / CEO" },
  { value: "newspaper", label: "Newspaper / blog" },
  { value: "mail", label: "Mail / newsletter" },
  { value: "handshake", label: "Handshake / partners" },
  { value: "cpu", label: "CPU / tech" },
  { value: "boxes", label: "Boxes / generic" },
  { value: "globe", label: "Globe / industries" },
  { value: "briefcase", label: "Briefcase / services" },
  { value: "chevronRight", label: "Chevron" },
];

const NAV_ICON_SET = new Set<string>(NAV_ICON_OPTIONS.map((o) => o.value));

export function isNavIconKey(value: unknown): value is NavIconKey {
  return typeof value === "string" && NAV_ICON_SET.has(value);
}

/** Prefer CMS icon when valid; otherwise href/label heuristic. */
export function resolveCmsNavIcon(
  cmsIcon: string | null | undefined,
  href: string,
  label = "",
): NavIconKey {
  if (isNavIconKey(cmsIcon)) return cmsIcon;
  return resolveNavIconKey(href, label);
}

/** Resolve an icon for a nav link from its href (and optional label). */
export function resolveNavIconKey(href: string, label = ""): NavIconKey {
  const path = href.toLowerCase().split("#")[0];
  const hash = href.includes("#") ? href.split("#")[1]?.toLowerCase() || "" : "";
  const text = label.toLowerCase();

  // Services by slug
  if (path.includes("on-site-it-support") || text.includes("on-site")) return "headset";
  if (path.includes("network-infrastructure") || text.includes("network")) return "network";
  if (path.includes("data-backup") || text.includes("backup")) return "databaseBackup";
  if (path.includes("microsoft-365") || text.includes("cloud") || text.includes("microsoft"))
    return "cloud";
  if (path.includes("managed-it") || text.includes("managed")) return "serverCog";

  // Industries
  if (path.includes("banking") || text.includes("bank")) return "landmark";
  if (path.includes("telecom") || text.includes("telecom")) return "radio";
  if (path.includes("power") || text.includes("utilit")) return "zap";
  if (path.includes("healthcare") || text.includes("health")) return "heartPulse";
  if (path.includes("education") || text.includes("education")) return "graduationCap";
  if (path.includes("hospitality") || text.includes("hospitality")) return "hotel";
  if (path.includes("enterprise") || text.includes("enterprise")) return "building2";
  if (path.includes("government") || text.includes("public")) return "shield";
  if (path.includes("manufactur") || text.includes("industrial")) return "factory";

  // About / company
  if (hash.includes("who-we-are") || text.includes("who we are")) return "building2";
  if (hash.includes("ceo") || text.includes("ceo")) return "messageSquare";
  if (hash.includes("board") || text.includes("board") || text.includes("director"))
    return "users";
  if (hash.includes("accomplish") || text.includes("accomplish")) return "award";

  // Insights
  if (path.includes("newsletter") || text.includes("newsletter")) return "mail";
  if (path.includes("resources") || text.includes("blog") || text.includes("insight"))
    return "newspaper";

  // Partners / generic
  if (path.includes("partners") || text.includes("partner")) return "handshake";
  if (path.includes("services")) return "briefcase";
  if (path.includes("industries")) return "globe";

  return "boxes";
}

/** Attach icons to mega-menu link rows. */
export function withNavIcons<T extends { label: string; href: string; icon?: NavIconKey }>(
  links: T[],
): (T & { icon: NavIconKey })[] {
  return links.map((link) => ({
    ...link,
    icon: link.icon ?? resolveNavIconKey(link.href, link.label),
  }));
}
