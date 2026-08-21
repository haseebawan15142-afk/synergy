"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useOverlayFocus } from "@/hooks/useOverlayFocus";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: number;
};

const WELCOME_CONTENT =
  "Hi — I'm Synergy Assistant for Synergy Computers (Pvt.) Ltd.\n\nAsk me about our IT services, technology partners, case studies, or how to get in touch for a quote.";

const QUICK_REPLIES = [
  "What services do you offer?",
  "Who are your partners?",
  "Get a quote",
  "Contact info",
];

const STORAGE_KEY = "synergy_chat_messages_v2";
const OPENED_KEY = "synergy_chat_opened_v1";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function welcomeMessage(): Message {
  return { id: "welcome", role: "assistant", content: WELCOME_CONTENT, time: Date.now() };
}

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Turns plain-text bot replies into readable JSX: bullet lists + clickable internal paths, URLs, and emails. */
function renderContent(text: string) {
  const linkRegex = /(https?:\/\/[^\s)]+)|(\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*)|([\w.+-]+@[\w-]+\.[a-z]{2,})/gi;

  const renderInline = (line: string, keyPrefix: string) => {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let i = 0;
    let match: RegExpExecArray | null;
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(line))) {
      if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
      const value = match[0];
      const key = `${keyPrefix}-${i++}`;
      if (match[1]) {
        nodes.push(
          <a
            key={key}
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-synergy underline underline-offset-2 hover:text-synergy-dark"
          >
            {value}
          </a>,
        );
      } else if (match[2]) {
        nodes.push(
          <Link
            key={key}
            href={value}
            className="font-medium text-synergy underline underline-offset-2 hover:text-synergy-dark"
          >
            {value}
          </Link>,
        );
      } else if (match[3]) {
        nodes.push(
          <a
            key={key}
            href={`mailto:${value}`}
            className="font-medium text-synergy underline underline-offset-2 hover:text-synergy-dark"
          >
            {value}
          </a>,
        );
      }
      lastIndex = match.index + value.length;
    }
    if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
    return nodes;
  };

  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (key: string) => {
    if (!bulletBuffer.length) return;
    blocks.push(
      <ul key={key} className="my-1 list-none space-y-1">
        {bulletBuffer.map((b, idx) => (
          <li key={idx} className="flex gap-1.5">
            <span className="mt-[3px] text-synergy">•</span>
            <span>{renderInline(b, `${key}-${idx}`)}</span>
          </li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  lines.forEach((line, idx) => {
    const bulletMatch = /^\s*[•\-]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      return;
    }
    flushBullets(`ul-${idx}`);
    if (line.trim() === "") {
      blocks.push(<div key={idx} className="h-2" aria-hidden />);
    } else {
      blocks.push(
        <p key={idx} className="leading-relaxed">
          {renderInline(line, `p-${idx}`)}
        </p>,
      );
    }
  });
  flushBullets("ul-end");

  return blocks;
}

function TypingIndicator() {
  return (
    <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-on-synergy">
        <Bot className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="flex items-center gap-1" aria-label="Synergy Assistant is typing">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" />
      </span>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(true);
  const reduce = useReducedMotion();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcomeMessage()]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const closeChat = useCallback(() => setOpen(false), []);

  useOverlayFocus({
    open,
    containerRef: dialogRef,
    triggerRef: launcherRef,
    onEscape: closeChat,
    trapFocus: true,
    // Prefer the message composer once the panel is up (hook focuses first control; we refine below).
    initialFocus: false,
  });

  // Load persisted conversation on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
      setHasOpenedBefore(window.localStorage.getItem(OPENED_KEY) === "1");
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist conversation whenever it changes.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // storage unavailable — fail silently
    }
  }, [messages, hydrated]);

  // Proactive greeting bubble for first-time visitors who haven't opened the chat yet.
  useEffect(() => {
    if (!hydrated || hasOpenedBefore || open) return;
    const t = setTimeout(() => setShowGreeting(true), 6000);
    return () => clearTimeout(t);
  }, [hydrated, hasOpenedBefore, open]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, [open]);

  const openChat = useCallback(() => {
    setOpen(true);
    setShowGreeting(false);
    if (!hasOpenedBefore) {
      setHasOpenedBefore(true);
      try {
        window.localStorage.setItem(OPENED_KEY, "1");
      } catch {
        // ignore
      }
    }
  }, [hasOpenedBefore]);

  const send = useCallback(
    async (override?: string) => {
      const text = (override ?? input).trim();
      if (!text || loading) return;

      const userMsg: Message = { id: newId(), role: "user", content: text, time: Date.now() };
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
          { id: newId(), role: "assistant", content: replyText, time: Date.now() },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: "Network error — please try again or contact us at info@synergy.net.pk.",
            time: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const clearChat = () => {
    const fresh = [welcomeMessage()];
    setMessages(fresh);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px] sm:hidden"
          aria-hidden
          onClick={closeChat}
        />
      ) : null}

      <div
        className={cn(
          "fixed bottom-4 z-[70] flex flex-col items-end pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6",
          open
            ? "inset-x-[max(0.75rem,env(safe-area-inset-left))] sm:inset-x-auto sm:right-6 sm:w-[min(100vw-1.5rem,24rem)]"
            : "right-[max(1rem,env(safe-area-inset-right))] w-auto sm:right-6",
        )}
      >
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              ref={dialogRef}
              key="chat-panel"
              initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: motionDurations.reveal, ease: motionEase }}
              id="synergy-chat-dialog"
              className="mb-3 flex max-h-[min(70vh,32rem)] w-full flex-col overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-card"
              role="dialog"
              aria-labelledby="chat-title"
              aria-modal="true"
              tabIndex={-1}
            >
              <header className="flex items-center justify-between gap-2 border-b border-border bg-gradient-brand px-4 py-3 text-on-synergy">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Bot className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p id="chat-title" className="text-sm font-bold">
                      Synergy Assistant
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/85">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
                      Online · AI · Synergy Computers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-white/15"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    onClick={clearChat}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-white/15"
                    aria-label="Close chat"
                    onClick={closeChat}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </header>

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn("flex max-w-[92%] items-end gap-2", m.role === "user" && "flex-row-reverse")}>
                      {m.role === "assistant" ? (
                        <span className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-on-synergy">
                          <Bot className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          "whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                          m.role === "user"
                            ? "bg-synergy text-on-synergy"
                            : "border border-border bg-surface-muted text-ink-body",
                        )}
                      >
                        {m.role === "assistant" ? renderContent(m.content) : m.content}
                      </div>
                    </div>
                    <span className={cn("text-[0.65rem] text-ink-muted", m.role === "assistant" && "ml-8")}>
                      {formatTime(m.time)}
                    </span>
                  </div>
                ))}
                {loading ? <TypingIndicator /> : null}
              </div>

              <div className="border-t border-border p-3">
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={loading}
                      onClick={() => void send(q)}
                      className="shrink-0 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-body transition hover:border-synergy hover:text-synergy disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <label htmlFor="synergy-chat-input" className="sr-only">
                    Message Synergy Assistant
                  </label>
                  <textarea
                    id="synergy-chat-input"
                    ref={inputRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask about services, support…"
                    aria-label="Message Synergy Assistant"
                    className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-synergy focus:outline-none focus:ring-2 focus:ring-synergy/20"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-brand px-4 text-sm font-semibold text-on-synergy disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Send</span>
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

        {!open ? (
          <AnimatePresence>
            {showGreeting ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: motionDurations.reveal, ease: motionEase }}
                className="mb-3 flex max-w-[15rem] items-start gap-2 rounded-2xl border border-border bg-surface-elevated p-3 pr-2 shadow-card"
              >
                <button type="button" onClick={openChat} className="flex flex-1 items-start gap-2 text-left">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-synergy" aria-hidden />
                  <span className="text-sm leading-snug text-ink-body">
                    Need help finding an IT service? Ask Synergy Assistant.
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Dismiss"
                  className="shrink-0 rounded-full p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
                  onClick={() => setShowGreeting(false)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        ) : null}

        <motion.button
          ref={launcherRef}
          type="button"
          onClick={() => (open ? closeChat() : openChat())}
          className={cn(
            "relative ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-on-synergy shadow-glow transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy",
            open && "ring-2 ring-synergy/40",
          )}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? "synergy-chat-dialog" : undefined}
          aria-label={open ? "Close Synergy Assistant" : "Open Synergy Assistant"}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ duration: motionDurations.hover, ease: motionEase }}
        >
          {!open && !hasOpenedBefore ? (
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400" />
            </span>
          ) : null}
          {open ? (
            <X className="h-6 w-6" aria-hidden />
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
