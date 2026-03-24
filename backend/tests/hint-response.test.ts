import { describe, expect, it } from "vitest";
import { parseHintResponse } from "../src/hint/hint-response.js";

describe("hint response parser", () => {
  it("parses a valid JSON hint response", () => {
    const response = parseHintResponse(
      JSON.stringify({
        mode: "approach",
        hint: "Use a hash map.",
        whyItHelps: "It turns the scan into one pass.",
        nextStep: "Check complements as you iterate.",
      }),
      "approach",
    );

    expect(response).toEqual({
      mode: "approach",
      hint: "Use a hash map.",
      whyItHelps: "It turns the scan into one pass.",
      nextStep: "Check complements as you iterate.",
    });
  });

  it("rejects malformed hint payloads", () => {
    expect(() => parseHintResponse("not json")).toThrow("AI hint response was invalid");
  });
});
