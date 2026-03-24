const API_BASE = (import.meta.env.VITE_API_URL ?? "/").replace(/\/$/, "");

export interface ReviewLatestTestSummary {
  passedCount: number;
  failedCount: number;
  failureMessages: string[];
}

export interface ReviewRequest {
  problemId: number;
  code: string;
  latestTestSummary?: ReviewLatestTestSummary;
}

export interface ReviewResponse {
  correctness: string;
  timeComplexity: string;
  spaceComplexity: string;
  improvements: string[];
  followUp: string;
}

export function buildReviewRequest(
  problemId: number,
  code: string,
  latestTestSummary?: ReviewLatestTestSummary,
): ReviewRequest {
  return {
    problemId,
    code,
    ...(latestTestSummary ? { latestTestSummary } : {}),
  };
}

export async function submitReview(request: ReviewRequest, signal?: AbortSignal): Promise<ReviewResponse> {
  const response = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to submit review (${response.status})`);
  }

  return (await response.json()) as ReviewResponse;
}
