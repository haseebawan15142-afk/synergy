import Link from "next/link";
import {
  Cloud,
  DatabaseBackup,
  Headset,
  LifeBuoy,
  Network,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { services, type Service } from "@/lib/content/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";
import { cn } from "@/lib/cn";

type Solution = {
  slug: Service["slug"];
  title: string;
  value: string;
  icon: LucideIcon;
};

const solutionMeta: Solution[] = [
  {
    slug: "on-site-it-support",
    title: "On-site IT support",
    value: "Certified engineers on your premises for deployment, troubleshooting, and day-to-day operations.",
    icon: Headset,
  },
  {
    slug: "network-infrastructure",
    title: "Network & infrastructure",
    value: "Design, modernize, and manage resilient networks that keep your business connected and secure.",
    icon: Network,
  },
  {
    slug: "data-backup-recovery",
    title: "Data backup & recovery",
    value: "Protect critical workloads with proven backup, replication, and fast recovery strategies.",
    icon: DatabaseBackup,
  },
  {
    slug: "microsoft-365-cloud",
    title: "Microsoft 365 & cloud",
    value: "Migrate, govern, and optimize cloud collaboration with Microsoft 365 and hybrid environments.",
    icon: Cloud,
  },
  {
    slug: "managed-it",
    title: "Managed IT & maintenance",
    value: "SLA-backed 24×7 monitoring and maintenance so your teams stay focused on core business.",
    icon: LifeBuoy,
  },
  {
    slug: "network-infrastructure",
    title: "Secure connectivity",
    value: "Enterprise-grade switching, routing, and perimeter security built for uptime and scale.",
    icon: ShieldCheck,
  },
  {
    slug: "managed-it",
    title: "Infrastructure operations",
    value: "Proactive patching, capacity planning, and health checks across your entire IT estate.",
    icon: ServerCog,
  },
  {
    slug: "data-backup-recovery",
    title: "Business continuity",
    value: "Disaster recovery runbooks and tested failover paths that minimize downtime and data loss.",
    icon: RefreshCw,
  },
];

const validSlugs = new Set(services.map((s) => s.slug));

const solutions = solutionMeta.filter((item) => validSlugs.has(item.slug));

export function SolutionsGrid() {
  return (
    <section
      className="relative overflow-hidden border-y border-slate-800/80 bg-slate-950 section-y"
      aria-labelledby="solutions-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-[0.04]" aria-hidden />

      <div className="page-container relative">
        <Reveal>
          <SectionHeading
            id="solutions-heading"
            eyebrow="Solutions"
            title="Technology that drives outcomes"
            description="Enterprise IT solutions designed for reliability, security, and measurable business value."
            className="[&_h2]:text-white [&_p:first-child]:text-slate-400 [&_p:last-child]:text-slate-500"
          />
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {solutions.map((solution, i) => {
            const Icon = solution.icon;
            return (
              <li key={`${solution.slug}-${i}`}>
                <MotionCard className="h-full">
                  <article
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/90",
                      "bg-slate-900/95 p-5 sm:p-6",
                      "transition duration-200",
                      "hover:border-slate-700",
                    )}
                  >
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-300 transition group-hover:border-slate-600 group-hover:text-white">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                    </div>

                    <h3 className="relative mt-4 text-base font-semibold text-white sm:text-lg">
                      {solution.title}
                    </h3>
                    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                      {solution.value}
                    </p>

                    <Link
                      href={`/services/${solution.slug}`}
                      className="relative mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-400 transition group-hover:text-slate-200"
                    >
                      Learn more
                      <span aria-hidden>→</span>
                    </Link>
                  </article>
                </MotionCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
