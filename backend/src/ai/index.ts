import { loadAiConfig } from "../config/ai.js";
import { createDeepSeekProvider } from "./deepseek-provider.js";

export const aiProvider = createDeepSeekProvider({
  config: loadAiConfig(),
});

export { createDeepSeekProvider } from "./deepseek-provider.js";
export type {
  AiGenerateTextRequest,
  AiGenerateTextResponse,
  AiMessage,
  AiProvider,
  AiRole,
} from "./types.js";
export {
  AiProviderConfigError,
  AiProviderError,
  AiProviderInvalidResponseError,
  AiProviderTimeoutError,
  AiProviderUpstreamError,
} from "./errors.js";

