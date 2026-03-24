import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkspacePanel from "./WorkspacePanel";

const problem = {
  id: 1,
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "easy" as const,
  topic: "Arrays",
  description: "Find two numbers that add up to the target.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      note: "nums[0] + nums[1] = 2 + 7 = 9",
    },
  ],
  constraints: ["Exactly one valid answer exists"],
  starterTemplate: "function twoSum(nums, target) {\n  return [];\n}",
  hints: ["Use a hash map."],
  sampleTests: [],
};

describe("WorkspacePanel", () => {
  it("wires the action bar state and timer display", () => {
    const onResetEditor = vi.fn();
    const onRunSampleTests = vi.fn();
    const onSubmitForReview = vi.fn();

    render(
      <WorkspacePanel
        summary={problem}
        problem={problem}
        loading={false}
        error={null}
        editorValue={"function twoSum(nums, target) {\n  return [0, 1];\n}"}
        elapsedLabel="12:34"
        canResetEditor={true}
        canRunSampleTests={true}
        canSubmitForReview={true}
        sampleTestSummary={null}
        onEditorChange={vi.fn()}
        onResetEditor={onResetEditor}
        onRunSampleTests={onRunSampleTests}
        onSubmitForReview={onSubmitForReview}
      />,
    );

    expect(screen.getByLabelText(/Elapsed time 12:34/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Reset$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Run tests$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Submit & review$/i }));

    expect(onResetEditor).toHaveBeenCalledTimes(1);
    expect(onRunSampleTests).toHaveBeenCalledTimes(1);
    expect(onSubmitForReview).toHaveBeenCalledTimes(1);
  });

  it("renders sample test results with pass/fail/error states", () => {
    render(
      <WorkspacePanel
        summary={problem}
        problem={problem}
        loading={false}
        error={null}
        editorValue={"function twoSum(nums, target) {\n  return [0, 1];\n}"}
        elapsedLabel="00:42"
        canResetEditor={true}
        canRunSampleTests={true}
        canSubmitForReview={true}
        sampleTestSummary={{
          scope: "visible-sample-tests",
          problemId: 1,
          totalCount: 3,
          passedCount: 1,
          failedCount: 1,
          errorCount: 1,
          failureMessages: [
            "Sample 2: expected [1,2] but received []",
            "Sample 3: ReferenceError: nums is not defined",
          ],
          runtimeError: "ReferenceError: nums is not defined",
          results: [
            {
              index: 0,
              input: "nums = [2,7,11,15], target = 9",
              expectedOutput: "[0,1]",
              status: "passed",
              actualOutput: "[0,1]",
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
        }}
        onEditorChange={vi.fn()}
        onResetEditor={vi.fn()}
        onRunSampleTests={vi.fn()}
        onSubmitForReview={vi.fn()}
      />,
    );

    expect(screen.getByText("Latest sample test run")).toBeInTheDocument();
    expect(screen.getByText("Passed 1 · Failed 1 · Errors 1")).toBeInTheDocument();
    expect(screen.getByText("Runtime error", { selector: ".sample-test-summary-badge" })).toBeInTheDocument();
    expect(screen.getByText("Sample 1")).toBeInTheDocument();
    expect(screen.getByText("passed")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.getByText("errored")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return Boolean(
          element?.classList.contains("sample-test-summary-runtime") &&
            content.includes("ReferenceError: nums is not defined"),
        );
      }),
    ).toBeInTheDocument();
  });

  it("renders examples and constraints after the editor section", () => {
    const { container } = render(
      <WorkspacePanel
        summary={problem}
        problem={problem}
        loading={false}
        error={null}
        editorValue={"function twoSum(nums, target) {\n}"}
        elapsedLabel="00:42"
        canResetEditor={true}
        canRunSampleTests={true}
        canSubmitForReview={true}
        sampleTestSummary={null}
        onEditorChange={vi.fn()}
        onResetEditor={vi.fn()}
        onRunSampleTests={vi.fn()}
        onSubmitForReview={vi.fn()}
      />,
    );

    const editorSection = container.querySelector(".editor-section");
    const examplesSection = container.querySelector(".examples-section");
    const constraintsSection = container.querySelector(".constraints-section");

    expect(editorSection).not.toBeNull();
    expect(examplesSection).not.toBeNull();
    expect(constraintsSection).not.toBeNull();
    expect(
      editorSection && examplesSection
        ? editorSection.compareDocumentPosition(examplesSection) & Node.DOCUMENT_POSITION_FOLLOWING
        : 0,
    ).toBeTruthy();
  });
});
