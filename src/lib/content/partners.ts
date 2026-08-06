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
      "Industry-specific ERP, PLM, and WMS solutions for operational agility.",
    overview:
      "Infor delivers industry-specific enterprise solutions including ERP, PLM, and WMS, enabling organizations to optimize operations, strengthen collaboration, and drive sustainable growth. Its comprehensive ERP suite streamlines core business processes, providing real-time visibility across finance, supply chain, and operations. The Infor PLM (Product Lifecycle Management) platform accelerates product innovation by seamlessly connecting people, processes, and data throughout the entire product lifecycle. Infor WMS (Warehouse Management System) enhances warehouse efficiency and accuracy by optimizing inventory, labor, and logistics operations.",
    taglines: [
      "Industry-Focused ERP",
      "PLM & Product Innovation",
      "Warehouse Management (WMS)",
    ],
    keySolutions: [
      "Infor ERP suite",
      "Product Lifecycle Management (PLM)",
      "Warehouse Management System (WMS)",
      "Finance, supply chain, and operations visibility",
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
    href: "https://www.iii.com/",
    heroImageUrl: "/images/partners/hero/innovative.webp",
    category: "Library Solutions",
    shortDescription:
      "Virtua Integrated Library Management System — installed and maintained by Synergy in Pakistan.",
    overview:
      "Innovative Interface Inc. is a global leader in library solutions, offering Virtua, a comprehensive Integrated Library Management System (ILMS). Virtua streamlines library operations with modules for cataloging, acquisitions, circulation, and serials, supporting multimedia content and ensuring efficient, fully documented library management.\n\nBacked by a large global and local user community, Virtua enables libraries to operate with greater efficiency, accuracy, and scalability. In Pakistan, Synergy Computers delivers complete installation and maintenance services for Virtua. To date, Virtua has been successfully implemented in 178 libraries worldwide, including six libraries in Pakistan under Synergy Computers Pvt. Ltd.",
    taglines: [
      "Virtua ILMS",
      "Library Operations at Scale",
      "Local Installation & Maintenance",
    ],
    keySolutions: [
      "Virtua Integrated Library Management System",
      "Cataloging, acquisitions, circulation, and serials",
      "Installation and maintenance in Pakistan",
      "Multimedia content support",
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
      "Automation Anywhere is a global leader in intelligent automation and Robotic Process Automation (RPA), enabling organizations to drive operational excellence, reduce costs, and enhance business agility through secure, scalable automation solutions. By combining advanced RPA with AI-powered capabilities such as intelligent document processing, machine learning, and analytics, Automation Anywhere automates complex, high-volume processes across finance, operations, IT, and customer service functions.",
    taglines: [
      "Intelligent Process Automation",
      "Less Manual Work, More Focus",
      "Automation That Scales",
    ],
    keySolutions: [
      "RPA and intelligent automation",
      "Intelligent document processing",
      "Machine learning and analytics",
      "Finance, operations, IT, and customer service automation",
    ],
  },
  // --- Additional partners from Company Profile 2026 (logo assets pending) ---
  {
    name: "BMC Helix",
    slug: "bmc-helix",
    logo: "/images/partners/profile/bmc-helix.webp",
    href: "https://www.bmc.com/helix",
    category: "IT Service Management",
    shortDescription:
      "Cloud-native, AI-driven ITSM for hybrid and multi-cloud support operations.",
    overview:
      "BMC Helix is a cloud-native, AI-driven IT Service Management (ITSM) platform that enables organizations to automate support processes, accelerate issue resolution, and enhance the overall user experience. By unifying ITSM, AIOps, asset management, and service management into a single intelligent solution, BMC Helix provides seamless support for hybrid and multi-cloud environments.",
    taglines: ["AI-Driven ITSM", "AIOps & Asset Management", "Hybrid Cloud Support"],
    keySolutions: [
      "IT Service Management (ITSM)",
      "AIOps and service management",
      "Asset management",
      "Hybrid and multi-cloud support",
    ],
  },
  {
    name: "EnterpriseDB",
    slug: "enterprisedb",
    logo: "/images/partners/profile/enterprisedb.webp",
    href: "https://www.enterprisedb.com/",
    category: "Database",
    shortDescription:
      "Enterprise-class PostgreSQL for modern data management and cloud-native applications.",
    overview:
      "EnterpriseDB delivers enterprise class PostgreSQL solutions designed for modern data management and cloud-native applications. Its portfolio including EDB Postgres Advanced Server, EDB Postgres Ark, and EDB Postgres Migration Toolkit provides high-performance, secure, and scalable database platforms. EnterpriseDB solutions enable seamless migration from legacy databases, simplified management across on-premises and cloud environments, and advanced capabilities such as automated failover, high availability, and enterprise-grade security for mission-critical workloads.",
    taglines: ["Enterprise PostgreSQL", "Legacy Migration", "High Availability"],
    keySolutions: [
      "EDB Postgres Advanced Server",
      "EDB Postgres Ark",
      "Postgres Migration Toolkit",
      "High availability and automated failover",
    ],
  },
  {
    name: "KnowBe4",
    slug: "knowbe4",
    logo: "/images/partners/profile/knowbe4.webp",
    href: "https://www.knowbe4.com/",
    category: "Security Awareness",
    shortDescription:
      "Cybersecurity awareness and training that strengthens the human line of defense.",
    overview:
      "KnowBe4 is a leading cybersecurity awareness and training platform that helps organizations mitigate human-related security risks, particularly phishing and social engineering attacks. By educating employees to recognize and respond to cyber threats, KnowBe4 ensures that your workforce becomes a strong line of defense rather than a vulnerability.",
    taglines: ["Phishing Simulations", "Security Awareness Training", "Risk Reporting"],
    keySolutions: [
      "Phishing simulations",
      "Security awareness training and compliance support",
      "Risk and behavior reporting",
      "Continuous improvement reinforcement",
    ],
  },
  {
    name: "Hexagon",
    slug: "hexagon",
    logo: "/images/partners/profile/hexagon.webp",
    href: "https://hexagon.com/",
    category: "Enterprise Asset Management",
    shortDescription:
      "Enterprise Asset Management for performance, reliability, and lifecycle value.",
    overview:
      "Hexagon Enterprise Asset Management (EAM) enables organizations to maximize the value, performance, and lifecycle of their critical assets through intelligent, data-driven management. By integrating maintenance, operations, and analytics, Hexagon EAM delivers real-time visibility into asset health, predictive maintenance insights, and optimized resource utilization.",
    taglines: ["Asset Health Visibility", "Predictive Maintenance", "Operational Efficiency"],
    keySolutions: [
      "Enterprise Asset Management (EAM)",
      "Predictive maintenance insights",
      "Maintenance and operations integration",
      "Regulatory compliance support",
    ],
  },
  {
    name: "Nutanix",
    slug: "nutanix",
    logo: "/images/partners/wordmark-placeholder.svg",
    href: "https://www.nutanix.com/",
    category: "Hybrid Cloud",
    shortDescription:
      "Unified cloud software for hybrid multicloud applications and data.",
    overview:
      "Nutanix is a global leader in cloud software, delivering a unified platform to run applications and manage data seamlessly across multiple clouds. By simplifying operations and reducing infrastructure complexity, Nutanix enables organizations to focus on driving business outcomes. As a pioneer in hyperconverged infrastructure, Nutanix is trusted worldwide to power hybrid multicloud environments with consistency, simplicity, and cost efficiency.",
    taglines: ["Hybrid Multicloud", "Hyperconverged Infrastructure", "Simplified Operations"],
    keySolutions: [
      "Hyperconverged infrastructure",
      "Hybrid multicloud platform",
      "Application and data management",
      "Simplified IT operations",
    ],
  },
  {
    name: "Cohesity",
    slug: "cohesity",
    logo: "/images/partners/profile/cohesity.webp",
    href: "https://www.cohesity.com/",
    category: "Data Security",
    shortDescription:
      "AI-powered data security, backup, recovery, and multi-cloud resilience.",
    overview:
      "Cohesity delivers AI powered data security and management solutions that simplify backup, recovery, and multi-cloud data resilience. Its unified platform consolidates workloads, protects against ransomware, and ensures rapid disaster recovery. With offerings like DataProtect, Helios, and FortKnox, Cohesity enables enterprises to secure, manage, and extract insights from their data across hybrid and cloud environments.",
    taglines: ["Cyber Resilience", "Backup & Recovery", "Ransomware Protection"],
    keySolutions: [
      "DataProtect backup and recovery",
      "Helios management",
      "FortKnox cyber vaulting",
      "Multi-cloud data resilience",
    ],
  },
  {
    name: "Pure Storage",
    slug: "pure-storage",
    logo: "/images/partners/profile/pure-storage.webp",
    href: "https://www.purestorage.com/",
    category: "All-Flash Storage",
    shortDescription:
      "All-flash storage for performance, simplicity, and modern data infrastructure.",
    overview:
      "Pure Storage is a leading enterprise data storage company delivering all-flash storage solutions designed for performance, simplicity, and efficiency. Founded in 2009 and headquartered in Mountain View, California, Pure Storage helps organizations modernize their data infrastructure to support AI, analytics, and cloud computing. Its flagship products, including FlashArray and FlashBlade, provide scalable, high-speed, and energy-efficient storage.",
    taglines: ["FlashArray", "FlashBlade", "AI-Ready Storage"],
    keySolutions: [
      "FlashArray and FlashBlade platforms",
      "AI and analytics storage",
      "Cloud-aligned data infrastructure",
      "Subscription-based software updates",
    ],
  },
  {
    name: "Proxmox",
    slug: "proxmox",
    logo: "/images/partners/profile/proxmox.webp",
    href: "https://www.proxmox.com/",
    category: "Virtualization",
    shortDescription:
      "Open virtualization platform for VMs, containers, storage, and networking.",
    overview:
      "Proxmox is a comprehensive virtualization and IT infrastructure management platform that integrates virtual machines, Linux containers, storage, and networking into a unified solution. Its flagship Proxmox Virtual Environment (VE) offers centralized, web-based management with features such as clustering, high availability, and built-in backup. Complementary solutions including Proxmox Backup Server and Proxmox Mail Gateway enhance data protection and secure communications.",
    taglines: ["Proxmox VE", "High Availability Clustering", "Built-in Backup"],
    keySolutions: [
      "Proxmox Virtual Environment",
      "Proxmox Backup Server",
      "Proxmox Mail Gateway",
      "VM and container management",
    ],
  },
  {
    name: "Lenovo",
    slug: "lenovo",
    logo: "/images/partners/wordmark-placeholder.svg",
    href: "https://www.lenovo.com/",
    category: "Infrastructure",
    shortDescription:
      "ThinkSystem servers, storage, and ThinkAgile software-defined infrastructure.",
    overview:
      "Lenovo delivers high-performance infrastructure solutions through its ThinkSystem servers, storage platforms, and ThinkAgile software-defined infrastructure. Powered by Lenovo Neptune sixth-generation liquid cooling, these systems efficiently remove up to 100% of heat using warm water (up to 45°C), reducing energy consumption by up to 40% while supporting high-density AI and HPC workloads.",
    taglines: ["ThinkSystem", "ThinkAgile", "Neptune Liquid Cooling"],
    keySolutions: [
      "ThinkSystem servers and storage",
      "ThinkAgile software-defined infrastructure",
      "Neptune liquid cooling",
      "AI and HPC-ready platforms",
    ],
  },
  {
    name: "Red Hat",
    slug: "red-hat",
    logo: "/images/partners/profile/red-hat.webp",
    href: "https://www.redhat.com/",
    category: "Open Source Platform",
    shortDescription:
      "Enterprise open-source platforms including RHEL and OpenShift.",
    overview:
      "Red Hat delivers enterprise-grade open-source solutions built on Red Hat Enterprise Linux (RHEL), providing a consistent and secure operating environment across bare metal, virtual machines, and cloud infrastructures. At the core of its platform is Red Hat OpenShift, a Kubernetes-based solution that unifies containerized and virtualized workloads through OpenShift Virtualization, enabling organizations to modernize infrastructure and migrate from legacy hypervisors without extensive refactoring.",
    taglines: ["RHEL", "OpenShift", "OpenShift Virtualization"],
    keySolutions: [
      "Red Hat Enterprise Linux",
      "Red Hat OpenShift",
      "OpenShift Virtualization",
      "Hybrid cloud operating environments",
    ],
  },
  {
    name: "Fujitsu",
    slug: "fujitsu",
    logo: "/images/partners/profile/fujitsu.webp",
    href: "https://www.fujitsu.com/",
    category: "Infrastructure",
    shortDescription:
      "PRIMERGY servers, ETERNUS storage, and flexible uSCALE consumption models.",
    overview:
      "Fujitsu delivers high-performance PRIMERGY servers and ETERNUS storage systems designed with a workload-first approach, providing scalability, efficiency, and reliability for mission-critical environments. Through uSCALE, Fujitsu enables flexible, consumption-based IT that brings cloud-like agility to on-premises infrastructure.",
    taglines: ["PRIMERGY", "ETERNUS", "uSCALE"],
    keySolutions: [
      "PRIMERGY servers",
      "ETERNUS storage",
      "uSCALE consumption-based IT",
      "AI and digital transformation workloads",
    ],
  },
  {
    name: "IBM",
    slug: "ibm",
    logo: "/images/partners/wordmark-placeholder.svg",
    href: "https://www.ibm.com/",
    category: "Enterprise Computing",
    shortDescription:
      "Enterprise computing and AI platforms including IBM z17, Power10, and FlashSystem.",
    overview:
      "IBM delivers enterprise-grade computing and AI solutions through its IBM z17 mainframes and Power10 systems, offering industry-leading reliability, integrated quantum-safe cryptography, and real-time AI inferencing with the Telum II processor and Spyre Accelerator. Complemented by IBM FlashSystem storage and Red Hat OpenShift, these platforms provide a seamless hybrid cloud data fabric for mission-critical workloads.",
    taglines: ["IBM z17", "Power10", "FlashSystem"],
    keySolutions: [
      "IBM z17 mainframes",
      "Power10 systems",
      "IBM FlashSystem storage",
      "Hybrid cloud with Red Hat OpenShift",
    ],
  },
  {
    name: "Supermicro",
    slug: "supermicro",
    logo: "/images/partners/profile/supermicro.webp",
    href: "https://www.supermicro.com/",
    category: "Infrastructure",
    shortDescription:
      "Energy-efficient server and storage solutions for AI, HPC, and enterprise workloads.",
    overview:
      "Supermicro delivers high-performance, energy-efficient server and storage solutions designed for demanding workloads. Built on its modular Server Building Block Solutions architecture, Supermicro systems enable rapid customization across data centers, cloud, AI/ML, HPC, and enterprise applications, with optimized compute density and Green Computing technology.",
    taglines: ["Server Building Blocks", "AI/ML & HPC", "Green Computing"],
    keySolutions: [
      "Modular server building blocks",
      "AI/ML and HPC platforms",
      "High-density compute",
      "Energy-efficient Green Computing",
    ],
  },
  {
    name: "Cisco",
    slug: "cisco",
    logo: "/images/partners/profile/cisco.webp",
    href: "https://www.cisco.com/",
    category: "Networking",
    shortDescription:
      "Enterprise networking and secure connectivity — listed in Synergy's Company Profile partnerships.",
    overview:
      "Cisco is featured among Synergy Computers' strategic technology partnerships in the Company Profile 2026. Synergy helps Pakistani enterprises design and support network and connectivity architectures aligned to Cisco platforms.",
    taglines: ["Enterprise Networking", "Secure Connectivity", "Infrastructure Scale"],
    keySolutions: [
      "Enterprise networking platforms",
      "Secure connectivity architectures",
      "Infrastructure modernization",
      "Local implementation support with Synergy",
    ],
  },
  {
    name: "Arctera",
    slug: "arctera",
    logo: "/images/partners/profile/arctera.webp",
    href: "https://www.arctera.io/",
    category: "Data Resilience",
    shortDescription:
      "Data resilience and availability technology — listed in Synergy's Company Profile partnerships.",
    overview:
      "Arctera is featured among Synergy Computers' strategic technology partnerships in the Company Profile 2026. Synergy supports enterprises seeking resilient data and availability outcomes through aligned technology partnerships.",
    taglines: ["Data Resilience", "Availability", "Enterprise Protection"],
    keySolutions: [
      "Data resilience platforms",
      "Availability-focused architectures",
      "Enterprise data protection alignment",
      "Local partnership delivery with Synergy",
    ],
  },
];
