import { EventEmitter } from "node:events";
import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AiProviderUpstreamError } from "../src/ai/errors.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import { requestContextMiddleware } from "../src/middleware/request-context.js";

function createResponse() {
  const headers: Record<string, string> = {};
  const emitter = new EventEmitter();

  const response = Object.assign(emitter, {
    locals: {} as Record<string, unknown>,
    statusCode: 200,
    writableEnded: true,
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name: string) {
      return headers[name.toLowerCase()];
    },
    status(code: number) {
      this.statusCode = code;
      return {
        json() {
          return undefined;
        },
      };
    },
  });

  return { response, headers };
}

describe("request context logging", () => {
  it("propagates the request id and logs request completion", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValueOnce(1_000).mockReturnValueOnce(1_123);

    const { response, headers } = createResponse();
    const request = {
      method: "GET",
      originalUrl: "/health",
      url: "/health",
      header(name: string) {
        return name.toLowerCase() === "x-request-id" ? "client-request-123" : undefined;
      },
    } as Request;

    requestContextMiddleware(request, response as unknown as Response, vi.fn());
    response.emit("finish");

    expect(response.locals.requestId).toBe("client-request-123");
    expect(headers["x-request-id"]).toBe("client-request-123");
    expect(infoSpy).toHaveBeenCalledTimes(1);

    const logged = JSON.parse(infoSpy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({
      level: "info",
      event: "request.completed",
      requestId: "client-request-123",
      method: "GET",
      path: "/health",
      statusCode: 200,
      durationMs: 123,
    });

    nowSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it("logs ai provider failures without leaking raw secrets or payload bodies", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { response } = createResponse();
    response.locals.requestId = "req-42";

    const request = {
      method: "POST",
      originalUrl: "/review",
      url: "/review",
    } as Request;

    errorHandler(
      new AiProviderUpstreamError("DeepSeek responded with 502", {
        status: 502,
        body: "Bearer sk-secret-token",
        apiKey: "sk-secret-token",
      }),
      request,
      response as unknown as Response,
      vi.fn(),
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);

    const logged = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({
      level: "error",
      event: "ai.provider.failure",
      requestId: "req-42",
      method: "POST",
      path: "/review",
      statusCode: 503,
      message: "DeepSeek responded with 502",
      error: {
        name: "AiProviderUpstreamError",
        kind: "upstream",
        message: "DeepSeek responded with 502",
        details: {
          status: 502,
        },
      },
    });

    expect(JSON.stringify(logged)).not.toContain("sk-secret-token");
    expect(JSON.stringify(logged)).not.toContain("Bearer");

    errorSpy.mockRestore();
  });
});

