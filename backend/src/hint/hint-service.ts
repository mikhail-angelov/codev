import type { AiProvider } from "../ai/types.js";
import { HttpError } from "../errors.js";
import type { ProblemRepository } from "../problems/problem-repository.js";
import { buildHintPrompt } from "../prompts/hint-prompt.js";
import type { HintRequestBody } from "../validation/ai-request-schemas.js";
import { parseHintResponse, type HintResponse } from "./hint-response.js";

export interface HintServiceDeps {
  aiProvider: AiProvider;
  problemRepository: ProblemRepository;
}

export async function generateHint(
  request: HintRequestBody,
  deps: HintServiceDeps,
): Promise<HintResponse> {
  const problem = deps.problemRepository.getById(request.problemId);

  if (!problem) {
    throw new HttpError(404, "Problem not found");
  }

  const prompt = buildHintPrompt({
    problem,
    currentCode: request.code,
    mode: request.mode,
  });

  const result = await deps.aiProvider.generateText(prompt);

  return parseHintResponse(result.text, request.mode);
}
