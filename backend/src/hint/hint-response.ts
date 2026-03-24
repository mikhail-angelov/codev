import { z } from "zod";
import { HttpError } from "../errors.js";
import type { HintPromptMode } from "../prompts/hint-prompt.js";

const nonEmptyString = z.string().trim().min(1);

export const hintResponseSchema = z
  .object({
    mode: z.enum(["approach", "complexity", "edge-cases", "explain-current-code"]),
    hint: nonEmptyString,
    whyItHelps: nonEmptyString,
    nextStep: nonEmptyString,
  })
  .strict();

export type HintResponse = z.infer<typeof hintResponseSchema>;

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
    throw new HttpError(502, "AI hint response was invalid");
  }

  return stripped.slice(firstBrace, lastBrace + 1);
}

export function parseHintResponse(text: string, expectedMode?: HintPromptMode): HintResponse {
  try {
    const payload = JSON.parse(extractJsonPayload(text));
    const parsed = hintResponseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    if (expectedMode && parsed.data.mode !== expectedMode) {
      throw new Error("Unexpected hint mode");
    }

    return parsed.data;
  } catch {
    throw new HttpError(502, "AI hint response was invalid");
  }
}
