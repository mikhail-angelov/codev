import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { aiProvider as defaultAiProvider } from "../ai/index.js";
import type { AiProvider } from "../ai/types.js";
import { problemRepository as defaultProblemRepository, type ProblemRepository } from "../problems/problem-repository.js";
import { aiRateLimit } from "../middleware/ai-rate-limit.js";
import { validateBody } from "../middleware/validate-body.js";
import { reviewRequestSchema, type ReviewRequestBody } from "../validation/ai-request-schemas.js";
import { generateReview } from "../review/review-service.js";

type ReviewServiceDeps = {
  aiProvider: AiProvider;
  problemRepository: ProblemRepository;
};

export interface ReviewRouterDeps {
  aiProvider?: AiProvider;
  problemRepository?: ProblemRepository;
  rateLimitMiddleware?: RequestHandler;
}

async function handleReview(
  request: ReviewRequestBody,
  response: Response,
  deps: ReviewServiceDeps,
) {
  const review = await generateReview(request, deps);
  response.status(200).json(review);
}

export function createReviewRouter(deps: ReviewRouterDeps = {}) {
  const aiProvider = deps.aiProvider ?? defaultAiProvider;
  const problemRepository = deps.problemRepository ?? defaultProblemRepository;
  const rateLimitMiddleware = deps.rateLimitMiddleware ?? aiRateLimit;

  const router = Router();

  router.post(
    "/",
    rateLimitMiddleware,
    validateBody(reviewRequestSchema),
    (req: Request, res: Response, next: NextFunction) => {
      void handleReview(req.body as ReviewRequestBody, res, { aiProvider, problemRepository }).catch(next);
    },
  );

  return router;
}

export const reviewRouter = createReviewRouter();
