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

  const llm = await replyFromLlm(trimmed);

  if (llm.reply) {
    return NextResponse.json({
      reply: llm.reply,
      source: "llm",
      provider: llm.provider,
    });
  }

  if (!hasLlmConfigured()) {
    return NextResponse.json({
      reply: `AI chat is not connected yet on this server. Add a free API key to \`.env.local\` (see \`.env.example\`) — recommended: GROQ_API_KEY from console.groq.com — then restart \`npm run dev\`.\n\nQuick answer from our site:\n\n${replyFromLocalKnowledge(userText)}`,
      source: "local",
      provider: null,
      needsApiKey: true,
    });
  }

  return NextResponse.json({
    reply: `The AI service is temporarily unavailable. Please try again or contact us at info@synergy.net.pk.\n\n${replyFromLocalKnowledge(userText)}`,
    source: "local",
    provider: null,
  });
}
