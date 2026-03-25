import { describe, expect, it, vi } from "vitest";
import type { AiProvider } from "../src/ai/types.js";
import { getHealth } from "../src/routes/health.js";
import { getProblemById, getProblems } from "../src/routes/problems.js";
import { generateReview } from "../src/review/review-service.js";
import { generateHint } from "../src/hint/hint-service.js";
import { generateChat } from "../src/chat/chat-service.js";
import { problemRepository } from "../src/problems/problem-repository.js";

function createResponse() {
  const state: {
    statusCode: number | null;
    body: unknown;
  } = {
    statusCode: null,
    body: null,
  };

  const response = {
    status(code: number) {
      state.statusCode = code;
      return {
        json(body: unknown) {
          state.body = body;
          return undefined;
        },
      };
    },
  };

  return { response, state };
}

function createSmokeAiProvider(): AiProvider {
  const responses = [
    JSON.stringify({
      isCorrect: false,
      correctness: "Smoke review response",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      improvements: ["Explain the invariant."],
      followUp: "What changes if duplicates appear?",
    }),
    JSON.stringify({
      mode: "approach",
      hint: "Use a hash map.",
      whyItHelps: "It gives constant-time lookups.",
      nextStep: "Track complements while scanning left to right.",
    }),
    JSON.stringify({
      reply: "Stay anchored to the current code path.",
      focus: "Invariant",
      nextStep: "Trace one failing case from start to finish.",
    }),
  ];

  return {
    generateText: vi.fn().mockImplementation(async () => ({
      text: responses.shift() ?? "",
      raw: {},
    })),
  };
}

describe("backend smoke flows", () => {
  it("covers the core MVP API loop", async () => {
    const aiProvider = createSmokeAiProvider();

    const health = createResponse();
    getHealth({} as never, health.response as never);
    expect(health.state.statusCode).toBe(200);
    expect(health.state.body).toEqual({
      ok: true,
      service: "codev-backend",
    });

    const problems = createResponse();
    getProblems({} as never, problems.response as never);
    expect(problems.state.statusCode).toBe(200);
    expect(problems.state.body).toHaveLength(15);

    const problemDetail = createResponse();
    getProblemById({ params: { id: "1" } } as never, problemDetail.response as never);
    expect(problemDetail.state.statusCode).toBe(200);
    expect(problemDetail.state.body).toMatchObject({
      id: 1,
      slug: "two-sum",
      title: "Two Sum",
      topic: "Arrays",
    });

    const review = await generateReview(
      {
        problemId: 1,
        code: "function twoSum(nums, target) { return []; }",
        latestTestSummary: {
          passedCount: 1,
          failedCount: 1,
          failureMessages: ["Sample 2 failed"],
        },
      },
      {
        aiProvider,
        problemRepository,
      },
    );
    expect(review).toEqual({
      isCorrect: false,
      correctness: "Smoke review response",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      improvements: ["Explain the invariant."],
      followUp: "What changes if duplicates appear?",
    });

    const hint = await generateHint(
      {
        problemId: 1,
        code: "function twoSum(nums, target) { return []; }",
        mode: "approach",
      },
      {
        aiProvider,
        problemRepository,
      },
    );
    expect(hint).toEqual({
      mode: "approach",
      hint: "Use a hash map.",
      whyItHelps: "It gives constant-time lookups.",
      nextStep: "Track complements while scanning left to right.",
    });

    const chat = await generateChat(
      {
        problemId: 1,
        code: "function twoSum(nums, target) { return []; }",
        userMessage: "Am I close?",
        recentMessages: [{ role: "assistant", content: "Use a hash map." }],
      },
      {
        aiProvider,
        problemRepository,
      },
    );
    expect(chat).toEqual({
      reply: "Stay anchored to the current code path.",
      focus: "Invariant",
      nextStep: "Trace one failing case from start to finish.",
    });

    expect(aiProvider.generateText).toHaveBeenCalledTimes(3);
  });
});
