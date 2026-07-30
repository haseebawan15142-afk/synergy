import { Agent, CursorAgentError } from "@cursor/sdk";
import { buildChatSystemPrompt } from "@/lib/chat/system-prompt";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatConversation(messages: ChatMessage[], latestUser: string): string {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  return `${buildChatSystemPrompt()}

IMPORTANT: You are answering on the public website chat widget. Reply in clear plain text only. Do not edit files, run tools, or write code unless the visitor explicitly asks for a code sample. Keep answers concise (under 250 words unless they ask for detail).

${transcript ? `Conversation so far:\n${transcript}\n\n` : ""}Latest visitor message: ${latestUser}`;
}

function extractReply(result: {
  status: string;
  result?: string;
  error?: { message?: string };
}): string | null {
  if (result.status === "finished" && result.result?.trim()) {
    return result.result.trim();
  }
  if (result.status === "error") {
    console.error("[cursor-agent] run error", result.error?.message);
  }
  return null;
}

export async function replyFromCursorAgent(
  messages: ChatMessage[],
  latestUser: string,
  agentId?: string,
): Promise<{ reply: string | null; agentId?: string }> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    return { reply: null };
  }

  const modelId = process.env.CURSOR_AGENT_MODEL?.trim() || "auto";
  const cloudOptions = {
    apiKey,
    cloud: { env: { type: "cloud" as const } },
    model: { id: modelId },
    name: "Synergy Website Assistant",
  };

  try {
    if (agentId?.startsWith("bc-")) {
      const agent = await Agent.resume(agentId, { apiKey });
      try {
        const run = await agent.send(latestUser);
        const result = await run.wait();
        const reply = extractReply(result);
        return { reply, agentId: agent.agentId };
      } finally {
        await agent[Symbol.asyncDispose]();
      }
    }

    const prompt = formatConversation(messages.slice(0, -1), latestUser);
    const agent = await Agent.create(cloudOptions);
    try {
      const run = await agent.send(prompt);
      const result = await run.wait();
      const reply = extractReply(result);
      return { reply, agentId: agent.agentId };
    } finally {
      await agent[Symbol.asyncDispose]();
    }
  } catch (err) {
    if (err instanceof CursorAgentError) {
      console.error("[cursor-agent] startup", err.message, "retryable=", err.isRetryable);
    } else {
      console.error("[cursor-agent]", err);
    }
    return { reply: null, agentId };
  }
}
