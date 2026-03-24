import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/error-handler.js";
import { validateBody } from "../src/middleware/validate-body.js";
import {
  chatRequestSchema,
  hintRequestSchema,
  reviewRequestSchema,
} from "../src/validation/ai-request-schemas.js";

function createResponse() {
  const state: {
    statusCode: number | null;
    body: unknown;
  } = {
    statusCode: null,
    body: null,
  };

  const response = {
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

function runMiddleware(
  middleware: ReturnType<typeof validateBody>,
  body: unknown,
) {
  const req = { body } as Request;
  const next = vi.fn() as unknown as NextFunction;

  middleware(req, {} as Response, next);

  return { req, next };
}

describe("request validation", () => {
  it("accepts a valid review payload", () => {
    const middleware = validateBody(reviewRequestSchema);
    const payload = {
      problemId: 1,
      code: "function twoSum() {}",
      latestTestSummary: {
        passedCount: 2,
        failedCount: 0,
        failureMessages: [],
      },
    };

    const { req, next } = runMiddleware(middleware, payload);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual(payload);
  });

  it("returns field-level errors for an invalid hint payload", () => {
    const middleware = validateBody(hintRequestSchema);
    const { response, state } = createResponse();
    const next = vi.fn();

    middleware(
      {
        body: {
          problemId: 0,
          code: "",
          mode: "walkthrough",
        },
      } as Request,
      response as Response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);

    const [error] = next.mock.calls[0] ?? [];
    errorHandler(error, {} as Request, response as Response, vi.fn());

    expect(state.statusCode).toBe(400);
    expect(state.body).toEqual({
      error: "Validation failed",
      fields: [
        {
          field: "problemId",
          message: "Too small: expected number to be >0",
        },
        {
          field: "code",
          message: "Too small: expected string to have >=1 characters",
        },
        {
          field: "mode",
          message:
            'Invalid option: expected one of "approach"|"complexity"|"edge-cases"|"explain-current-code"',
        },
      ],
    });
  });

  it("formats nested validation errors for chat payloads", () => {
    const middleware = validateBody(chatRequestSchema);
    const { response, state } = createResponse();
    const next = vi.fn();

    middleware(
      {
        body: {
          problemId: 1,
          code: "function x() {}",
          userMessage: "Need help",
          recentMessages: [
            {
              role: "assistant",
              content: "",
            },
          ],
        },
      } as Request,
      response as Response,
      next,
    );

    const [error] = next.mock.calls[0] ?? [];
    errorHandler(error, {} as Request, response as Response, vi.fn());

    expect(state.statusCode).toBe(400);
    expect(state.body).toEqual({
      error: "Validation failed",
      fields: [
        {
          field: "recentMessages[0].content",
          message: "Too small: expected string to have >=1 characters",
        },
      ],
    });
  });
});
