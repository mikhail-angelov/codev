import type { AIThreadMessage } from "./ai-thread";

const API_BASE = '/';

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  problemId: number;
  code: string;
  userMessage: string;
  recentMessages: ChatHistoryMessage[];
}

export interface ChatResponse {
  reply: string;
  focus: string;
  nextStep: string;
}

const MAX_RECENT_MESSAGES = 8;

function toThreadContextMessage(message: AIThreadMessage): ChatHistoryMessage | null {
  switch (message.kind) {
    case "system":
      return null;
    case "user-chat":
      return {
        role: "user",
        content: message.content,
      };
    case "ai-chat":
      return {
        role: "assistant",
        content:
          message.focus && message.nextStep
            ? [
                `Reply: ${message.content}`,
                `Focus: ${message.focus}`,
                `Next step: ${message.nextStep}`,
              ].join("\n")
            : message.content,
      };
    case "hint":
      return {
        role: "assistant",
        content: [
          `Hint (${message.hint.mode}): ${message.hint.hint}`,
          `Why it helps: ${message.hint.whyItHelps}`,
          `Next step: ${message.hint.nextStep}`,
        ].join("\n"),
      };
    case "review":
      return {
        role: "assistant",
        content: [
          "Review summary:",
          `Correctness: ${message.review.correctness}`,
          `Time complexity: ${message.review.timeComplexity}`,
          `Space complexity: ${message.review.spaceComplexity}`,
          `Improvements: ${message.review.improvements.join(" | ")}`,
          `Follow-up: ${message.review.followUp}`,
        ].join("\n"),
      };
  }
}

export function buildRecentChatMessages(
  messages: AIThreadMessage[],
  limit = MAX_RECENT_MESSAGES,
): ChatHistoryMessage[] {
  const boundedLimit = Math.max(0, Math.min(limit, MAX_RECENT_MESSAGES));

  return messages
    .map(toThreadContextMessage)
    .filter((message): message is ChatHistoryMessage => message !== null)
    .slice(-boundedLimit);
}

export function buildChatRequest(
  problemId: number,
  code: string,
  userMessage: string,
  messages: AIThreadMessage[],
): ChatRequest {
  return {
    problemId,
    code,
    userMessage,
    recentMessages: buildRecentChatMessages(messages),
  };
}

export async function submitChat(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to send chat (${response.status})`);
  }

  return (await response.json()) as ChatResponse;
}
