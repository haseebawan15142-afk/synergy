import type { Partner } from "@/lib/content/partners";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";

export type PartnerLandingTone = "purple" | "blue" | "pink" | "orange";

export type PartnerLandingContent = {
  heroBg?: string;
  /** Dynatrace-style fixed headline; when set, taglines still show as feature chips */
  heroHeadline?: {
    titleLead: string;
    titleGradientA: string;
    titleMid: string;
    titleGradientB: string;
  };
  subtitle: string;
  features: string[];
  challenge: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string; tone: PartnerLandingTone }[];
  };
  approachTitle: string;
  capabilities: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string }[];
  };
  impact: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string; tone: PartnerLandingTone }[];
  };
  cta: {
    title: string;
    description: string;
  };
  showSmartscape?: boolean;
};

function firstSentence(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const m = cleaned.match(/^[^.!?]+[.!?]?/);
  return (m?.[0] || cleaned).trim();
}

function challengeFor(partner: Partner): PartnerLandingContent["challenge"] {
  const name = partner.name;
  const category = partner.category || "Technology";
  const cat = category.toLowerCase();

  if (cat.includes("observ")) {
    return {
      eyebrow: "The Challenge",
      title: "Digital complexity is growing.",
      items: [
        {
          title: "Applications",
          description: `Microservices and APIs make it hard to see where ${name} workloads break under load.`,
          tone: "purple",
        },
        {
          title: "Infrastructure",
          description: "Hybrid and multi-cloud environments create blind spots across hosts and networks.",
          tone: "blue",
        },
        {
          title: "User Experience",
          description: "Customers feel every slowdown — teams often learn too late from tickets, not telemetry.",
          tone: "pink",
        },
      ],
    };
  }

  if (cat.includes("secur") || cat.includes("crypt") || cat.includes("phishing") || cat.includes("awareness")) {
    return {
      eyebrow: "The Challenge",
      title: "Risk is rising across every channel.",
      items: [
        {
          title: "Threats",
          description: `Attackers target identities, keys, and people — ${name} helps close the gaps that matter.`,
          tone: "purple",
        },
        {
          title: "Compliance",
          description: "Regulated industries need auditable controls without slowing the business.",
          tone: "blue",
        },
        {
          title: "Operations",
          description: "Security tools only work when they are designed, deployed, and supported correctly.",
          tone: "pink",
        },
      ],
    };
  }

  if (cat.includes("stor") || cat.includes("data") || cat.includes("backup") || cat.includes("protect") || cat.includes("resilien")) {
    return {
      eyebrow: "The Challenge",
      title: "Data growth never slows down.",
      items: [
        {
          title: "Capacity",
          description: `Workloads expand faster than legacy platforms can absorb — ${name} is built for that pressure.`,
          tone: "purple",
        },
        {
          title: "Availability",
          description: "Downtime and restore failures put revenue and reputation at risk.",
          tone: "blue",
        },
        {
          title: "Complexity",
          description: "Hybrid estates need simpler operations without sacrificing performance.",
          tone: "pink",
        },
      ],
    };
  }

  if (cat.includes("erp") || cat.includes("board") || cat.includes("library") || cat.includes("automat") || cat.includes("itsm") || cat.includes("asset")) {
    return {
      eyebrow: "The Challenge",
      title: "Operations demand more clarity.",
      items: [
        {
          title: "Process drag",
          description: `Manual workflows and fragmented tools slow teams that ${name} is meant to streamline.`,
          tone: "purple",
        },
        {
          title: "Visibility",
          description: "Leaders need real-time insight across people, assets, and decisions.",
          tone: "blue",
        },
        {
          title: "Adoption",
          description: "Platforms only deliver value when rollout, training, and support are done right.",
          tone: "pink",
        },
      ],
    };
  }

  return {
    eyebrow: "The Challenge",
    title: `${category} demands stronger foundations.`,
    items: [
      {
        title: "Scale",
        description: `Growth puts pressure on platforms — ${name} helps enterprises stay ahead of demand.`,
        tone: "purple",
      },
      {
        title: "Reliability",
        description: "Mission-critical systems need architectures that hold under real-world load.",
        tone: "blue",
      },
      {
        title: "Delivery",
        description: "Technology only succeeds when local expertise designs, implements, and supports it.",
        tone: "pink",
      },
    ],
  };
}

function impactFor(partner: Partner): PartnerLandingContent["impact"] {
  const name = partner.name;
  return {
    eyebrow: "Business Impact",
    title: "From technology to measurable outcomes.",
    items: [
      {
        title: "Faster Outcomes",
        description: `Move from evaluation to production with Synergy-led ${name} delivery.`,
        tone: "purple",
      },
      {
        title: "Lower Risk",
        description: "Designs that prioritize resilience, security, and operational clarity.",
        tone: "blue",
      },
      {
        title: "Better Performance",
        description: `Align ${name} capabilities to the workloads that matter most for your business.`,
        tone: "pink",
      },
      {
        title: "Smarter Decisions",
        description: "Clear recommendations, local support, and a partner who stays through the lifecycle.",
        tone: "orange",
      },
    ],
  };
}

/** Build landing-page copy from partner CMS/local fields. */
export function buildPartnerLandingContent(partner: Partner): PartnerLandingContent {
  const slug = (partner.slug || "").toLowerCase();
  const solutions = (partner.keySolutions ?? []).filter(Boolean);
  const taglines = (partner.taglines ?? []).filter(Boolean);
  const features = (
    solutions.length ? solutions : taglines.length ? taglines : ["Enterprise Ready", "Local Delivery", "Lifecycle Support"]
  ).slice(0, 3);
  const overview = partner.overview?.trim() || "";
  const subtitle =
    partner.shortDescription?.trim() ||
    firstSentence(overview) ||
    `Synergy Computers partners with ${partner.name} to deliver enterprise outcomes in Pakistan.`;

  if (slug === "dynatrace") {
    return {
      heroBg: "/images/dynatrace/page-bg.png",
      heroHeadline: {
        titleLead: dynatracePartner.hero.titleLead,
        titleGradientA: dynatracePartner.hero.titleGradientA,
        titleMid: dynatracePartner.hero.titleMid,
        titleGradientB: dynatracePartner.hero.titleGradientB,
      },
      subtitle: dynatracePartner.hero.subtitle,
      features: dynatracePartner.hero.features.map((f) => f.label),
      challenge: {
        eyebrow: dynatracePartner.challenge.eyebrow,
        title: dynatracePartner.challenge.title,
        items: dynatracePartner.challenge.items.map((i) => ({
          title: i.title,
          description: i.description,
          tone: i.tone,
        })),
      },
      approachTitle: dynatracePartner.approach.title,
      capabilities: {
        eyebrow: dynatracePartner.capabilities.eyebrow,
        title: dynatracePartner.capabilities.title,
        items: dynatracePartner.capabilities.items.map((i) => ({
          title: i.title,
          description: i.description,
        })),
      },
      impact: {
        eyebrow: dynatracePartner.impact.eyebrow,
        title: dynatracePartner.impact.title,
        items: dynatracePartner.impact.items.map((i) => ({
          title: i.title,
          description: i.description,
          tone: i.tone,
        })),
      },
      cta: {
        title: dynatracePartner.cta.title,
        description: dynatracePartner.cta.description,
      },
      showSmartscape: true,
    };
  }

  const capabilityItems =
    solutions.length > 0
      ? solutions.map((title) => ({
          title,
          description: `Synergy designs, implements, and supports ${title.toLowerCase()} with ${partner.name} for Pakistani enterprises.`,
        }))
      : taglines.map((title) => ({
          title,
          description: `Explore how Synergy delivers ${title.toLowerCase()} with ${partner.name}.`,
        }));

  return {
    heroBg: partner.heroImageUrl?.trim() || undefined,
    subtitle,
    features,
    challenge: challengeFor(partner),
    approachTitle: `${partner.name} technology. Synergy expertise.`,
    capabilities: {
      eyebrow: "Powerful Capabilities",
      title: `${partner.name} capabilities. Synergy delivery.`,
      items: capabilityItems.slice(0, 6),
    },
    impact: impactFor(partner),
    cta: {
      title: `Ready to explore ${partner.name}?`,
      description: `See how ${partner.name} and Synergy can drive real impact for your business in Pakistan.`,
    },
    showSmartscape: false,
  };
}
