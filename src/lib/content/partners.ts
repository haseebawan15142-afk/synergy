export type Partner = {
  name: string;
  logo: string;
  href: string;
  slug?: string;
  heroImageUrl?: string;
  taglines?: string[];
  shortDescription?: string;
  overview?: string;
  keySolutions?: string[];
  category?: string;
};

/** Internal detail page path — not the partner's external website. */
export function partnerDetailPath(partner: Pick<Partner, "name" | "slug">) {
  const slug =
    partner.slug ||
    partner.name
      .toLowerCase()
      .trim()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `/partners/${slug}`;
}

export const partners: Partner[] = [
  {
    name: "Veritas",
    slug: "veritas",
    logo: "/images/partners/veritas.webp",
    href: "https://www.veritas.com/",
    heroImageUrl: "/images/partners/hero/veritas.webp",
    category: "Data Protection",
    shortDescription:
      "Enterprise backup, recovery, and data availability — delivered with Synergy in Pakistan.",
    overview:
      "Veritas helps organizations protect critical data and keep applications available when interruptions hit. Through Synergy Computers, Pakistani enterprises gain local implementation expertise with Veritas backup, recovery, and information management platforms.\n\nFrom data center modernization to ransomware resilience, Synergy designs, deploys, and supports Veritas solutions aligned to banking, public sector, and large enterprise environments.",
    taglines: [
      "Reliable Backup & Recovery",
      "Data Availability at Scale",
      "Resilience for Critical Systems",
    ],
    keySolutions: [
      "Backup and recovery architecture",
      "Business continuity and disaster recovery",
      "Data protection for hybrid environments",
      "Implementation, health checks, and support",
    ],
  },
  {
    name: "Dynatrace",
    slug: "dynatrace",
    logo: "/brand/dynatrace/wordmark.svg",
    href: "https://www.dynatrace.com/",
    heroImageUrl: "/images/partners/hero/dynatrace.webp",
    category: "Observability",
    shortDescription:
      "Pakistan's exclusive Dynatrace partner for AI-powered observability and digital operations.",
    overview:
      "Dynatrace delivers software intelligence that unifies application performance, infrastructure monitoring, and digital experience. Synergy Computers is the exclusive authorized Dynatrace partner in Pakistan.\n\nWe help enterprises move from reactive firefighting to proactive operations — with Davis AI, full-stack observability, and outcomes that matter for banking, telecom, aviation, healthcare, and government workloads.",
    taglines: [
      "AI-Powered Observability",
      "Full-Stack Visibility",
      "Faster Root Cause Analysis",
    ],
    keySolutions: [
      "Application performance monitoring",
      "Infrastructure and cloud observability",
      "Digital experience monitoring",
      "AI-assisted operations and automation",
    ],
  },
  {
    name: "Utimaco",
    slug: "utimaco",
    logo: "/images/partners/utimaco.webp",
    href: "https://utimaco.com/",
    heroImageUrl: "/images/partners/hero/utimaco.webp",
    category: "Security",
    shortDescription:
      "Hardware security modules and cryptographic solutions for regulated enterprises.",
    overview:
      "Utimaco specializes in high-assurance security and cryptographic key management. Synergy brings Utimaco solutions to Pakistani organizations that must protect payment systems, digital identities, and sensitive enterprise data.\n\nTogether we support secure key lifecycle management, compliance-ready architectures, and long-term operational support.",
    taglines: [
      "Trusted Cryptographic Security",
      "Key Management You Can Rely On",
      "Compliance-Ready Protection",
    ],
    keySolutions: [
      "Hardware security modules (HSM)",
      "Cryptographic key management",
      "Payment and digital trust use cases",
      "Secure deployment and lifecycle support",
    ],
  },
  {
    name: "Oracle",
    slug: "oracle",
    logo: "/images/partners/oracle.webp",
    href: "https://www.oracle.com/",
    heroImageUrl: "/images/partners/hero/oracle.webp",
    category: "Enterprise Applications",
    shortDescription:
      "Oracle databases, middleware, and enterprise platforms backed by Synergy delivery.",
    overview:
      "Oracle remains a foundation for mission-critical applications and data platforms. Synergy Computers partners with Oracle technologies to help Pakistani enterprises modernize databases, strengthen application landscapes, and operate with confidence.\n\nWhether you need infrastructure alignment, migration planning, or ongoing support, Synergy connects Oracle capabilities with local delivery discipline.",
    taglines: [
      "Mission-Critical Platforms",
      "Database Modernization",
      "Enterprise Application Strength",
    ],
    keySolutions: [
      "Oracle database and middleware support",
      "Enterprise application enablement",
      "Migration and modernization guidance",
      "Infrastructure aligned to Oracle workloads",
    ],
  },
  {
    name: "NetApp",
    slug: "netapp",
    logo: "/images/partners/netapp.webp",
    href: "https://www.netapp.com/",
    heroImageUrl: "/images/partners/hero/netapp.webp",
    category: "Storage",
    shortDescription:
      "Intelligent data storage and hybrid cloud infrastructure with NetApp and Synergy.",
    overview:
      "NetApp helps organizations manage data across on-premises and cloud environments with performance and efficiency. Synergy Computers delivers NetApp storage architectures tailored to enterprise growth in Pakistan.\n\nFrom primary storage to hybrid cloud data services, we focus on predictable performance, simpler operations, and designs that fit your risk and budget profile.",
    taglines: [
      "Intelligent Data Storage",
      "Hybrid Cloud Ready",
      "Performance Without Complexity",
    ],
    keySolutions: [
      "Enterprise NAS and SAN design",
      "Hybrid cloud data services",
      "Storage efficiency and tiering",
      "Implementation and lifecycle support",
    ],
  },
  {
    name: "Hitachi Vantara",
    slug: "hitachi-vantara",
    logo: "/images/partners/hitachi-vantara.webp",
    href: "https://www.hitachivantara.com/",
    heroImageUrl: "/images/partners/hero/hitachi-vantara.webp",
    category: "Data Infrastructure",
    shortDescription:
      "Enterprise storage and data infrastructure for demanding digital workloads.",
    overview:
      "Hitachi Vantara brings proven data infrastructure for organizations that cannot compromise on reliability. Synergy Computers partners with Hitachi Vantara to design and support storage platforms for Pakistan's most demanding enterprise environments.\n\nWe help teams modernize data centers, improve data mobility, and keep critical systems available under growth and change.",
    taglines: [
      "Enterprise Data Infrastructure",
      "Built for Reliability",
      "Modern Storage Outcomes",
    ],
    keySolutions: [
      "Enterprise storage platforms",
      "Data center modernization",
      "High-availability architectures",
      "Local implementation and support",
    ],
  },
  {
    name: "Infor",
    slug: "infor",
    logo: "/images/partners/infor.webp",
    href: "https://www.infor.com/",
    heroImageUrl: "/images/partners/hero/infor.webp",
    category: "ERP",
    shortDescription:
      "Industry-focused ERP and business applications delivered with Synergy expertise.",
    overview:
      "Infor provides industry-specialized cloud and enterprise applications that help organizations run core processes with greater clarity. Synergy Computers supports Infor-aligned initiatives for Pakistani enterprises seeking practical digital transformation.\n\nFrom discovery through enablement, we help connect business goals with the right application and infrastructure foundation.",
    taglines: [
      "Industry-Focused ERP",
      "Smarter Core Processes",
      "Applications That Fit Operations",
    ],
    keySolutions: [
      "ERP and business application enablement",
      "Industry process alignment",
      "Integration-ready architectures",
      "Implementation support with Synergy",
    ],
  },
  {
    name: "Dell Technologies",
    slug: "dell-technologies",
    logo: "/images/partners/dell.webp",
    href: "https://www.dell.com/",
    heroImageUrl: "/images/partners/hero/dell-technologies.webp",
    category: "Infrastructure",
    shortDescription:
      "Servers, storage, and end-to-end infrastructure from Dell with Synergy delivery.",
    overview:
      "Dell Technologies powers modern IT estates — from servers and storage to client and edge platforms. Synergy Computers partners with Dell to supply, design, and support infrastructure that Pakistani enterprises depend on every day.\n\nWe help you choose the right platforms, deploy with care, and keep environments maintainable as demand grows.",
    taglines: [
      "Enterprise Infrastructure",
      "Servers & Storage You Trust",
      "Built for Scale in Pakistan",
    ],
    keySolutions: [
      "Server and storage solutions",
      "Data center build-outs",
      "Infrastructure refresh programs",
      "Warranty-aligned local support models",
    ],
  },
  {
    name: "DDN",
    slug: "ddn",
    logo: "/images/partners/ddn.webp",
    href: "https://www.ddn.com/",
    heroImageUrl: "/images/partners/hero/ddn.webp",
    category: "High-Performance Storage",
    shortDescription:
      "High-performance storage for AI, analytics, and data-intensive workloads.",
    overview:
      "DDN specializes in high-performance storage for AI, analytics, and research-scale data. Synergy Computers brings DDN capabilities to Pakistani organizations preparing for data-intensive and AI-driven workloads.\n\nWe help architecture teams evaluate performance needs, design resilient platforms, and support production readiness.",
    taglines: [
      "High-Performance Storage",
      "Ready for AI Workloads",
      "Speed Meets Scale",
    ],
    keySolutions: [
      "High-performance and parallel storage",
      "AI and analytics data platforms",
      "Capacity and throughput planning",
      "Deployment and operational support",
    ],
  },
  {
    name: "Convene",
    slug: "convene",
    logo: "/images/partners/convene.webp",
    href: "https://www.azeusconvene.com/",
    heroImageUrl: "/images/partners/hero/convene.webp",
    category: "Board Collaboration",
    shortDescription:
      "Secure board and leadership collaboration with Azeus Convene and Synergy.",
    overview:
      "Azeus Convene helps boards and leadership teams run secure, paperless meetings with better governance. Synergy Computers supports Convene adoption for Pakistani enterprises that need confidentiality, auditability, and a polished meeting experience.\n\nWe assist with rollout planning, user enablement, and the IT foundation required for reliable secure collaboration.",
    taglines: [
      "Secure Board Meetings",
      "Paperless Governance",
      "Leadership Collaboration",
    ],
    keySolutions: [
      "Board portal enablement",
      "Secure document collaboration",
      "Meeting workflow modernization",
      "Deployment and user adoption support",
    ],
  },
  {
    name: "Innovative",
    slug: "innovative",
    logo: "/images/partners/innovative.webp",
    href: "https://www.crimsonlogic.com/",
    heroImageUrl: "/images/partners/hero/innovative.webp",
    category: "Digital Solutions",
    shortDescription:
      "Digital government and enterprise process solutions through Innovative / CrimsonLogic.",
    overview:
      "Innovative (aligned with CrimsonLogic capabilities) supports digital transformation for complex public and enterprise processes. Synergy Computers partners to help Pakistani organizations modernize service delivery and process platforms.\n\nWe focus on practical outcomes — clearer workflows, stronger systems foundations, and delivery support that respects local operating realities.",
    taglines: [
      "Digital Process Transformation",
      "Modern Public & Enterprise Services",
      "Solutions Built for Delivery",
    ],
    keySolutions: [
      "Digital process platforms",
      "Service modernization initiatives",
      "Integration and enablement support",
      "Local partnership delivery with Synergy",
    ],
  },
  {
    name: "Automation Anywhere",
    slug: "automation-anywhere",
    logo: "/images/partners/automation-anywhere.webp",
    href: "https://www.automationanywhere.com/",
    heroImageUrl: "/images/partners/hero/automation-anywhere.webp",
    category: "Intelligent Automation",
    shortDescription:
      "Robotic process automation and intelligent automation programs with Synergy.",
    overview:
      "Automation Anywhere helps organizations automate repetitive work and scale digital operations. Synergy Computers partners with Automation Anywhere to help Pakistani enterprises identify high-value use cases and run automation responsibly.\n\nFrom discovery workshops to platform enablement, we help teams reduce manual effort while keeping controls and supportability in focus.",
    taglines: [
      "Intelligent Process Automation",
      "Less Manual Work, More Focus",
      "Automation That Scales",
    ],
    keySolutions: [
      "RPA opportunity assessment",
      "Bot development enablement",
      "Automation platform rollout",
      "Governance and support models",
    ],
  },
];
