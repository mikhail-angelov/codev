import type { AiMessage } from "../ai/types.js";
import type { ProblemPublicRecord } from "../problems/problem-repository.js";

export interface SampleTestSummary {
  passedCount: number;
  failedCount: number;
  failureMessages: string[];
}

export interface ReviewPromptInput {
  problem: ProblemPublicRecord;
  currentCode: string;
  sampleTestSummary?: SampleTestSummary;
}

export interface ReviewPromptPayload {
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
  const sampleTests = problem.sampleTests
    .map((test, index) => {
      const description = test.description ? `\n  description: ${test.description}` : "";

      return [
        `Sample test ${index + 1}:`,
        `  input: ${test.input}`,
        `  expectedOutput: ${test.expectedOutput}`,
        description,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

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
    "",
    "Visible sample tests:",
    sampleTests,
  ].join("\n");
}

function formatSampleTestSummary(summary: SampleTestSummary): string {
  const failureMessages = summary.failureMessages.length
    ? summary.failureMessages.map((message) => `- ${message}`).join("\n")
    : "- None";

  return [
    "Visible sample test result summary:",
    `- passedCount: ${summary.passedCount}`,
    `- failedCount: ${summary.failedCount}`,
    `- failureMessages:`,
    failureMessages,
  ].join("\n");
}

export function buildReviewPrompt({
  problem,
  currentCode,
  sampleTestSummary,
}: ReviewPromptInput): ReviewPromptPayload {
  const systemMessage: AiMessage = {
    role: "system",
    content: [
      "You are Codev's technical interview reviewer.",
      "Be direct, specific, and interview-style.",
      "Return a single valid JSON object only.",
      "The JSON must include isCorrect, correctness, timeComplexity, spaceComplexity, improvements, and followUp.",
      "Set isCorrect to true only when the submitted solution is correct overall, not just partially correct.",
      "improvements must be an array with 1 to 2 concrete items.",
      "Do not wrap the JSON in markdown fences or prose.",
      "Avoid generic praise and do not mention policies or hidden reasoning.",
      "Keep the output concise but useful.",
    ].join(" "),
  };

  const userMessageParts = [
    "Review the candidate's solution against the problem context below.",
    "",
    formatProblemContext(problem),
    "",
    "Candidate code:",
    currentCode,
  ];

  if (sampleTestSummary) {
    userMessageParts.push("", formatSampleTestSummary(sampleTestSummary));
  }

  userMessageParts.push(
    "",
    "Respond in a structured format with these sections:",
    "1. Correctness",
    "2. Time complexity",
    "3. Space complexity",
    "4. Improvements",
    "5. Follow-up question",
    "",
    "Return JSON with this shape:",
    '{ "isCorrect": boolean, "correctness": string, "timeComplexity": string, "spaceComplexity": string, "improvements": [string], "followUp": string }',
  );

  const userMessage: AiMessage = {
    role: "user",
    content: userMessageParts.join("\n"),
  };

  return {
    messages: [systemMessage, userMessage],
    temperature: 0.2,
    maxTokens: 900,
  };
}
