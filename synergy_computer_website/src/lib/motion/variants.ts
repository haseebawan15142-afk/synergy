import type { Variants } from "framer-motion";
import { motionDurations, motionEase } from "./transitions";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.reveal, ease: motionEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionDurations.reveal, ease: motionEase },
  },
};

export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.page, ease: motionEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionDurations.reveal, ease: motionEase },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: motionDurations.reveal, ease: motionEase },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: motionDurations.reveal, ease: motionEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: motionDurations.stagger, delayChildren: 0.05 },
  },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.page, ease: motionEase },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.reveal, ease: motionEase },
  },
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.03 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: motionEase },
  },
};

export const cardHover = {
  y: -7,
  scale: 1.02,
  transition: { duration: motionDurations.hover, ease: motionEase },
};

export const cardRest = {
  y: 0,
  scale: 1,
  transition: { duration: motionDurations.hover, ease: motionEase },
};

export type RevealVariant = "fadeUp" | "fadeIn" | "scaleIn" | "slideFromLeft" | "slideFromRight";

export const revealVariants: Record<RevealVariant, Variants> = {
  fadeUp,
  fadeIn,
  scaleIn,
  slideFromLeft,
  slideFromRight,
};
