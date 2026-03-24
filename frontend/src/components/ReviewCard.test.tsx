import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ReviewCard from "./ReviewCard";

describe("ReviewCard", () => {
  it("renders a structured review with formatted code spans", () => {
    render(
      <ReviewCard
        loading={false}
        error={null}
        review={{
          correctness: "Use `Map` to track complements.",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          improvements: ["Name the `target` lookup clearly.", "Keep the `seen` map scoped to the loop."],
          followUp: "How would you adapt the `twoSum` approach\nfor a sorted input?",
        }}
      />,
    );

    expect(screen.getByText("Latest review")).toBeInTheDocument();
    expect(screen.getByText("Review ready")).toBeInTheDocument();
    expect(screen.getByText("Complete", { selector: ".review-card-status" })).toBeInTheDocument();
    expect(screen.getByText("Correctness")).toBeInTheDocument();
    expect(screen.getByText("Time complexity")).toBeInTheDocument();
    expect(screen.getByText("Space complexity")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => Boolean(element?.tagName === "DD" && element.textContent === "Use Map to track complements.")),
    ).toBeInTheDocument();
    expect(screen.getByText("Map", { selector: "code" })).toBeInTheDocument();
    expect(screen.getByText("target", { selector: "code" })).toBeInTheDocument();
    expect(screen.getByText("twoSum", { selector: "code" })).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => Boolean(element?.classList.contains("review-follow-up"))),
    ).toBeInTheDocument();
  });

  it("renders loading, error, and empty states", () => {
    const { rerender } = render(<ReviewCard loading={true} error={null} review={null} />);

    expect(screen.getByText("Submitting for review...")).toBeInTheDocument();
    expect(screen.getByText("Loading", { selector: ".review-card-status" })).toBeInTheDocument();

    rerender(<ReviewCard loading={false} error={"Failed to submit review (503)"} review={null} />);

    expect(screen.getByText("Review failed")).toBeInTheDocument();
    expect(screen.getByText("Failed to submit review (503)")).toBeInTheDocument();
    expect(screen.getByText("Error", { selector: ".review-card-status" })).toBeInTheDocument();

    rerender(<ReviewCard loading={false} error={null} review={null} />);

    expect(screen.getByText("Submit your solution to receive a review.")).toBeInTheDocument();
    expect(screen.getByText("Waiting for submission")).toBeInTheDocument();
  });

  it("lets the user record lightweight usefulness feedback", () => {
    const onUsefulnessFeedback = vi.fn();

    render(
      <ReviewCard
        loading={false}
        error={null}
        usefulnessFeedback="up"
        onUsefulnessFeedback={onUsefulnessFeedback}
        review={{
          correctness: "Strong answer.",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          improvements: ["Clarify the invariant."],
          followUp: "What edge case would you test next?",
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Helpful" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Not helpful" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Not helpful" }));

    expect(onUsefulnessFeedback).toHaveBeenCalledWith("down");
  });
});
