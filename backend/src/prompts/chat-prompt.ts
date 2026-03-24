import type { AiMessage } from "../ai/types.js";
import type { ProblemPublicRecord } from "../problems/problem-repository.js";

export interface ChatPromptInput {
  problem: ProblemPublicRecord;
  currentCode: string;
  currentUserMessage: string;
  recentMessages: AiMessage[];
}

export interface ChatPromptPayload {
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
}

export const MAX_RECENT_MESSAGES = 12;

function formatProblemContext(problem: ProblemPublicRecord): string {
  const examples = problem.examples
    .map((example, index) => {
      const note = example.note ? `\n  note: ${example.note}` : "";

      return [
        `Example ${index + 1}:`,
        `  input: ${example.input}`,
        `  output: ${example.output}`,
        note,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const constraints = problem.constraints.map((constraint) => `- ${constraint}`).join("\n");
  const hints = problem.hints.map((hint, index) => `${index + 1}. ${hint}`).join("\n");

  return [
    `Problem: ${problem.title}`,
    `Slug: ${problem.slug}`,
    `Difficulty: ${problem.difficulty}`,
    `Topic: ${problem.topic}`,
    "",
    "Description:",
    problem.description,
    "",
    "Examples:",
    examples,
    "",
    "Constraints:",
    constraints,
    "",
    "Hints:",
    hints,
  ].join("\n");
}

function trimRecentMessages(messages: AiMessage[]): AiMessage[] {
  if (messages.length <= MAX_RECENT_MESSAGES) {
    return messages.map((message) => ({ ...message }));
  }

  return messages.slice(-MAX_RECENT_MESSAGES).map((message) => ({ ...message }));
}

export function buildChatPrompt({
  problem,
  currentCode,
  currentUserMessage,
  recentMessages,
}: ChatPromptInput): ChatPromptPayload {
  const trimmedMessages = trimRecentMessages(recentMessages);

  const systemMessage: AiMessage = {
    role: "system",
    content: [
      "You are Codev's technical interview chat assistant.",
      "Stay grounded in the selected problem and the candidate's current code.",
      "Use the recent conversation context when answering follow-up questions.",
      "Keep responses concise, interview-style, and directly useful.",
      "Do not invent new requirements or ignore the existing solution context.",
      "Return a single valid JSON object only.",
      'Use this shape: { "reply": string, "focus": string, "nextStep": string }',
      '"reply" should answer the user clearly and concretely.',
      '"focus" should summarize the main point of the answer in a few words.',
      '"nextStep" should suggest the next action the candidate should take.',
      "Do not wrap the JSON in markdown fences or add extra prose.",
    ].join(" "),
  };

  const userMessage: AiMessage = {
    role: "user",
    content: [
      "Answer the user's latest question using the problem context, current code, and the trimmed recent thread below.",
      "",
      formatProblemContext(problem),
      "",
      "Current code:",
      currentCode,
      "",
      "Latest user question:",
      currentUserMessage,
      "",
      `Recent thread messages (most recent ${MAX_RECENT_MESSAGES} max, oldest first):`,
      JSON.stringify(trimmedMessages, null, 2),
      "",
      "If the thread was trimmed, reason only from the messages shown above.",
      "Keep the answer scoped to this problem and code.",
    ].join("\n"),
  };

  return {
    messages: [systemMessage, userMessage],
    temperature: 0.3,
    maxTokens: 700,
  };
}

export { trimRecentMessages };
