"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { motionDurations } from "@/lib/motion/transitions";

type NavLinkMotionProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
};

export function NavLinkMotion({ href, children, className, active, onClick }: NavLinkMotionProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("group relative", className)} onClick={onClick}>
      {children}
      <motion.span
        className="nav-underline-gradient absolute bottom-1 left-3 right-3 h-0.5 origin-left rounded-full xl:left-4 xl:right-4"
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: motionDurations.hover, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
    </Link>
  );
}
