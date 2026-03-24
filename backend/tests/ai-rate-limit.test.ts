import type { NextFunction, Request, Response, Router } from "express";
import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/error-handler.js";
import { aiRateLimit, createAiRateLimitMiddleware } from "../src/middleware/ai-rate-limit.js";
import { chatRouter } from "../src/routes/chat.js";
import { hintRouter } from "../src/routes/hint.js";
import { problemsRouter } from "../src/routes/problems.js";
import { reviewRouter } from "../src/routes/review.js";
import { healthRouter } from "../src/routes/health.js";

function createResponse() {
  const state: {
    statusCode: number | null;
    body: unknown;
  } = {
    statusCode: null,
    body: null,
  };

  const response = {
    headersSent: false,
    setHeader: vi.fn(),
    append: vi.fn(),
    getHeader: vi.fn(),
    status(code: number) {
      state.statusCode = code;
      return {
        json(body: unknown) {
          state.body = body;
          return undefined;
        },
      };
    },
  };

  return { response, state };
}

function callMiddleware(
  middleware: (req: Request, res: Response, next: NextFunction) => unknown,
  ip: string,
) {
  const req = {
    ip,
    method: "POST",
    originalUrl: "/review",
  } as Request;
  const { response, state } = createResponse();
  const next = vi.fn();

  const done = new Promise<void>((resolve) => {
    next.mockImplementation(() => resolve());
  });

  middleware(req, response as Response, next as unknown as NextFunction);

  return { req, response: response as Response, state, next, done };
}

function getPostMiddlewareNames(router: Router) {
  const layer = router.stack.find(
    (entry: { route?: { methods?: Record<string, boolean>; stack?: Array<{ handle: { name: string } }> } }) =>
      entry.route?.methods?.post && entry.route?.stack,
  );

  return layer?.route?.stack?.map((entry) => entry.handle.name) ?? [];
}

describe("AI rate limiting", () => {
  it("returns 429 for repeated requests from the same IP", () => {
    const middleware = createAiRateLimitMiddleware({ limit: 1, windowMs: 60_000 });

    const first = callMiddleware(middleware, "203.0.113.10");
    return first.done.then(() => {
      expect(first.next).toHaveBeenCalledTimes(1);
      expect(first.state.statusCode).toBeNull();

      const second = callMiddleware(middleware, "203.0.113.10");
      return second.done.then(() => {
        expect(second.next).toHaveBeenCalledTimes(1);

        const [error] = second.next.mock.calls[0] ?? [];
        const { response, state } = createResponse();
        errorHandler(error, {} as Request, response as Response, vi.fn());

        expect(state.statusCode).toBe(429);
        expect(state.body).toEqual({
          error: "AI rate limit exceeded",
        });
      });
    });
  });

  it("keeps non-AI routers free of the AI limiter", () => {
    const aiRouteNames = [
      ...getPostMiddlewareNames(reviewRouter),
      ...getPostMiddlewareNames(hintRouter),
      ...getPostMiddlewareNames(chatRouter),
    ];

    expect(aiRouteNames).toContain("aiRateLimit");

    const nonAiRouteNames = [
      ...getPostMiddlewareNames(healthRouter as unknown as Router),
      ...getPostMiddlewareNames(problemsRouter as unknown as Router),
    ];

    expect(nonAiRouteNames).not.toContain("aiRateLimit");
  });

  it("exposes the default limiter middleware for direct use", () => {
    expect(typeof aiRateLimit).toBe("function");
  });
});
