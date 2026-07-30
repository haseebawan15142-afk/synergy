import { NextResponse } from "next/server";
import { replyFromLocalKnowledge } from "@/lib/chat/local-assistant";
import { hasLlmConfigured, replyFromLlm } from "@/lib/chat/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 16;
const MAX_CHARS = 2000;

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = body.messages?.filter(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );

  if (!messages?.length) {
    return NextResponse.json({ error: "messages_required" }, { status: 400 });
  }

  const trimmed = messages.slice(-MAX_MESSAGES).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content.slice(0, MAX_CHARS),
  }));

  const lastUser = [...trimmed].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content ?? "";

  // When Groq (or other LLM) is configured, use AI first — still constrained to Synergy facts via system prompt
  if (hasLlmConfigured()) {
    const llm = await replyFromLlm(trimmed);
    if (llm.reply) {
      return NextResponse.json({
        reply: llm.reply,
        source: "llm",
        provider: llm.provider,
      });
    }
  }

  const local = replyFromLocalKnowledge(userText);
  return NextResponse.json({
    reply: local.reply,
    source: "local",
    provider: null,
    needsApiKey: !hasLlmConfigured(),
  });
}
