import { loadAiConfig, type AiConfig } from "../config/ai.js";
import {
  AiProviderConfigError,
  AiProviderInvalidResponseError,
  AiProviderTimeoutError,
  AiProviderUpstreamError,
} from "./errors.js";
import type { AiGenerateTextRequest, AiGenerateTextResponse, AiProvider } from "./types.js";

interface DeepSeekProviderOptions {
  config?: AiConfig;
  fetchImpl?: typeof fetch;
}

interface DeepSeekChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { name?: string };
  return candidate.name === "AbortError";
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown DeepSeek failure";
}

async function readErrorBody(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    return text.trim().length > 0 ? text : null;
  } catch {
    return null;
  }
}

export function createDeepSeekProvider(options: DeepSeekProviderOptions = {}): AiProvider {
  const config = options.config ?? loadAiConfig();
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generateText(request: AiGenerateTextRequest): Promise<AiGenerateTextResponse> {
      if (!config.apiKey.trim()) {
        throw new AiProviderConfigError("DEEPSEEK_API_KEY is required");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: config.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorBody = await readErrorBody(response);
          throw new AiProviderUpstreamError(
            `DeepSeek responded with ${response.status}`,
            {
              status: response.status,
              body: errorBody,
            },
          );
        }

        const payload = (await response.json()) as DeepSeekChatCompletionResponse;
        const content = payload.choices?.[0]?.message?.content;

        if (!content || content.trim().length === 0) {
          throw new AiProviderInvalidResponseError("DeepSeek response was missing assistant content", {
            payload,
          });
        }

        return {
          text: content,
          raw: payload,
        };
      } catch (error) {
        if (error instanceof AiProviderConfigError) {
          throw error;
        }

        if (error instanceof AiProviderUpstreamError || error instanceof AiProviderInvalidResponseError) {
          throw error;
        }

        if (controller.signal.aborted || isAbortError(error)) {
          throw new AiProviderTimeoutError("DeepSeek request timed out", {
            timeoutMs: config.timeoutMs,
          });
        }

        throw new AiProviderUpstreamError("DeepSeek request failed", {
          cause: toErrorMessage(error),
        });
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}

