import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AIThreadPanel from "./AIThreadPanel";
import {
  createAssistantChatThreadMessage,
  createHintThreadMessage,
  createReviewThreadMessage,
  createSystemThreadMessage,
  createUserChatThreadMessage,
} from "../lib/ai-thread";

const hintResponse = {
  mode: "approach" as const,
  hint: "Start with the invariant.",
  whyItHelps: "It keeps the algorithm grounded in what must always be true.",
  nextStep: "Write the invariant down before filling in the loop.",
};

function defineScrollIntoViewMock() {
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
  return scrollIntoView;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AIThreadPanel", () => {
  it("renders mixed thread messages and the loading state", () => {
    const reviewMessage = createReviewThreadMessage({
      correctness: "Looks correct.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      improvements: ["State the invariant explicitly."],
      followUp: "How would you handle duplicates?",
    });
    reviewMessage.usefulnessFeedback = "up";

    render(
      <AIThreadPanel
        messages={[
          createSystemThreadMessage("Thread ready."),
          createHintThreadMessage(hintResponse),
          createUserChatThreadMessage("Am I close?"),
          createAssistantChatThreadMessage("Yes, but tighten the invariant."),
          reviewMessage,
        ]}
        loadingState={{
          kind: "review",
          label: "Submitting for review...",
        }}
        draft="What am I missing?"
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
        onHintClick={vi.fn()}
        onReviewFeedback={vi.fn()}
      />,
    );

    expect(screen.getByRole("log", { name: /AI conversation/i })).toBeInTheDocument();
    expect(screen.getByText("Thread ready.")).toBeInTheDocument();
    expect(screen.getByText("Hint · Approach")).toBeInTheDocument();
    expect(screen.getByText(hintResponse.hint)).toBeInTheDocument();
    expect(screen.getByText(hintResponse.whyItHelps)).toBeInTheDocument();
    expect(screen.getByText(hintResponse.nextStep)).toBeInTheDocument();
    expect(screen.getByText("Am I close?")).toBeInTheDocument();
    expect(screen.getByText("Yes, but tighten the invariant.")).toBeInTheDocument();
    expect(screen.getByText("Looks correct.")).toBeInTheDocument();
    expect(
      screen.getByText("Submitting for review...", { selector: ".ai-thread-loading-copy" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("What am I missing?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Helpful" })).toHaveAttribute("aria-pressed", "true");
  });

  it("dispatches hint button clicks with the expected modes", () => {
    const onHintClick = vi.fn();

    render(
      <AIThreadPanel
        messages={[createSystemThreadMessage("Thread ready.")]}
        loadingState={null}
        draft=""
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
        onHintClick={onHintClick}
        onReviewFeedback={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Approach$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Complexity$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Edge cases$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Explain current code$/i }));

    expect(onHintClick).toHaveBeenNthCalledWith(1, "approach");
    expect(onHintClick).toHaveBeenNthCalledWith(2, "complexity");
    expect(onHintClick).toHaveBeenNthCalledWith(3, "edge-cases");
    expect(onHintClick).toHaveBeenNthCalledWith(4, "explain-current-code");
  });

  it("renders structured chat replies with focus and next steps", () => {
    render(
      <AIThreadPanel
        messages={[
          createSystemThreadMessage("Thread ready."),
          createAssistantChatThreadMessage({
            reply: "You're close.",
            focus: "Keep the window invariant tight.",
            nextStep: "Trace the duplicate case once more.",
          }),
        ]}
        loadingState={null}
        draft=""
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
        onHintClick={vi.fn()}
        onReviewFeedback={vi.fn()}
      />,
    );

    expect(screen.getByText("You're close.")).toBeInTheDocument();
    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("Keep the window invariant tight.")).toBeInTheDocument();
    expect(screen.getByText("Next step")).toBeInTheDocument();
    expect(screen.getByText("Trace the duplicate case once more.")).toBeInTheDocument();
  });

  it("auto-scrolls when the thread grows", () => {
    const scrollIntoView = defineScrollIntoViewMock();
    const { rerender } = render(
      <AIThreadPanel
        messages={[createSystemThreadMessage("Thread ready.")]}
        loadingState={null}
        draft=""
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
        onHintClick={vi.fn()}
        onReviewFeedback={vi.fn()}
      />,
    );

    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockClear();

    rerender(
      <AIThreadPanel
        messages={[
          createSystemThreadMessage("Thread ready."),
          createUserChatThreadMessage("Another message."),
        ]}
        loadingState={{
          kind: "chat",
          label: "Sending chat...",
        }}
        draft=""
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
        onHintClick={vi.fn()}
        onReviewFeedback={vi.fn()}
      />,
    );

    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("dispatches review usefulness feedback from the thread card", () => {
    const onReviewFeedback = vi.fn();
    const reviewMessage = createReviewThreadMessage({
      correctness: "Looks correct.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      improvements: ["State the invariant explicitly."],
      followUp: "How would you handle duplicates?",
    });

    render(
      <AIThreadPanel
        messages={[reviewMessage]}
        loadingState={null}
        draft=""
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
        onHintClick={vi.fn()}
        onReviewFeedback={onReviewFeedback}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Helpful" }));

    expect(onReviewFeedback).toHaveBeenCalledWith(reviewMessage.id, "up");
  });
});
