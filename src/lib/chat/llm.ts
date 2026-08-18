import { buildChatSystemPrompt } from "@/lib/chat/system-prompt";
import { buildLocalContextForQuery } from "@/lib/chat/local-assistant";
import type { ChatSiteKnowledge } from "@/lib/chat/site-knowledge";

export type LlmMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenAiStyleMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function toApiMessages(
  history: LlmMessage[],
  knowledge: ChatSiteKnowledge,
): OpenAiStyleMessage[] {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const userQuery = lastUser?.content ?? "";
  const localContext = buildLocalContextForQuery(userQuery, knowledge);

  return [
    {
      role: "system",
      content: `${buildChatSystemPrompt(knowledge, userQuery)}\n\n${localContext}`,
    },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];
}

async function chatGroq(
  history: LlmMessage[],
  knowledge: ChatSiteKnowledge,
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: toApiMessages(history, knowledge),
      max_tokens: 900,
      temperature: 0.25,
    }),
  });

  if (!res.ok) {
    console.error("[llm/groq] request failed", res.status);
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

async function chatGemini(
  history: LlmMessage[],
  knowledge: ChatSiteKnowledge,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const userQuery = lastUser?.content ?? "";

  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${buildChatSystemPrompt(knowledge, userQuery)}\n\n${buildLocalContextForQuery(userQuery, knowledge)}`,
            },
          ],
        },
        contents,
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 900,
        },
      }),
    },
  );

  if (!res.ok) {
    console.error("[llm/gemini] request failed", res.status);
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  return text?.trim() ?? null;
}

async function chatOpenRouter(
  history: LlmMessage[],
  knowledge: ChatSiteKnowledge,
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;

  const model =
    process.env.OPENROUTER_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct:free";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://synergy.net.pk",
      "X-Title": "Synergy Assistant",
    },
    body: JSON.stringify({
      model,
      messages: toApiMessages(history, knowledge),
      max_tokens: 900,
      temperature: 0.25,
    }),
  });

  if (!res.ok) {
    console.error("[llm/openrouter] request failed", res.status);
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export function hasLlmConfigured(): boolean {
  return !!(
    process.env.GROQ_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.OPENROUTER_API_KEY?.trim()
  );
}

/** Try Groq → Gemini → OpenRouter (first configured wins). */
export async function replyFromLlm(
  history: LlmMessage[],
  knowledge: ChatSiteKnowledge,
): Promise<{
  reply: string | null;
  provider: "groq" | "gemini" | "openrouter" | null;
}> {
  const groq = await chatGroq(history, knowledge);
  if (groq) return { reply: groq, provider: "groq" };

  const gemini = await chatGemini(history, knowledge);
  if (gemini) return { reply: gemini, provider: "gemini" };

  const openRouter = await chatOpenRouter(history, knowledge);
  if (openRouter) return { reply: openRouter, provider: "openrouter" };

  return { reply: null, provider: null };
}
