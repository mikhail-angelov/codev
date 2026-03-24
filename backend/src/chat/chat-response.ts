import { z } from "zod";
import { HttpError } from "../errors.js";

const nonEmptyString = z.string().trim().min(1);

export const chatResponseSchema = z
  .object({
    reply: nonEmptyString,
    focus: nonEmptyString,
    nextStep: nonEmptyString,
  })
  .strict();

export type ChatResponse = z.infer<typeof chatResponseSchema>;

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
    throw new HttpError(502, "AI chat response was invalid");
  }

  return stripped.slice(firstBrace, lastBrace + 1);
}

export function parseChatResponse(text: string): ChatResponse {
  try {
    const payload = JSON.parse(extractJsonPayload(text));
    const parsed = chatResponseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    return parsed.data;
  } catch {
    throw new HttpError(502, "AI chat response was invalid");
  }
}

