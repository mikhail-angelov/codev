import { describe, expect, it } from "vitest";
import { formatElapsedTime, getProblemSessionActionState } from "./problem-session";

describe("problem session helpers", () => {
  it("formats elapsed time as mm:ss", () => {
    expect(formatElapsedTime(0)).toBe("00:00");
    expect(formatElapsedTime(61_000)).toBe("01:01");
    expect(formatElapsedTime(-5_000)).toBe("00:00");
  });

  it("derives button availability from the current session state", () => {
    const starterTemplate = "function solve() {}";

    expect(
      getProblemSessionActionState({
        activeProblem: { starterTemplate },
        editorValue: starterTemplate,
        isLoading: false,
        hasError: false,
      }),
    ).toEqual({
      canResetEditor: false,
      canRunSampleTests: true,
      canSubmitForReview: true,
    });

    expect(
      getProblemSessionActionState({
        activeProblem: { starterTemplate },
        editorValue: "function solve() { return 1; }",
        isLoading: false,
        hasError: false,
      }),
    ).toEqual({
      canResetEditor: true,
      canRunSampleTests: true,
      canSubmitForReview: true,
    });

    expect(
      getProblemSessionActionState({
        activeProblem: null,
        editorValue: starterTemplate,
        isLoading: false,
        hasError: false,
      }),
    ).toEqual({
      canResetEditor: false,
      canRunSampleTests: false,
      canSubmitForReview: false,
    });
  });
});

