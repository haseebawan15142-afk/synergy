"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Decorative Dynatrace-style dashboard mock for the partner hero. */
export function DynatraceDashboardMock() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
      initial={reduce ? false : { opacity: 0, y: 28, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
    >
      <div
        className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.45),transparent_65%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 top-10 h-40 w-40 rounded-full bg-[rgb(255,106,0,0.28)] blur-3xl"
        aria-hidden
      />

      <div className="relative rotate-[-2deg] rounded-2xl border border-white/15 bg-[#0d0b16]/95] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(124,58,237,0.25)] sm:p-4 lg:rotate-[-3deg]">
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
            Dynatrace · Live
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <MetricCard label="Service health" value="98.7%" tone="good" />
            <MetricCard label="Error rate" value="0.12%" tone="warn" />
            <MetricCard label="P95 latency" value="184ms" tone="info" />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Throughput
            </p>
            <svg viewBox="0 0 280 120" className="mt-2 h-28 w-full" aria-hidden>
              <defs>
                <linearGradient id="dt-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
                <linearGradient id="dt-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(167,139,250)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="rgb(167,139,250)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 90 C40 80, 60 40, 90 55 C120 70, 140 30, 170 42 C200 54, 230 20, 280 28 L280 120 L0 120 Z"
                fill="url(#dt-fill)"
              />
              <path
                d="M0 90 C40 80, 60 40, 90 55 C120 70, 140 30, 170 42 C200 54, 230 20, 280 28"
                fill="none"
                stroke="url(#dt-line)"
                strokeWidth="2.5"
              />
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-white/40">
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatusChip label="APM" status="Healthy" />
          <StatusChip label="Infra" status="Watch" />
          <StatusChip label="DEM" status="Healthy" />
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "info";
}) {
  const color =
    tone === "good" ? "text-emerald-400" : tone === "warn" ? "text-amber-300" : "text-sky-300";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function StatusChip({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-center">
      <p className="text-[10px] font-semibold text-white/70">{label}</p>
      <p className="mt-0.5 text-[10px] text-white/40">{status}</p>
    </div>
  );
}
