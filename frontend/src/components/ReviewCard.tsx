import type { ReactNode } from "react";
import type { ReviewResponse } from "../lib/review";

interface ReviewCardProps {
  review: ReviewResponse | null;
  loading: boolean;
  error: string | null;
  usefulnessFeedback?: "up" | "down" | null;
  onUsefulnessFeedback?: (feedback: "up" | "down") => void;
}

function renderRichText(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const segments = line.split(/(`[^`]+`)/g);

    segments.forEach((segment, segmentIndex) => {
      if (!segment) {
        return;
      }

      if (segment.startsWith("`") && segment.endsWith("`")) {
        nodes.push(
          <code key={`${keyPrefix}-line-${lineIndex}-segment-${segmentIndex}`} className="review-inline-code">
            {segment.slice(1, -1)}
          </code>,
        );
      } else {
        nodes.push(
          <span key={`${keyPrefix}-line-${lineIndex}-segment-${segmentIndex}`}>
            {segment}
          </span>,
        );
      }
    });

    if (lineIndex < lines.length - 1) {
      nodes.push(<br key={`${keyPrefix}-line-${lineIndex}-break`} />);
    }
  });

  return nodes;
}

function ReviewBody({
  review,
  usefulnessFeedback,
  onUsefulnessFeedback,
}: {
  review: ReviewResponse;
  usefulnessFeedback: "up" | "down" | null;
  onUsefulnessFeedback?: (feedback: "up" | "down") => void;
}) {
  return (
    <div className="review-card-body">
      <dl className="review-metrics">
        <div>
          <dt>Correctness</dt>
          <dd>{renderRichText(review.correctness, "correctness")}</dd>
        </div>
        <div>
          <dt>Time complexity</dt>
          <dd>{renderRichText(review.timeComplexity, "time-complexity")}</dd>
        </div>
        <div>
          <dt>Space complexity</dt>
          <dd>{renderRichText(review.spaceComplexity, "space-complexity")}</dd>
        </div>
      </dl>
      <div className="review-section">
        <div className="review-section-label">Improvements</div>
        <ul className="review-improvements">
          {review.improvements.map((improvement, index) => (
            <li key={`${index}-${improvement}`}>{renderRichText(improvement, `improvement-${index}`)}</li>
          ))}
        </ul>
      </div>
      <div className="review-section">
        <div className="review-section-label">Follow-up</div>
        <p className="review-follow-up">{renderRichText(review.followUp, "follow-up")}</p>
      </div>
      <div className="review-feedback" aria-label="Review usefulness feedback">
        <span className="review-feedback-label">Useful?</span>
        <button
          type="button"
          className={`review-feedback-button ui-button ui-button--ghost${usefulnessFeedback === "up" ? " active" : ""}`}
          aria-pressed={usefulnessFeedback === "up"}
          onClick={() => onUsefulnessFeedback?.("up")}
        >
          Helpful
        </button>
        <button
          type="button"
          className={`review-feedback-button ui-button ui-button--ghost${usefulnessFeedback === "down" ? " active" : ""}`}
          aria-pressed={usefulnessFeedback === "down"}
          onClick={() => onUsefulnessFeedback?.("down")}
        >
          Not helpful
        </button>
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
  loading,
  error,
  usefulnessFeedback = null,
  onUsefulnessFeedback,
}: ReviewCardProps) {
  const title = loading ? "Submitting..." : error ? "Review failed" : review ? "Review ready" : "Waiting for submission";
  const statusLabel = loading ? "Loading" : error ? "Error" : review ? "Complete" : "Idle";

  return (
    <section className="review-card ui-card" aria-live="polite">
      <div className="review-card-header">
        <div>
          <div className="review-card-label">Latest review</div>
          <div className="review-card-title">{title}</div>
        </div>
        <div
          className={`review-card-status ${loading ? "review-card-status--loading" : error ? "review-card-status--error" : "review-card-status--idle"}`}
        >
          {statusLabel}
        </div>
      </div>

      {loading ? (
        <p className="review-card-copy">Submitting for review...</p>
      ) : error ? (
        <p className="review-card-error">{error}</p>
      ) : review ? (
        <ReviewBody
          review={review}
          usefulnessFeedback={usefulnessFeedback}
          onUsefulnessFeedback={onUsefulnessFeedback}
        />
      ) : (
        <p className="review-card-copy">Submit your solution to receive a review.</p>
      )}
    </section>
  );
}

export default ReviewCard;
