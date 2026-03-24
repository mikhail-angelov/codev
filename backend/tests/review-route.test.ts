import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AiProvider } from "../src/ai/types.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import { validateBody } from "../src/middleware/validate-body.js";
import { problemRepository } from "../src/problems/problem-repository.js";
import { reviewRequestSchema } from "../src/validation/ai-request-schemas.js";
import { generateReview } from "../src/review/review-service.js";

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

function runValidation(body: unknown) {
  const middleware = validateBody(reviewRequestSchema);
  const req = { body } as Request;
  const next = vi.fn();

  middleware(req, {} as Response, next as unknown as NextFunction);

  return { req, next };
}

function makeAiProvider(text: string): AiProvider {
  return {
    generateText: vi.fn().mockResolvedValue({
      text,
      raw: {},
    }),
  };
}

describe("review endpoint", () => {
  it("returns a structured review for a valid request", async () => {
    const provider = makeAiProvider(
      JSON.stringify({
        correctness: "The approach is correct for the given samples.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        improvements: ["Explain the hash map invariant more clearly."],
        followUp: "How would you handle duplicate complements?",
      }),
    );
    const request = {
      problemId: 1,
      code: "function twoSum(nums, target) { return []; }",
      latestTestSummary: {
        passedCount: 2,
        failedCount: 0,
        failureMessages: [],
      },
    };

    const validated = runValidation(request);
    expect(validated.next).toHaveBeenCalledWith();

    const review = await generateReview(validated.req.body, {
      aiProvider: provider,
      problemRepository,
    });

    expect(review).toEqual({
      correctness: "The approach is correct for the given samples.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      improvements: ["Explain the hash map invariant more clearly."],
      followUp: "How would you handle duplicate complements?",
    });
  });

  it("returns 404 when the problem does not exist", async () => {
    const provider = makeAiProvider(
      JSON.stringify({
        correctness: "irrelevant",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        improvements: ["irrelevant"],
        followUp: "irrelevant",
      }),
    );

    await expect(
      generateReview(
        {
          problemId: 999,
          code: "function x() {}",
        },
        {
          aiProvider: provider,
          problemRepository,
        },
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Problem not found",
    });

    expect(provider.generateText).not.toHaveBeenCalled();
  });

  it("rejects an empty code field before the AI call", () => {
    const { response, state } = createResponse();
    const { next } = runValidation({
      problemId: 1,
      code: "",
      latestTestSummary: {
        passedCount: 0,
        failedCount: 0,
        failureMessages: [],
      },
    });

    const [error] = next.mock.calls[0] ?? [];
    errorHandler(error, {} as Request, response as Response, vi.fn());

    expect(state.statusCode).toBe(400);
    expect(state.body).toEqual({
      error: "Validation failed",
      fields: [
        {
          field: "code",
          message: "Too small: expected string to have >=1 characters",
        },
      ],
    });
  });

  it("rejects malformed AI output", async () => {
    const provider = makeAiProvider("not json");

    await expect(
      generateReview(
        {
          problemId: 1,
          code: "function twoSum(nums, target) { return []; }",
        },
        {
          aiProvider: provider,
          problemRepository,
        },
      ),
    ).rejects.toMatchObject({
      statusCode: 502,
      message: "AI review response was invalid",
    });
  });
});
