/**
 * Partnerships & Collaborations logo strip — Company Profile 2026 (p.7).
 * Images cropped from the official profile grid into /images/partners/profile/.
 */
export type PartnershipLogo = {
  name: string;
  slug: string;
  logo: string;
  /** Link to internal partner page when we have one */
  href?: string;
};

export const partnershipsIntro =
  "Synergy Computers (Pvt.) Ltd partners with leading global technology providers to deliver comprehensive IT solutions. These strategic alliances, combined with our diverse offerings, enable us to serve as a trusted one-window technology partner for our clients.";

export const partnershipLogos: PartnershipLogo[] = [
  { name: "Hitachi Vantara", slug: "hitachi-vantara", logo: "/images/partners/profile/hitachi-vantara.webp", href: "/partners/hitachi-vantara" },
  { name: "Dynatrace", slug: "dynatrace", logo: "/images/partners/profile/dynatrace.webp", href: "/partners/dynatrace" },
  { name: "Infor", slug: "infor", logo: "/images/partners/profile/infor.webp", href: "/partners/infor" },
  { name: "EnterpriseDB", slug: "enterprisedb", logo: "/images/partners/profile/enterprisedb.webp", href: "/partners/enterprisedb" },
  { name: "Automation Anywhere", slug: "automation-anywhere", logo: "/images/partners/profile/automation-anywhere.webp", href: "/partners/automation-anywhere" },
  { name: "BMC Helix", slug: "bmc-helix", logo: "/images/partners/profile/bmc-helix.webp", href: "/partners/bmc-helix" },
  { name: "Supermicro", slug: "supermicro", logo: "/images/partners/profile/supermicro.webp", href: "/partners/supermicro" },
  { name: "Oracle", slug: "oracle", logo: "/images/partners/profile/oracle.webp", href: "/partners/oracle" },
  { name: "Hexagon", slug: "hexagon", logo: "/images/partners/profile/hexagon.webp", href: "/partners/hexagon" },
  { name: "Cohesity", slug: "cohesity", logo: "/brand/cohesity/wordmark.svg", href: "/partners/cohesity" },
  { name: "Convene", slug: "convene", logo: "/images/partners/profile/convene.webp", href: "/partners/convene" },
  { name: "Red Hat", slug: "red-hat", logo: "/images/partners/profile/red-hat.webp", href: "/partners/red-hat" },
  { name: "Pure Storage", slug: "pure-storage", logo: "/images/partners/profile/pure-storage.webp", href: "/partners/pure-storage" },
  { name: "Cisco", slug: "cisco", logo: "/images/partners/profile/cisco.webp" },
  { name: "Arctera", slug: "arctera", logo: "/images/partners/profile/arctera.webp" },
  { name: "KnowBe4", slug: "knowbe4", logo: "/images/partners/profile/knowbe4.webp", href: "/partners/knowbe4" },
  { name: "Utimaco", slug: "utimaco", logo: "/images/partners/profile/utimaco.webp", href: "/partners/utimaco" },
  { name: "NetApp", slug: "netapp", logo: "/images/partners/profile/netapp.webp", href: "/partners/netapp" },
  { name: "Proxmox", slug: "proxmox", logo: "/images/partners/profile/proxmox.webp", href: "/partners/proxmox" },
  { name: "Fujitsu", slug: "fujitsu", logo: "/images/partners/profile/fujitsu.webp", href: "/partners/fujitsu" },
];

export function splitPartnershipRows() {
  const mid = Math.ceil(partnershipLogos.length / 2);
  return [partnershipLogos.slice(0, mid), partnershipLogos.slice(mid)] as const;
}
