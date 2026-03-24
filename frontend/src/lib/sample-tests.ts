import type { ProblemDetail, ProblemSampleTest } from "./problems";

export const VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE = "visible-sample-tests" as const;

export type VisibleSampleTestExecutionScope = typeof VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE;

export type VisibleSampleTestStatus = "passed" | "failed" | "errored";

export interface VisibleSampleTestInput extends ProblemSampleTest {
  index: number;
}

export interface VisibleSampleTestResult extends VisibleSampleTestInput {
  status: VisibleSampleTestStatus;
  actualOutput?: string;
  runtimeError?: string;
}

export interface VisibleSampleTestExecutionRequest {
  scope: VisibleSampleTestExecutionScope;
  problemId: number;
  problemSlug: string;
  code: string;
  sampleTests: VisibleSampleTestInput[];
}

export interface VisibleSampleTestExecutionSummary {
  scope: VisibleSampleTestExecutionScope;
  problemId: number;
  totalCount: number;
  passedCount: number;
  failedCount: number;
  errorCount: number;
  failureMessages: string[];
  runtimeError: string | null;
  results: VisibleSampleTestResult[];
}

function cloneVisibleSampleTestInput(sampleTest: ProblemSampleTest, index: number): VisibleSampleTestInput {
  return {
    index,
    input: sampleTest.input,
    expectedOutput: sampleTest.expectedOutput,
    ...(sampleTest.description ? { description: sampleTest.description } : {}),
  };
}

export function createVisibleSampleTestExecutionRequest(
  problem: Pick<ProblemDetail, "id" | "slug" | "sampleTests">,
  code: string,
): VisibleSampleTestExecutionRequest {
  return {
    scope: VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE,
    problemId: problem.id,
    problemSlug: problem.slug,
    code,
    sampleTests: problem.sampleTests.map((sampleTest, index) => cloneVisibleSampleTestInput(sampleTest, index)),
  };
}

export function summarizeVisibleSampleTestResults(
  problem: Pick<ProblemDetail, "id">,
  results: VisibleSampleTestResult[],
): VisibleSampleTestExecutionSummary {
  let passedCount = 0;
  let failedCount = 0;
  let errorCount = 0;

  for (const result of results) {
    if (result.status === "passed") {
      passedCount += 1;
    } else if (result.status === "failed") {
      failedCount += 1;
    } else {
      errorCount += 1;
    }
  }

  return {
    scope: VISIBLE_SAMPLE_TEST_EXECUTION_SCOPE,
    problemId: problem.id,
    totalCount: results.length,
    passedCount,
    failedCount,
    errorCount,
    failureMessages: [],
    runtimeError: null,
    results: results.map((result) => ({ ...result })),
  };
}
