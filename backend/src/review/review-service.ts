import type { AiProvider } from "../ai/types.js";
import { HttpError } from "../errors.js";
import type { ProblemRepository } from "../problems/problem-repository.js";
import { buildReviewPrompt } from "../prompts/review-prompt.js";
import type { ReviewRequestBody } from "../validation/ai-request-schemas.js";
import { parseReviewResponse, type ReviewResponse } from "./review-response.js";

export interface ReviewServiceDeps {
  aiProvider: AiProvider;
  problemRepository: ProblemRepository;
}

export async function generateReview(
  request: ReviewRequestBody,
  deps: ReviewServiceDeps,
): Promise<ReviewResponse> {
  const problem = deps.problemRepository.getById(request.problemId);

  if (!problem) {
    throw new HttpError(404, "Problem not found");
  }

  const prompt = buildReviewPrompt({
    problem,
    currentCode: request.code,
    sampleTestSummary: request.latestTestSummary,
  });

  const result = await deps.aiProvider.generateText(prompt);

  return parseReviewResponse(result.text);
}
