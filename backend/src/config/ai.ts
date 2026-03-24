import { z } from "zod";

const aiConfigSchema = z.object({
  DEEPSEEK_API_KEY: z.string().optional().default(""),
  DEEPSEEK_MODEL: z.string().trim().min(1).default("deepseek-chat"),
  DEEPSEEK_BASE_URL: z
    .string()
    .trim()
    .url()
    .default("https://api.deepseek.com"),
  DEEPSEEK_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

export interface AiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
}

export function loadAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  const parsed = aiConfigSchema.parse(env);
  
  return {
    apiKey: parsed.DEEPSEEK_API_KEY,
    model: parsed.DEEPSEEK_MODEL,
    baseUrl: parsed.DEEPSEEK_BASE_URL,
    timeoutMs: parsed.DEEPSEEK_TIMEOUT_MS,
  };
}

