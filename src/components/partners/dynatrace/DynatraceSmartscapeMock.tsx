"use client";

import { motion, useReducedMotion } from "framer-motion";

const NODES = [
  { id: "apps", label: "Applications", value: "23", x: 18, y: 22 },
  { id: "infra", label: "Infrastructure", value: "142", x: 78, y: 18 },
  { id: "db", label: "Databases", value: "32", x: 82, y: 72 },
  { id: "svc", label: "Services", value: "87", x: 16, y: 74 },
] as const;

/** Decorative Smartscape-style topology visual. */
export function DynatraceSmartscapeMock() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0d0b16] p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)] sm:p-6"
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55 }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.28),transparent_58%)]"
        aria-hidden
      />
      <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#c4b5fd]">
        Smartscape
      </p>
      <p className="relative mt-1 text-sm text-white/55">Auto-discovered dependencies</p>

      <div className="relative mt-4 aspect-[4/3] w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="ss-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {NODES.map((n) => (
            <line
              key={n.id}
              x1="50"
              y1="48"
              x2={n.x}
              y2={n.y}
              stroke="url(#ss-line)"
              strokeWidth="0.45"
              strokeOpacity="0.75"
            />
          ))}
          <circle cx="50" cy="48" r="7" fill="rgb(124 58 237 / 0.35)" stroke="#c4b5fd" strokeWidth="0.6" />
          <circle cx="50" cy="48" r="3.2" fill="#a78bfa">
            {!reduce ? (
              <animate attributeName="r" values="2.8;3.6;2.8" dur="2.4s" repeatCount="indefinite" />
            ) : null}
          </circle>
        </svg>

        {NODES.map((n) => (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-[#151222]/95 px-2.5 py-1.5 text-center shadow-lg backdrop-blur-sm"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <p className="text-[10px] font-semibold text-white">{n.label}</p>
            <p className="text-[10px] tabular-nums text-[#c4b5fd]">{n.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
