import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { companyProfileMeta, profileStats } from "@/lib/content/company-profile";

const statAccents = [
  "from-synergy/35 to-synergy/10",
  "from-accent/40 to-accent/10",
  "from-synergy/25 to-black/40",
  "from-accent/30 to-black/40",
] as const;

export function StorySection() {
  return (
    <section className="relative isolate overflow-hidden border-y border-white/10">
      <Image
        src="/images/home/story-section-bg.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[center_30%]"
        aria-hidden
        priority={false}
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#05030A]/90 via-[#05030A]/75 to-[#05030A]/60"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#05030A]/35" aria-hidden />

      <div className="page-container relative section-y">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <Reveal className="order-2 lg:order-1" variant="slideFromLeft">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e9d5ff]">Our story</p>
            <h2 className="text-section-title mt-2 font-display font-bold text-white">
              Four decades of enterprise technology leadership
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
              Synergy Computers (Pvt.) Ltd has been a trusted technology partner in Pakistan since{" "}
              {companyProfileMeta.foundedYear} — helping enterprises modernize, secure, and run critical
              IT.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-white/85 sm:text-base">
              Backed by {companyProfileMeta.teamSizeLabel} professionals and global technology alliances,
              we deliver as a one-window partner for secure, scalable IT.
            </p>
            <Button href="/about" variant="secondary" className="mt-8 w-full border-white/30 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
              About Synergy
            </Button>
          </Reveal>

          <div className="order-1 grid grid-cols-2 gap-3 sm:gap-4 lg:order-2 lg:gap-5">
            {profileStats.map((item, index) => (
              <MotionCard
                key={item.label}
                reveal
                className={`group rounded-2xl border border-white/20 bg-gradient-to-br ${statAccents[index % statAccents.length]} bg-[#05030A]/55 backdrop-blur-sm p-4 shadow-soft transition hover:-translate-y-1 hover:border-white/30 sm:p-6`}
              >
                <p className="font-display text-3xl font-bold text-white sm:text-4xl">
                  <AnimatedCounter value={item.value} />
                </p>
                <p className="mt-2 text-xs font-medium text-white/80 sm:text-sm">{item.label}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
