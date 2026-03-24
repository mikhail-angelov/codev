import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AiProvider } from "../src/ai/types.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import { validateBody } from "../src/middleware/validate-body.js";
import { problemRepository } from "../src/problems/problem-repository.js";
import { generateHint } from "../src/hint/hint-service.js";
import { hintRequestSchema } from "../src/validation/ai-request-schemas.js";

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
  const middleware = validateBody(hintRequestSchema);
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

describe("hint endpoint", () => {
  it("returns a structured hint for a valid request", async () => {
    const provider = makeAiProvider(
      JSON.stringify({
        mode: "approach",
        hint: "Use a hash map to track complements.",
        whyItHelps: "It turns the lookup into constant time.",
        nextStep: "Walk through the array once and check whether the complement exists.",
      }),
    );

    const result = await generateHint(
      {
        problemId: 1,
        code: "function twoSum(nums, target) { return []; }",
        mode: "approach",
      },
      {
        aiProvider: provider,
        problemRepository,
      },
    );

    expect(result).toEqual({
      mode: "approach",
      hint: "Use a hash map to track complements.",
      whyItHelps: "It turns the lookup into constant time.",
      nextStep: "Walk through the array once and check whether the complement exists.",
    });
  });

  it("returns 404 when the problem does not exist", async () => {
    const provider = makeAiProvider(
      JSON.stringify({
        mode: "approach",
        hint: "irrelevant",
        whyItHelps: "irrelevant",
        nextStep: "irrelevant",
      }),
    );

    await expect(
      generateHint(
        {
          problemId: 999,
          code: "function x() {}",
          mode: "approach",
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

  it("rejects invalid hint modes before the AI call", () => {
    const { response, state } = createResponse();
    const { next } = runValidation({
      problemId: 1,
      code: "function twoSum(nums, target) { return []; }",
      mode: "strategy",
    });

    const [error] = next.mock.calls[0] ?? [];
    errorHandler(error, {} as Request, response as Response, vi.fn());

    expect(state.statusCode).toBe(400);
    expect(state.body).toEqual({
      error: "Validation failed",
      fields: [
        {
          field: "mode",
          message:
            "Invalid option: expected one of \"approach\"|\"complexity\"|\"edge-cases\"|\"explain-current-code\"",
        },
      ],
    });
  });
});
