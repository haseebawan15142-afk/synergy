"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "default" | "lg";
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  primary:
    "bg-gradient-brand text-on-synergy shadow-card hover:shadow-glow hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy",
  secondary:
    "border border-border bg-surface-elevated text-ink shadow-soft hover:border-synergy/40 hover:text-synergy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy",
  ghost:
    "text-synergy hover:bg-synergy-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy",
  dark: "bg-slate-900 text-white shadow-soft hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy",
};

const sizes = {
  default: "min-h-11 px-6 py-2.5 text-sm",
  lg: "min-h-12 px-8 py-3 text-base",
};

const motionProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { duration: motionDurations.hover, ease: motionEase },
};

export function Button({
  href,
  variant = "primary",
  size = "default",
  className,
  children,
  loading,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const reduce = useReducedMotion();
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
    variants[variant],
    sizes[size],
    className,
  );

  const content = loading ? (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden
      />
      <span>Sending…</span>
    </span>
  ) : (
    children
  );

  if (href) {
    if (reduce) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }
    return (
      <motion.div className={cn("inline-flex", className?.includes("w-full") && "w-full")} {...motionProps}>
        <Link href={href} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (reduce) {
    return (
      <button type={type} className={classes} disabled={loading || disabled} {...props}>
        {content}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      disabled={loading || disabled}
      {...motionProps}
      {...(props as object)}
    >
      {content}
    </motion.button>
  );
}
