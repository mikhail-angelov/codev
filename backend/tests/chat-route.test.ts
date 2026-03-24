import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AiProvider } from "../src/ai/types.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import { validateBody } from "../src/middleware/validate-body.js";
import { problemRepository } from "../src/problems/problem-repository.js";
import { generateChat } from "../src/chat/chat-service.js";
import { chatRequestSchema } from "../src/validation/ai-request-schemas.js";

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
  const middleware = validateBody(chatRequestSchema);
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

describe("chat endpoint", () => {
  it("returns a structured reply for a valid request", async () => {
    const provider = makeAiProvider(
      JSON.stringify({
        reply: "Use a hash map and keep the answer anchored to the current problem.",
        focus: "Scope and invariants",
        nextStep: "Explain the current code path before proposing a change.",
      }),
    );

    const result = await generateChat(
      {
        problemId: 1,
        code: "function twoSum(nums, target) { return []; }",
        userMessage: "Am I close?",
        recentMessages: [
          { role: "user", content: "Am I close?" },
          { role: "assistant", content: "You are on the right track." },
        ],
      },
      {
        aiProvider: provider,
        problemRepository,
      },
    );

    expect(result).toEqual({
      reply: "Use a hash map and keep the answer anchored to the current problem.",
      focus: "Scope and invariants",
      nextStep: "Explain the current code path before proposing a change.",
    });
  });

  it("returns 404 when the problem does not exist", async () => {
    const provider = makeAiProvider(
      JSON.stringify({
        reply: "irrelevant",
        focus: "irrelevant",
        nextStep: "irrelevant",
      }),
    );

    await expect(
      generateChat(
        {
          problemId: 999,
          code: "function x() {}",
          userMessage: "What now?",
          recentMessages: [],
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

  it("rejects an empty userMessage before the AI call", () => {
    const { response, state } = createResponse();
    const { next } = runValidation({
      problemId: 1,
      code: "function twoSum(nums, target) { return []; }",
      userMessage: "",
      recentMessages: [],
    });

    const [error] = next.mock.calls[0] ?? [];
    errorHandler(error, {} as Request, response as Response, vi.fn());

    expect(state.statusCode).toBe(400);
    expect(state.body).toEqual({
      error: "Validation failed",
      fields: [
        {
          field: "userMessage",
          message: "Too small: expected string to have >=1 characters",
        },
      ],
    });
  });
});

