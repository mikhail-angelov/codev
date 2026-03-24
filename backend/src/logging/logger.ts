export type LogLevel = "info" | "warn" | "error";

export interface StructuredLogEntry {
  event: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  message?: string;
  error?: Record<string, unknown>;
}

function emit(level: LogLevel, entry: StructuredLogEntry) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    ...entry,
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export function logInfo(entry: StructuredLogEntry) {
  emit("info", entry);
}

export function logWarn(entry: StructuredLogEntry) {
  emit("warn", entry);
}

export function logError(entry: StructuredLogEntry) {
  emit("error", entry);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeErrorDetails(details: unknown): Record<string, unknown> | undefined {
  if (!isRecord(details)) {
    return undefined;
  }

  const sanitized: Record<string, unknown> = {};

  if (typeof details.status === "number") {
    sanitized.status = details.status;
  }

  if (typeof details.timeoutMs === "number") {
    sanitized.timeoutMs = details.timeoutMs;
  }

  if (typeof details.cause === "string") {
    sanitized.cause = details.cause;
  }

  if (typeof details.kind === "string") {
    sanitized.kind = details.kind;
  }

  if (typeof details.payload === "object" && details.payload !== null) {
    sanitized.payloadKeys = Object.keys(details.payload as Record<string, unknown>).slice(0, 10);
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

