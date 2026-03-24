import type { AiProvider } from "../ai/types.js";
import { HttpError } from "../errors.js";
import type { ProblemRepository } from "../problems/problem-repository.js";
import { buildChatPrompt } from "../prompts/chat-prompt.js";
import type { ChatRequestBody } from "../validation/ai-request-schemas.js";
import { parseChatResponse, type ChatResponse } from "./chat-response.js";

export interface ChatServiceDeps {
  aiProvider: AiProvider;
  problemRepository: ProblemRepository;
}

export async function generateChat(
  request: ChatRequestBody,
  deps: ChatServiceDeps,
): Promise<ChatResponse> {
  const problem = deps.problemRepository.getById(request.problemId);

  if (!problem) {
    throw new HttpError(404, "Problem not found");
  }

  const prompt = buildChatPrompt({
    problem,
    currentCode: request.code,
    currentUserMessage: request.userMessage,
    recentMessages: request.recentMessages,
  });

  const result = await deps.aiProvider.generateText(prompt);

  return parseChatResponse(result.text);
}
