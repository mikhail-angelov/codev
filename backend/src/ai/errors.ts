import { HttpError } from "../errors.js";

export type AiProviderErrorKind = "config" | "timeout" | "upstream" | "invalid-response";

export class AiProviderError extends HttpError {
  kind: AiProviderErrorKind;
  details?: unknown;

  constructor(kind: AiProviderErrorKind, message: string, statusCode = 503, details?: unknown) {
    super(statusCode, message);
    this.name = "AiProviderError";
    this.kind = kind;
    this.details = details;
  }
}

export class AiProviderConfigError extends AiProviderError {
  constructor(message: string, details?: unknown) {
    super("config", message, 500, details);
    this.name = "AiProviderConfigError";
  }
}

export class AiProviderTimeoutError extends AiProviderError {
  constructor(message = "DeepSeek request timed out", details?: unknown) {
    super("timeout", message, 503, details);
    this.name = "AiProviderTimeoutError";
  }
}

export class AiProviderUpstreamError extends AiProviderError {
  constructor(message = "DeepSeek request failed", details?: unknown) {
    super("upstream", message, 503, details);
    this.name = "AiProviderUpstreamError";
  }
}

export class AiProviderInvalidResponseError extends AiProviderError {
  constructor(message = "DeepSeek returned an invalid response", details?: unknown) {
    super("invalid-response", message, 503, details);
    this.name = "AiProviderInvalidResponseError";
  }
}

