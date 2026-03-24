import { describe, expect, it } from "vitest";
import { buildReviewPrompt } from "../src/prompts/review-prompt.js";
import { problemRepository } from "../src/problems/problem-repository.js";

describe("review prompt", () => {
  it("builds a deterministic payload with the required review sections", () => {
    const problem = problemRepository.getById(1);

    if (!problem) {
      throw new Error("Expected seeded problem 1 to exist");
    }

    const payload = buildReviewPrompt({
      problem,
      currentCode: "function twoSum(nums, target) { return []; }",
    });

    expect(payload.temperature).toBe(0.2);
    expect(payload.maxTokens).toBe(900);
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[0]).toEqual(
      expect.objectContaining({
        role: "system",
      }),
    );
    expect(payload.messages[0].content).toContain("correctness");
    expect(payload.messages[0].content).toContain("timeComplexity");
    expect(payload.messages[0].content).toContain("spaceComplexity");
    expect(payload.messages[0].content).toContain("followUp");
    expect(payload.messages[0].content).toContain("valid JSON object only");
    expect(payload.messages[1].content).toContain("Problem: Two Sum");
    expect(payload.messages[1].content).toContain("Candidate code:");
    expect(payload.messages[1].content).toContain("function twoSum(nums, target)");
    expect(payload.messages[1].content).toContain("Visible sample tests:");
    expect(payload.messages[1].content).toContain("Respond in a structured format");
    expect(payload.messages[1].content).toContain('"improvements": [string]');
  });

  it("includes sample test summary details when provided", () => {
    const problem = problemRepository.getById(1);

    if (!problem) {
      throw new Error("Expected seeded problem 1 to exist");
    }

    const payload = buildReviewPrompt({
      problem,
      currentCode: "function twoSum(nums, target) { return []; }",
      sampleTestSummary: {
        passedCount: 1,
        failedCount: 2,
        failureMessages: ["Expected [0,1] but received []"],
      },
    });

    expect(payload.messages[1].content).toContain("Visible sample test result summary:");
    expect(payload.messages[1].content).toContain("passedCount: 1");
    expect(payload.messages[1].content).toContain("failedCount: 2");
    expect(payload.messages[1].content).toContain("Expected [0,1] but received []");
  });
});
