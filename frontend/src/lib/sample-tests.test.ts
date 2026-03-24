import { describe, expect, it } from "vitest";
import {
  VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE,
  createVisibleSampleTestExecutionRequest,
  summarizeVisibleSampleTestResults,
} from "./sample-tests";

describe("visible sample test execution contract", () => {
  const problem = {
    id: 1,
    slug: "two-sum",
    sampleTests: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        description: "first example",
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
      },
    ],
  };

  it("builds a request constrained to the visible sample tests", () => {
    const request = createVisibleSampleTestExecutionRequest(problem, "function twoSum() {}");

    expect(request).toEqual({
      scope: VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE,
      problemId: 1,
      problemSlug: "two-sum",
      code: "function twoSum() {}",
      sampleTests: [
        {
          index: 0,
          input: "nums = [2,7,11,15], target = 9",
          expectedOutput: "[0,1]",
          description: "first example",
        },
        {
          index: 1,
          input: "nums = [3,2,4], target = 6",
          expectedOutput: "[1,2]",
        },
      ],
    });
  });

  it("summarizes pass/fail/error outcomes for the active problem only", () => {
    const summary = summarizeVisibleSampleTestResults(problem, [
      {
        index: 0,
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        status: "passed",
      },
      {
        index: 1,
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
        status: "failed",
        actualOutput: "[]",
      },
      {
        index: 2,
        input: "nums = [1,1,1], target = 2",
        expectedOutput: "[0,1]",
        status: "errored",
        runtimeError: "ReferenceError: nums is not defined",
      },
    ]);

    expect(summary).toEqual({
      scope: VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE,
      problemId: 1,
      totalCount: 3,
      passedCount: 1,
      failedCount: 1,
      errorCount: 1,
      failureMessages: [],
      runtimeError: null,
      results: [
        {
          index: 0,
          input: "nums = [2,7,11,15], target = 9",
          expectedOutput: "[0,1]",
          status: "passed",
        },
        {
          index: 1,
          input: "nums = [3,2,4], target = 6",
          expectedOutput: "[1,2]",
          status: "failed",
          actualOutput: "[]",
        },
        {
          index: 2,
          input: "nums = [1,1,1], target = 2",
          expectedOutput: "[0,1]",
          status: "errored",
          runtimeError: "ReferenceError: nums is not defined",
        },
      ],
    });
  });
});
