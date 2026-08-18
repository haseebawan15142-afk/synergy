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
          DEFAULT: "rgb(var(--c-synergy-channels) / <alpha-value>)",
          dark: "rgb(var(--c-synergy-dark-channels) / <alpha-value>)",
          light: "#A78BFA",
          muted: "rgb(var(--c-synergy-muted) / <alpha-value>)",
          glow: "#C084FC",
        },
        accent: {
          DEFAULT: "rgb(var(--c-accent-channels) / <alpha-value>)",
          soft: "rgb(var(--c-accent-soft) / <alpha-value>)",
        },
        "on-synergy": "var(--color-on-synergy)",
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
        "gradient-brand":
          "linear-gradient(135deg, #7C3AED 0%, #C026D3 45%, #FF6A00 100%)",
        "gradient-dark": "linear-gradient(180deg, #05030A 0%, #0A0811 55%, #12101C 100%)",
        "gradient-cta": "linear-gradient(90deg, #7C3AED 0%, #C026D3 50%, #FF6A00 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "gradient-flow": "gradientFlow 7s ease-in-out infinite",
        "aurora-drift": "auroraDrift 18s ease-in-out infinite",
        "shimmer-pass": "shimmerPass 4.5s ease-in-out infinite",
        "partner-ticker": "partnerTicker 45s linear infinite",
        "logo-marquee": "logoMarquee 42s linear infinite",
        "logo-marquee-reverse": "logoMarqueeReverse 42s linear infinite",
        "logo-marquee-y": "logoMarqueeY 40s linear infinite",
        "logo-marquee-y-reverse": "logoMarqueeYReverse 40s linear infinite",
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
        logoMarquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        logoMarqueeReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        logoMarqueeY: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        logoMarqueeYReverse: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
