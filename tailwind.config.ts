import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        surface: {
          DEFAULT: "rgb(var(--c-surface) / <alpha-value>)",
          muted: "rgb(var(--c-surface-muted) / <alpha-value>)",
          elevated: "rgb(var(--c-surface-elevated) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          secondary: "rgb(var(--c-ink-secondary) / <alpha-value>)",
          body: "rgb(var(--c-ink-body) / <alpha-value>)",
          muted: "rgb(var(--c-ink-muted) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--c-border) / <alpha-value>)",
          strong: "rgb(var(--c-border-strong) / <alpha-value>)",
        },
        synergy: {
          DEFAULT: "#357C3C",
          dark: "#2A813E",
          light: "#4ADE80",
          muted: "rgb(var(--c-synergy-muted) / <alpha-value>)",
          glow: "#86EFAC",
        },
        accent: {
          DEFAULT: "#14B8A6",
          soft: "rgb(var(--c-accent-soft) / <alpha-value>)",
        },
        "on-synergy": "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        glow: "0 0 40px -8px rgb(74 222 128 / 0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-hero": "var(--mesh-hero)",
        "gradient-brand": "linear-gradient(135deg, #357C3C 0%, #14B8A6 100%)",
        "gradient-dark": "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "gradient-flow": "gradientFlow 7s ease-in-out infinite",
        "aurora-drift": "auroraDrift 18s ease-in-out infinite",
        "shimmer-pass": "shimmerPass 4.5s ease-in-out infinite",
        "partner-ticker": "partnerTicker 45s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        gradientFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        auroraDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(4%, -3%) scale(1.05)" },
          "66%": { transform: "translate(-3%, 2%) scale(0.98)" },
        },
        shimmerPass: {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "45%": { opacity: "0.55" },
          "100%": { transform: "translateX(220%) skewX(-12deg)", opacity: "0" },
        },
        partnerTicker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
