import { describe, expect, it, vi } from "vitest";
import { createDeepSeekProvider } from "../src/ai/deepseek-provider.js";
import {
  AiProviderInvalidResponseError,
  AiProviderTimeoutError,
  AiProviderUpstreamError,
} from "../src/ai/errors.js";
import type { AiConfig } from "../src/config/ai.js";

function makeConfig(overrides: Partial<AiConfig> = {}): AiConfig {
  return {
    apiKey: "test-api-key",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    timeoutMs: 50,
    ...overrides,
  };
}

describe("deepseek provider", () => {
  it("returns assistant text from a successful response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "The solution is correct.",
            },
          },
        ],
      }),
    });

    const provider = createDeepSeekProvider({
      config: makeConfig(),
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await provider.generateText({
      messages: [{ role: "user", content: "Review this solution." }],
      temperature: 0.2,
      maxTokens: 256,
    });

    expect(result.text).toBe("The solution is correct.");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("maps aborted requests to a timeout error", async () => {
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) => {
      const signal = init?.signal;

      return new Promise((_resolve, reject) => {
        if (signal) {
          signal.addEventListener("abort", () => {
            reject(Object.assign(new Error("The operation was aborted."), { name: "AbortError" }));
          });
        }
      });
    });

    const provider = createDeepSeekProvider({
      config: makeConfig({ timeoutMs: 10 }),
      fetchImpl: fetchImpl as typeof fetch,
    });

    await expect(
      provider.generateText({
        messages: [{ role: "user", content: "Timeout test" }],
      }),
    ).rejects.toBeInstanceOf(AiProviderTimeoutError);
  });

  it("maps upstream HTTP failures to a normalized provider error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: vi.fn().mockResolvedValue("bad gateway"),
    });

    const provider = createDeepSeekProvider({
      config: makeConfig(),
      fetchImpl: fetchImpl as typeof fetch,
    });

    await expect(
      provider.generateText({
        messages: [{ role: "user", content: "Failure test" }],
      }),
    ).rejects.toMatchObject({
      kind: "upstream",
      statusCode: 503,
    } satisfies Partial<AiProviderUpstreamError>);
  });

  it("rejects empty assistant content as an invalid response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "   " } }],
      }),
    });

    const provider = createDeepSeekProvider({
      config: makeConfig(),
      fetchImpl: fetchImpl as typeof fetch,
    });

    await expect(
      provider.generateText({
        messages: [{ role: "user", content: "Invalid payload test" }],
      }),
    ).rejects.toBeInstanceOf(AiProviderInvalidResponseError);
  });
});

