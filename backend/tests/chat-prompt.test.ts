import { describe, expect, it } from "vitest";
import { buildChatPrompt, MAX_RECENT_MESSAGES, trimRecentMessages } from "../src/prompts/chat-prompt.js";
import { problemRepository } from "../src/problems/problem-repository.js";

describe("chat prompt", () => {
  it("builds a deterministic payload with problem, code, and recent thread context", () => {
    const problem = problemRepository.getById(1);

    if (!problem) {
      throw new Error("Expected seeded problem 1 to exist");
    }

    const payload = buildChatPrompt({
      problem,
      currentCode: "function twoSum(nums, target) { return []; }",
      currentUserMessage: "Am I close?",
      recentMessages: [
        { role: "user", content: "Am I close?" },
        { role: "assistant", content: "You are close." },
      ],
    });

    expect(payload.temperature).toBe(0.3);
    expect(payload.maxTokens).toBe(700);
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[0]).toEqual(
      expect.objectContaining({
        role: "system",
      }),
    );
    expect(payload.messages[0].content).toContain("technical interview chat assistant");
    expect(payload.messages[0].content).toContain("reply");
    expect(payload.messages[0].content).toContain("focus");
    expect(payload.messages[0].content).toContain("nextStep");
    expect(payload.messages[1].content).toContain("Problem: Two Sum");
    expect(payload.messages[1].content).toContain("Current code:");
    expect(payload.messages[1].content).toContain("Latest user question:");
    expect(payload.messages[1].content).toContain("Am I close?");
    expect(payload.messages[1].content).toContain("Recent thread messages");
    expect(payload.messages[1].content).toContain("Am I close?");
    expect(payload.messages[1].content).toContain("You are close.");
  });

  it("trims thread history to the most recent bounded messages", () => {
    const messages = Array.from({ length: MAX_RECENT_MESSAGES + 4 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `message-${index + 1}`,
    })) as Array<{ role: "user" | "assistant"; content: string }>;

    const trimmed = trimRecentMessages(messages);

    expect(trimmed).toHaveLength(MAX_RECENT_MESSAGES);
    expect(trimmed[0].content).toBe(`message-5`);
    expect(trimmed.at(-1)?.content).toBe(`message-${MAX_RECENT_MESSAGES + 4}`);
  });

  it("copies short threads without changing message order", () => {
    const messages = [
      { role: "system" as const, content: "system note" },
      { role: "user" as const, content: "question" },
    ];

    const trimmed = trimRecentMessages(messages);

    expect(trimmed).toEqual(messages);
    expect(trimmed).not.toBe(messages);
  });
});
