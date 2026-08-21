/**
 * Dynatrace partner landing — content aligned to the approved page mockup.
 * Other partners keep the generic detail layout until separately approved.
 */
export const dynatracePartner = {
  headline: "Pakistan's only Dynatrace partner",
  subheadline:
    "Synergy Computers is the exclusive authorized Dynatrace partner in Pakistan — delivering AI-powered observability for enterprise digital ecosystems.",
  badge: "Exclusive partner · Pakistan",
  description:
    "From application performance and infrastructure monitoring to digital experience and automated operations, Synergy brings Dynatrace's software intelligence platform to banking, telecom, aviation, healthcare, and public-sector organizations across the country.",
  logo: "/brand/dynatrace/wordmark.svg",
  linkedinPostUrl:
    "https://www.linkedin.com/posts/synergy-computers_ai-observability-autonomousoperations-activity-7488123616576991232-pac2",
  gallery: [
    {
      src: "/images/dynatrace/innovate-singapore-01.webp",
      alt: "Synergy Computers team with Dynatrace leadership at Innovate Singapore 2026",
    },
    {
      src: "/images/dynatrace/innovate-singapore-02.webp",
      alt: "Synergy and Dynatrace partnership at Innovate Singapore 2026",
    },
    {
      src: "/images/dynatrace/innovate-singapore-03.webp",
      alt: "Synergy Computers representatives at Dynatrace Innovate Singapore 2026",
    },
  ],
  href: "https://www.dynatrace.com/",
  resourceSlug: "dynatrace-partner-in-pakistan",
  /** Landing hero (mockup) */
  hero: {
    titleLead: "See",
    titleGradientA: "Everything.",
    titleMid: "Miss",
    titleGradientB: "Nothing.",
    subtitle: "AI-powered observability for modern digital operations.",
    features: [
      { label: "AI-Powered", icon: "sparkles" as const },
      { label: "Real-Time Observability", icon: "activity" as const },
      { label: "Enterprise Scale", icon: "building" as const },
    ],
    primaryCta: { label: "Explore Dynatrace", href: "#capabilities" },
    secondaryCta: { label: "Talk to an Expert", href: "/contact" },
  },
  challenge: {
    eyebrow: "The Challenge",
    title: "Digital complexity is growing.",
    items: [
      {
        title: "Applications",
        description:
          "Microservices, APIs, and cloud-native stacks make it hard to see where performance breaks.",
        icon: "code" as const,
        tone: "purple" as const,
      },
      {
        title: "Infrastructure",
        description:
          "Hybrid and multi-cloud environments create blind spots across hosts, containers, and networks.",
        icon: "server" as const,
        tone: "blue" as const,
      },
      {
        title: "User Experience",
        description:
          "Customers feel every slowdown — but teams often learn too late from tickets, not telemetry.",
        icon: "user" as const,
        tone: "pink" as const,
      },
    ],
  },
  approach: {
    eyebrow: "Our Approach",
    title: "Dynatrace technology. Synergy expertise.",
    steps: [
      {
        kind: "dynatrace" as const,
        title: "Dynatrace",
        description: "Powerful observability platform.",
      },
      {
        kind: "synergy" as const,
        title: "Synergy",
        description: "Implementation, integration & optimization.",
      },
      {
        kind: "business" as const,
        title: "Your Business",
        description: "Better performance, smarter decisions.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Powerful Capabilities",
    title: "Comprehensive visibility. Deeper insights.",
    items: [
      {
        title: "Application Performance Monitoring",
        description: "Trace every transaction end-to-end with precise root-cause analysis.",
      },
      {
        title: "Infrastructure Monitoring",
        description: "Unify cloud, hybrid, and on-prem signals in one observability layer.",
      },
      {
        title: "Digital Experience Monitoring",
        description: "Protect customer journeys with real-user and synthetic insights.",
      },
      {
        title: "AI-Powered Analytics",
        description: "Davis AI detects, prioritizes, and explains issues before they escalate.",
      },
      {
        title: "Smartscape Topology",
        description: "Auto-discover dependencies across apps, services, and infrastructure.",
      },
    ],
    linkLabel: "Explore all capabilities",
    linkHref: "/contact",
  },
  impact: {
    eyebrow: "Business Impact",
    title: "From monitoring to measurable outcomes.",
    items: [
      {
        title: "Faster Resolution",
        description: "Cut MTTR with AI-guided causation instead of manual war rooms.",
        icon: "clock" as const,
        tone: "purple" as const,
      },
      {
        title: "Lower Downtime",
        description: "Catch degradations early and protect revenue-critical services.",
        icon: "shield" as const,
        tone: "blue" as const,
      },
      {
        title: "Better Performance",
        description: "Optimize apps and infrastructure with continuous, precise telemetry.",
        icon: "chart" as const,
        tone: "pink" as const,
      },
      {
        title: "Smarter Decisions",
        description: "Give leaders clear signals for capacity, risk, and digital investment.",
        icon: "bulb" as const,
        tone: "orange" as const,
      },
    ],
  },
  cta: {
    title: "Ready to transform your digital operations?",
    description:
      "See how Dynatrace and Synergy can drive real impact for your business.",
    buttonLabel: "Talk to our experts",
    buttonHref: "/contact",
  },
  /** Compact capability cards used on /partners index spotlight */
  capabilityCards: [
    {
      title: "Application Performance",
      description: "End-to-end visibility across complex applications with AI-driven root cause analysis.",
    },
    {
      title: "Infrastructure Monitoring",
      description: "Unified observability across cloud, hybrid, and on-premises environments.",
    },
    {
      title: "Digital Experience",
      description: "Real-user monitoring and session insights to protect customer-facing services.",
    },
    {
      title: "AI-Powered Automation",
      description: "Davis AI engine for proactive detection, causation, and intelligent operations.",
    },
  ],
  highlights: [
    { value: "1", label: "Exclusive partner in Pakistan" },
    { value: "40+", label: "Years of enterprise IT delivery" },
    { value: "24×7", label: "Implementation & support" },
  ],
} as const;
