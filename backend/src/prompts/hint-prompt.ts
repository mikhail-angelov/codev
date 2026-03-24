import type { AiMessage } from "../ai/types.js";
import type { ProblemPublicRecord } from "../problems/problem-repository.js";

export type HintPromptMode =
  | "approach"
  | "complexity"
  | "edge-cases"
  | "explain-current-code";

export interface HintPromptInput {
  problem: ProblemPublicRecord;
  currentCode: string;
  mode: HintPromptMode;
}

export interface HintPromptPayload {
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
}

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

function getModeInstructions(mode: HintPromptMode): string {
  switch (mode) {
    case "approach":
      return [
        "Give a focused hint about the next algorithmic step.",
        "Do not reveal a full solution.",
        "Point the candidate toward the key pattern or invariant they should notice.",
      ].join(" ");
    case "complexity":
      return [
        "Explain the time and space complexity of the likely approach.",
        "Keep the answer interview-style and practical.",
        "If useful, mention how to defend the complexity tradeoff.",
      ].join(" ");
    case "edge-cases":
      return [
        "Call out the most important edge cases the candidate should verify.",
        "Focus on correctness pitfalls instead of code style.",
        "Do not rewrite the solution.",
      ].join(" ");
    case "explain-current-code":
      return [
        "Explain the candidate's current code in clear, plain language.",
        "Describe what each meaningful block is doing and where the risks are.",
        "Do not propose a new solution unless it is necessary to clarify the current one.",
      ].join(" ");
  }
}

function buildModePrompt(mode: HintPromptMode): string {
  const modeLabel = mode.replace(/-/g, " ");

  return [
    `Hint mode: ${modeLabel}.`,
    getModeInstructions(mode),
    "Return a single valid JSON object only.",
    'Use this shape: { "mode": string, "hint": string, "whyItHelps": string, "nextStep": string }',
    'Set "mode" to the requested hint mode.',
    '"hint" should be concise and directly useful.',
    '"whyItHelps" should justify the hint in one sentence.',
    '"nextStep" should tell the candidate what to try next.',
    "Do not wrap the JSON in markdown fences or add extra prose.",
  ].join(" ");
}

export function buildHintPrompt({
  problem,
  currentCode,
  mode,
}: HintPromptInput): HintPromptPayload {
  const systemMessage: AiMessage = {
    role: "system",
    content: [
      "You are Codev's technical interview hint coach.",
      "Be concise, precise, and grounded in the current problem and code.",
      "Keep the answer actionable and avoid giving away a complete solution.",
      "Return only JSON that matches the requested shape.",
    ].join(" "),
  };

  const userMessage: AiMessage = {
    role: "user",
    content: [
      "Provide a hint based on the problem context and the candidate's current code.",
      "",
      formatProblemContext(problem),
      "",
      "Current code:",
      currentCode,
      "",
      buildModePrompt(mode),
    ].join("\n"),
  };

  return {
    messages: [systemMessage, userMessage],
    temperature: 0.2,
    maxTokens: 500,
  };
}
