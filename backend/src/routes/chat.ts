import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { aiProvider as defaultAiProvider } from "../ai/index.js";
import type { AiProvider } from "../ai/types.js";
import {
  problemRepository as defaultProblemRepository,
  type ProblemRepository,
} from "../problems/problem-repository.js";
import { aiRateLimit } from "../middleware/ai-rate-limit.js";
import { validateBody } from "../middleware/validate-body.js";
import { chatRequestSchema, type ChatRequestBody } from "../validation/ai-request-schemas.js";
import { generateChat } from "../chat/chat-service.js";

type ChatServiceDeps = {
  aiProvider: AiProvider;
  problemRepository: ProblemRepository;
};

export interface ChatRouterDeps {
  aiProvider?: AiProvider;
  problemRepository?: ProblemRepository;
  rateLimitMiddleware?: RequestHandler;
}

async function handleChat(
  request: ChatRequestBody,
  response: Response,
  deps: ChatServiceDeps,
) {
  const chat = await generateChat(request, deps);
  response.status(200).json(chat);
}

export function createChatRouter(deps: ChatRouterDeps = {}) {
  const aiProvider = deps.aiProvider ?? defaultAiProvider;
  const problemRepository = deps.problemRepository ?? defaultProblemRepository;
  const rateLimitMiddleware = deps.rateLimitMiddleware ?? aiRateLimit;

  const router = Router();

  router.post(
    "/",
    rateLimitMiddleware,
    validateBody(chatRequestSchema),
    (req: Request, res: Response, next: NextFunction) => {
      void handleChat(req.body as ChatRequestBody, res, { aiProvider, problemRepository }).catch(next);
    },
  );

  return router;
}

export const chatRouter = createChatRouter();
