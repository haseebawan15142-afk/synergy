import { PremiumTitle } from "@/components/effects/PremiumTitle";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn(centered && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">{eyebrow}</p>
      ) : null}
      <PremiumTitle
        as="h2"
        id={id}
        variant="section"
        className={cn("text-section-title font-bold text-ink", eyebrow && "mt-2")}
      >
        {title}
      </PremiumTitle>
      {description ? (
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed text-ink-body sm:text-base",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
