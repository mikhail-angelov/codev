import { describe, expect, it } from "vitest";
import {
  createAssistantChatThreadMessage,
  createHintThreadMessage,
  createReviewThreadMessage,
  createSystemThreadMessage,
  createUserChatThreadMessage,
} from "./ai-thread";
import { buildRecentChatMessages } from "./chat";

describe("buildRecentChatMessages", () => {
  it("skips system messages and trims to the requested limit", () => {
    const messages = [
      createSystemThreadMessage("Seed system"),
      ...Array.from({ length: 6 }, (_, index) => createUserChatThreadMessage(`User ${index + 1}`)),
      ...Array.from({ length: 6 }, (_, index) =>
        createAssistantChatThreadMessage({
          reply: `Reply ${index + 1}`,
          focus: `Focus ${index + 1}`,
          nextStep: `Next ${index + 1}`,
        }),
      ),
    ];

    const recentMessages = buildRecentChatMessages(messages, 5);

    expect(recentMessages).toHaveLength(5);
    expect(recentMessages.map((message) => message.content)).toEqual([
      "Reply: Reply 2\nFocus: Focus 2\nNext step: Next 2",
      "Reply: Reply 3\nFocus: Focus 3\nNext step: Next 3",
      "Reply: Reply 4\nFocus: Focus 4\nNext step: Next 4",
      "Reply: Reply 5\nFocus: Focus 5\nNext step: Next 5",
      "Reply: Reply 6\nFocus: Focus 6\nNext step: Next 6",
    ]);
  });

  it("serializes review and hint messages for chat context", () => {
    const recentMessages = buildRecentChatMessages([
      createReviewThreadMessage({
        isCorrect: true,
        correctness: "Looks correct.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        improvements: ["Explain the invariant."],
        followUp: "What happens on duplicates?",
      }),
      createHintThreadMessage({
        mode: "approach",
        hint: "Use a hash map.",
        whyItHelps: "It gives constant-time lookup.",
        nextStep: "Track complements as you scan the array.",
      }),
    ]);

    expect(recentMessages).toEqual([
      {
        role: "assistant",
        content: [
          "Review summary:",
          "Correctness: Looks correct.",
          "Time complexity: O(n)",
          "Space complexity: O(1)",
          "Improvements: Explain the invariant.",
          "Follow-up: What happens on duplicates?",
        ].join("\n"),
      },
      {
        role: "assistant",
        content: [
          "Hint (approach): Use a hash map.",
          "Why it helps: It gives constant-time lookup.",
          "Next step: Track complements as you scan the array.",
        ].join("\n"),
      },
    ]);
  });
});
