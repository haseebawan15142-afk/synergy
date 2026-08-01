import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/Reveal";
import { PremiumTitle } from "@/components/effects/PremiumTitle";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/60 bg-surface-elevated/80 section-y-tight",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-synergy/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />
      <Reveal className="page-container max-w-3xl" variant="fadeUp">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">Synergy Computers</p>
        <PremiumTitle
          as="h1"
          variant="section"
          className="text-page-title mt-3 font-bold text-ink"
        >
          {title}
        </PremiumTitle>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-body sm:mt-5 sm:text-lg">
            {description}
          </p>
        ) : null}
      </Reveal>
    </div>
  );
}
