import { NextResponse } from "next/server";
import { replyFromLocalKnowledge } from "@/lib/chat/local-assistant";
import { hasLlmConfigured, replyFromLlm } from "@/lib/chat/llm";
import { takeRateLimit } from "@/lib/security/rate-limit";
import { readLimitedJson } from "@/lib/security/read-limited-json";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Messages forwarded to the model / local assistant. */
const MAX_MESSAGES = 16;
/** Hard ceiling — larger arrays are treated as abuse (UI only needs a short window). */
const MAX_HISTORY_SUBMITTED = 40;
const MAX_MESSAGE_CHARS = 2000;
const MAX_BODY_BYTES = 48_000;
/** ~1 message every 3s average; bursts allowed within the window. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anon";
  return `chat:${ip}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMessages(body: unknown):
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string; status: number } {
  if (!isPlainObject(body)) {
    return { ok: false, error: "invalid_body", status: 400 };
  }

  const raw = body.messages;
  if (!Array.isArray(raw)) {
    return { ok: false, error: "messages_required", status: 400 };
  }

  if (raw.length === 0) {
    return { ok: false, error: "messages_required", status: 400 };
  }

  if (raw.length > MAX_HISTORY_SUBMITTED) {
    return { ok: false, error: "history_too_long", status: 400 };
  }

  const messages: ChatMessage[] = [];

  for (const item of raw) {
    if (!isPlainObject(item)) {
      return { ok: false, error: "invalid_message", status: 400 };
    }

    const role = item.role;
    const content = item.content;

    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "invalid_message", status: 400 };
    }
    if (typeof content !== "string") {
      return { ok: false, error: "invalid_message", status: 400 };
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return { ok: false, error: "invalid_message", status: 400 };
    }
    if (trimmed.length > MAX_MESSAGE_CHARS) {
      return { ok: false, error: "message_too_long", status: 400 };
    }

    messages.push({ role, content: trimmed });
  }

  if (!messages.some((m) => m.role === "user")) {
    return { ok: false, error: "messages_required", status: 400 };
  }

  return { ok: true, messages: messages.slice(-MAX_MESSAGES) };
}

export async function POST(request: Request) {
  const limited = takeRateLimit(clientKey(request), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const parsedBody = await readLimitedJson(request, MAX_BODY_BYTES);
  if (!parsedBody.ok) {
    const status = parsedBody.error === "payload_too_large" ? 413 : 400;
    return NextResponse.json({ error: parsedBody.error }, { status });
  }

  const parsed = parseMessages(parsedBody.value);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const trimmed = parsed.messages;
  const lastUser = [...trimmed].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content ?? "";

  // When Groq (or other LLM) is configured, use AI first — still constrained to Synergy facts via system prompt
  if (hasLlmConfigured()) {
    try {
      const llm = await replyFromLlm(trimmed);
      if (llm.reply) {
        return NextResponse.json({
          reply: llm.reply,
          source: "llm",
          provider: llm.provider,
        });
      }
    } catch {
      // Fall through to local knowledge — never surface provider/credential errors.
    }
  }

  const local = await replyFromLocalKnowledge(userText);
  return NextResponse.json({
    reply: local.reply,
    source: "local",
    provider: null,
    needsApiKey: !hasLlmConfigured(),
  });
}
