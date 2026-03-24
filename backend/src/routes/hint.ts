import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { aiProvider as defaultAiProvider } from "../ai/index.js";
import type { AiProvider } from "../ai/types.js";
import {
  problemRepository as defaultProblemRepository,
  type ProblemRepository,
} from "../problems/problem-repository.js";
import { aiRateLimit } from "../middleware/ai-rate-limit.js";
import { validateBody } from "../middleware/validate-body.js";
import { hintRequestSchema, type HintRequestBody } from "../validation/ai-request-schemas.js";
import { generateHint } from "../hint/hint-service.js";

type HintServiceDeps = {
  aiProvider: AiProvider;
  problemRepository: ProblemRepository;
};

export interface HintRouterDeps {
  aiProvider?: AiProvider;
  problemRepository?: ProblemRepository;
  rateLimitMiddleware?: RequestHandler;
}

async function handleHint(
  request: HintRequestBody,
  response: Response,
  deps: HintServiceDeps,
) {
  const hint = await generateHint(request, deps);
  response.status(200).json(hint);
}

export function createHintRouter(deps: HintRouterDeps = {}) {
  const aiProvider = deps.aiProvider ?? defaultAiProvider;
  const problemRepository = deps.problemRepository ?? defaultProblemRepository;
  const rateLimitMiddleware = deps.rateLimitMiddleware ?? aiRateLimit;

  const router = Router();

  router.post(
    "/",
    rateLimitMiddleware,
    validateBody(hintRequestSchema),
    (req: Request, res: Response, next: NextFunction) => {
      void handleHint(req.body as HintRequestBody, res, { aiProvider, problemRepository }).catch(next);
    },
  );

  return router;
}

export const hintRouter = createHintRouter();
