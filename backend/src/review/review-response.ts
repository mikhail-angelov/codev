import { z } from "zod";
import { HttpError } from "../errors.js";

const nonEmptyString = z.string().trim().min(1);

export const reviewResponseSchema = z
  .object({
    isCorrect: z.boolean(),
    correctness: nonEmptyString,
    timeComplexity: nonEmptyString,
    spaceComplexity: nonEmptyString,
    improvements: z.array(nonEmptyString).min(1).max(2),
    followUp: nonEmptyString,
  })
  .strict();

export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  return trimmed;
}

function extractJsonPayload(text: string): string {
  const stripped = stripCodeFences(text);
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new HttpError(502, "AI review response was invalid");
  }

  return stripped.slice(firstBrace, lastBrace + 1);
}

export function parseReviewResponse(text: string): ReviewResponse {
  try {
    const payload = JSON.parse(extractJsonPayload(text));
    const parsed = reviewResponseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    return parsed.data;
  } catch {
    throw new HttpError(502, "AI review response was invalid");
  }
}
