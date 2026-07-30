"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm Synergy Assistant for Synergy Computers (Pvt.) Ltd.\n\nAsk me about:\n• IT services (backup, cloud, managed IT, on-site support)\n• Technology partners (Veritas, Dell, Dynatrace, etc.)\n• Industries we serve in Pakistan\n• Contact & quotes\n\nExample: \"What services do you offer?\"",
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: newId(), role: "user", content: text };
    const history = [...messages.filter((m) => m.id !== "welcome"), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await res.json()) as { reply?: string };
      const replyText =
        data.reply ??
        "I couldn't get an answer right now. Please email info@synergy.net.pk or visit our Contact page.";

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: replyText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: "Network error — please try again or contact us at info@synergy.net.pk.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px] sm:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "fixed bottom-4 right-4 z-[70] flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:right-6",
          open ? "w-[min(100vw-1.5rem,24rem)]" : "w-auto",
        )}
      >
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="chat-panel"
              initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: motionDurations.reveal, ease: motionEase }}
              className="mb-3 flex max-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-card"
              role="dialog"
              aria-labelledby="chat-title"
              aria-modal="true"
            >
            <header className="flex items-center justify-between gap-2 border-b border-border bg-gradient-brand px-4 py-3 text-on-synergy">
              <div>
                <p id="chat-title" className="text-sm font-bold">
                  Synergy Assistant
                </p>
                <p className="text-xs text-white/85">AI · Synergy Computers</p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-white/15"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
              aria-live="polite"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-synergy text-on-synergy"
                      : "mr-auto border border-border bg-surface-muted text-ink-body",
                  )}
                >
                  {m.content}
                </div>
              ))}
              {loading ? (
                <p className="text-xs text-ink-muted animate-pulse">Getting answer…</p>
              ) : null}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about services, support…"
                  className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-synergy focus:outline-none focus:ring-2 focus:ring-synergy/20"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={loading || !input.trim()}
                  className="shrink-0 rounded-xl bg-gradient-brand px-4 text-sm font-semibold text-on-synergy disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-center text-[0.65rem] text-ink-muted">
                AI can make mistakes.{" "}
                <Link href="/contact" className="font-semibold text-synergy hover:underline">
                  Contact a human
                </Link>
              </p>
            </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-on-synergy shadow-glow transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy",
            open && "ring-2 ring-synergy/40",
          )}
          aria-expanded={open}
          aria-label={open ? "Close Synergy Assistant" : "Open Synergy Assistant"}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ duration: motionDurations.hover, ease: motionEase }}
        >
          {open ? (
            <span className="text-2xl leading-none">×</span>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 8h10M7 12h6M5 18l1.5-4.5A2 2 0 0 1 8.4 12h7.2a2 2 0 0 1 1.9 1.5L19 18H5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </motion.button>
      </div>
    </>
  );
}
