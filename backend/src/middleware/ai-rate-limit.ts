import rateLimit, { ipKeyGenerator, type Options as RateLimitOptions } from "express-rate-limit";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "../errors.js";

export interface AiRateLimitConfig {
  windowMs?: number;
  limit?: number;
}

function createBaseAiRateLimit(config: AiRateLimitConfig = {}): RequestHandler {
  const options: Partial<RateLimitOptions> = {
    windowMs: config.windowMs ?? 60 * 60 * 1000,
    limit: config.limit ?? 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (request) => ipKeyGenerator(request.ip ?? ""),
    handler: (_request, _response, next) => {
      next(new HttpError(429, "AI rate limit exceeded"));
    },
  };

  return rateLimit(options);
}

const defaultAiRateLimit = createBaseAiRateLimit();

export function aiRateLimit(request: Request, response: Response, next: NextFunction) {
  return defaultAiRateLimit(request, response, next);
}

export function createAiRateLimitMiddleware(config: AiRateLimitConfig = {}): RequestHandler {
  return createBaseAiRateLimit(config);
}
