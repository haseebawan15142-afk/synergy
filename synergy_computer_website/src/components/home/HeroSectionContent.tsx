"use client";

import { PremiumTitle } from "@/components/effects/PremiumTitle";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { heroItem, imageReveal, staggerContainer } from "@/lib/motion/variants";
import { siteConfig } from "@/lib/content/site";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

const trustPoints = ["Enterprise SLAs", "Karachi HQ + branches", "Global vendor partners"];

const stats = [
  { value: "40+", label: "Years" },
  { value: "300+", label: "Clients" },
  { value: "200+", label: "Specialists" },
  { value: "24×7", label: "Support" },
];

export function HeroSectionContent() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="relative z-10 page-container grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:py-24">
        <HeroCopy />
        <HeroPanel animateCounters={false} />
      </div>
    );
  }

  return (
    <motion.div
      className="relative z-10 page-container grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:py-24"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div
        className="text-center lg:col-span-7 lg:text-left"
        variants={staggerContainer}
      >
        <motion.span
          variants={heroItem}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-synergy-glow backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-synergy-light animate-pulse" />
          Technology partner · Pakistan
        </motion.span>
        <motion.div variants={heroItem}>
          <PremiumTitle
            as="h1"
            id="hero-heading"
            variant="hero"
            className="text-hero mt-5 font-bold text-white sm:mt-6"
          >
            Modern IT that scales with{" "}
            <span className="text-gradient-live">your ambition</span>
          </PremiumTitle>
        </motion.div>
        <motion.p
          variants={heroItem}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:mt-6 sm:text-lg lg:mx-0"
        >
          {siteConfig.description}
        </motion.p>
        <motion.div
          variants={heroItem}
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start"
        >
          <Button href="/contact" size="lg" className="w-full sm:w-auto">
            Start a conversation
          </Button>
          <Button
            href="/services"
            variant="secondary"
            size="lg"
            className="w-full border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-synergy-light hover:bg-white/15 hover:text-white sm:w-auto"
          >
            Explore services
          </Button>
        </motion.div>
        <motion.ul
          variants={heroItem}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
        >
          {trustPoints.map((point) => (
            <li
              key={point}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur-sm"
            >
              {point}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div className="hidden lg:col-span-5 lg:block" variants={imageReveal}>
        <HeroPanel animateCounters />
      </motion.div>
    </motion.div>
  );
}

function HeroCopy() {
  return (
    <div className="text-center lg:col-span-7 lg:text-left">
      <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-synergy-glow backdrop-blur-sm sm:px-4 sm:text-xs">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-synergy-light animate-pulse" />
        Technology partner · Pakistan
      </span>
      <PremiumTitle
        as="h1"
        id="hero-heading"
        variant="hero"
        shimmer={false}
        className="text-hero mt-5 font-bold text-white sm:mt-6"
      >
        Modern IT that scales with <span className="text-gradient-live">your ambition</span>
      </PremiumTitle>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:mt-6 sm:text-lg lg:mx-0">
        {siteConfig.description}
      </p>
      <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
        <Button href="/contact" size="lg" className="w-full sm:w-auto">
          Start a conversation
        </Button>
        <Button
          href="/services"
          variant="secondary"
          size="lg"
          className="w-full border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-synergy-light hover:bg-white/15 hover:text-white sm:w-auto"
        >
          Explore services
        </Button>
      </div>
      <ul className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        {trustPoints.map((point) => (
          <li
            key={point}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur-sm"
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroPanel({ animateCounters }: { animateCounters?: boolean }) {
  return (
    <div className="glass-panel animate-float rounded-3xl p-6 shadow-glow">
      <p className="text-xs font-bold uppercase tracking-widest text-synergy">At a glance</p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        {stats.map((item) => (
          <div key={item.label} className="glass-card rounded-2xl bg-surface-muted/50 p-4">
            <dt className="text-2xl font-bold text-ink">
              {animateCounters ? <AnimatedCounter value={item.value} /> : item.value}
            </dt>
            <dd className="text-sm text-ink-muted">{item.label}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm leading-relaxed text-ink-body">
        Infrastructure, security, cloud, and managed services — delivered with the same logo and
        values you trust, in a experience built for today.
      </p>
    </div>
  );
}
