import { describe, expect, it } from "vitest";
import { executeVisibleSampleTests } from "./sample-test-runner";
import { createVisibleSampleTestExecutionRequest } from "./sample-tests";

const twoSumProblem = {
  id: 1,
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "easy" as const,
  topic: "Arrays",
  description: "",
  examples: [],
  constraints: [],
  starterTemplate: "",
  hints: [],
  sampleTests: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
    },
    {
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]",
    },
  ],
};

describe("executeVisibleSampleTests", () => {
  it("reports passing results", () => {
    const summary = executeVisibleSampleTests(
      twoSumProblem,
      createVisibleSampleTestExecutionRequest(
        twoSumProblem,
        "function twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i += 1) { const complement = target - nums[i]; if (seen.has(complement)) return [seen.get(complement), i]; seen.set(nums[i], i); } return []; }",
      ),
    );

    expect(summary.passedCount).toBe(2);
    expect(summary.failedCount).toBe(0);
    expect(summary.errorCount).toBe(0);
  });

  it("reports failing results", () => {
    const summary = executeVisibleSampleTests(
      twoSumProblem,
      createVisibleSampleTestExecutionRequest(twoSumProblem, "function twoSum() { return []; }"),
    );

    expect(summary.failedCount).toBe(2);
    expect(summary.failureMessages[0]).toContain("expected [0,1]");
  });

  it("reports runtime errors", () => {
    const summary = executeVisibleSampleTests(
      twoSumProblem,
      createVisibleSampleTestExecutionRequest(twoSumProblem, "function twoSum() { throw new Error('boom'); }"),
    );

    expect(summary.errorCount).toBe(2);
    expect(summary.runtimeError).toBe("boom");
  });
});
