export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiGenerateTextRequest {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AiGenerateTextResponse {
  text: string;
  raw: unknown;
}

export interface AiProvider {
  generateText(request: AiGenerateTextRequest): Promise<AiGenerateTextResponse>;
}

