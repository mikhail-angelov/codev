import { afterEach, describe, expect, it } from "vitest";
import { createSeedThreadMessages } from "../lib/ai-thread";
import { resetAppStore, useAppStore } from "./app-store";

afterEach(() => {
  resetAppStore();
});

describe("app store", () => {
  it("tracks per-problem state and the active thread session", () => {
    const store = useAppStore.getState();

    store.setSelectedProblemId(7);
    store.setEditorValue(7, "function solve() {}");
    store.setSampleTestSummary(7, {
      scope: "visible-sample-tests",
      problemId: 7,
      totalCount: 2,
      passedCount: 1,
      failedCount: 1,
      errorCount: 0,
      failureMessages: ["Sample 2 failed"],
      runtimeError: null,
      results: [],
    });
    store.setSessionStartedAt(7, 1_000);
    store.ensureThreadSession(7);
    store.setThreadDraft(7, "Need a hint");
    store.setThreadMessages(7, createSeedThreadMessages());
    store.setThreadLoadingState(7, { kind: "hint", label: "Requesting hint..." });

    expect(useAppStore.getState().selectedProblemId).toBe(7);
    expect(useAppStore.getState().editorValues[7]).toBe("function solve() {}");
    expect(useAppStore.getState().sampleTestSummaries[7]?.passedCount).toBe(1);
    expect(useAppStore.getState().sessionStartedAtByProblem[7]).toBe(1_000);
    expect(useAppStore.getState().threadSessionsByProblem[7]?.draft).toBe("Need a hint");
    expect(useAppStore.getState().threadSessionsByProblem[7]?.loadingState).toEqual({
      kind: "hint",
      label: "Requesting hint...",
    });
  });

  it("resets the thread session without touching stored per-problem work", () => {
    const store = useAppStore.getState();

    store.setEditorValue(7, "function solve() {}");
    store.setSampleTestSummary(7, {
      scope: "visible-sample-tests",
      problemId: 7,
      totalCount: 1,
      passedCount: 1,
      failedCount: 0,
      errorCount: 0,
      failureMessages: [],
      runtimeError: null,
      results: [],
    });
    store.setSessionStartedAt(7, 1_000);
    store.ensureThreadSession(7);
    store.setThreadDraft(7, "Question");
    store.setThreadLoadingState(7, { kind: "chat", label: "Sending message..." });
    store.resetThreadSession(7);

    expect(useAppStore.getState().editorValues[7]).toBe("function solve() {}");
    expect(useAppStore.getState().sampleTestSummaries[7]?.totalCount).toBe(1);
    expect(useAppStore.getState().sessionStartedAtByProblem[7]).toBe(1_000);
    expect(useAppStore.getState().threadSessionsByProblem[7]?.messages).toHaveLength(2);
    expect(useAppStore.getState().threadSessionsByProblem[7]?.messages[0]?.kind).toBe("system");
    expect(useAppStore.getState().threadSessionsByProblem[7]?.messages[1]?.kind).toBe("ai-chat");
    expect(useAppStore.getState().threadSessionsByProblem[7]?.draft).toBe("");
    expect(useAppStore.getState().threadSessionsByProblem[7]?.loadingState).toBeNull();
  });

  it("keeps thread state isolated per problem", () => {
    const store = useAppStore.getState();

    store.ensureThreadSession(7);
    store.ensureThreadSession(15);
    store.setThreadDraft(7, "Need help with arrays");
    store.setThreadDraft(15, "Need help with strings");

    expect(useAppStore.getState().threadSessionsByProblem[7]?.draft).toBe("Need help with arrays");
    expect(useAppStore.getState().threadSessionsByProblem[15]?.draft).toBe("Need help with strings");
  });

  it("stores review usefulness feedback locally on the matching review message", () => {
    const store = useAppStore.getState();

    store.ensureThreadSession(7);
    store.appendThreadMessages(7, {
      id: "review-1",
      kind: "review",
      timestamp: 1,
      usefulnessFeedback: null,
      review: {
        correctness: "Looks good.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        improvements: ["Call out the invariant."],
        followUp: "What changes if duplicates appear?",
      },
    });

    store.setReviewFeedback(7, "review-1", "up");

    const reviewMessage = useAppStore.getState().threadSessionsByProblem[7]?.messages.find(
      (message) => message.kind === "review" && message.id === "review-1",
    );

    expect(reviewMessage).toMatchObject({
      id: "review-1",
      usefulnessFeedback: "up",
    });
  });
});
