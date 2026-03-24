import { describe, expect, it } from "vitest";
import { parseChatResponse } from "../src/chat/chat-response.js";

describe("chat response parser", () => {
  it("parses a valid JSON chat response", () => {
    const response = parseChatResponse(
      JSON.stringify({
        reply: "Use the current window to keep the answer scoped.",
        focus: "Scope control",
        nextStep: "Answer with the problem constraints and current code only.",
      }),
    );

    expect(response).toEqual({
      reply: "Use the current window to keep the answer scoped.",
      focus: "Scope control",
      nextStep: "Answer with the problem constraints and current code only.",
    });
  });

  it("rejects malformed chat payloads", () => {
    expect(() => parseChatResponse("not json")).toThrow("AI chat response was invalid");
  });
});

