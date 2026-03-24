import { describe, expect, it } from "vitest";
import { buildHintPrompt, type HintPromptMode } from "../src/prompts/hint-prompt.js";
import { problemRepository } from "../src/problems/problem-repository.js";

function getSeedProblem() {
  const problem = problemRepository.getById(1);

  if (!problem) {
    throw new Error("Expected seeded problem 1 to exist");
  }

  return problem;
}

describe("hint prompt", () => {
  const modes: HintPromptMode[] = [
    "approach",
    "complexity",
    "edge-cases",
    "explain-current-code",
  ];

  it.each(modes)("builds a deterministic payload for %s", (mode) => {
    const payload = buildHintPrompt({
      problem: getSeedProblem(),
      currentCode: "function twoSum(nums, target) { return []; }",
      mode,
    });

    expect(payload.temperature).toBe(0.2);
    expect(payload.maxTokens).toBe(500);
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[0]).toEqual(
      expect.objectContaining({
        role: "system",
      }),
    );
    expect(payload.messages[0].content).toContain("hint coach");
    expect(payload.messages[0].content).toContain("Return only JSON");
    expect(payload.messages[1].content).toContain("Problem: Two Sum");
    expect(payload.messages[1].content).toContain("Current code:");
    expect(payload.messages[1].content).toContain("function twoSum(nums, target)");
    expect(payload.messages[1].content).toContain(`Hint mode: ${mode.replace(/-/g, " ")}.`);
    expect(payload.messages[1].content).toContain(
      '{ "mode": string, "hint": string, "whyItHelps": string, "nextStep": string }',
    );
  });

  it("keeps the prompt shape consistent across modes", () => {
    const prompts = modes.map((mode) =>
      buildHintPrompt({
        problem: getSeedProblem(),
        currentCode: "function twoSum(nums, target) { return []; }",
        mode,
      }),
    );

    for (const prompt of prompts) {
      expect(prompt.messages[0].role).toBe("system");
      expect(prompt.messages[1].role).toBe("user");
      expect(prompt.messages[1].content).toContain("Return a single valid JSON object only.");
      expect(prompt.messages[1].content).toContain('Set "mode" to the requested hint mode.');
    }
  });
});
