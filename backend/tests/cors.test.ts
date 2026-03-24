import { describe, expect, it } from "vitest";
import { corsMiddleware } from "../src/middleware/cors.js";

function createResponse() {
  const headers = new Map<string, string>();
  let statusCode: number | null = null;
  let ended = false;

  return {
    response: {
      header(name: string, value: string) {
        headers.set(name, value);
        return this;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      end() {
        ended = true;
        return this;
      },
    },
    getHeader(name: string) {
      return headers.get(name);
    },
    getStatusCode() {
      return statusCode;
    },
    isEnded() {
      return ended;
    },
  };
}

describe("corsMiddleware", () => {
  it("adds CORS headers for the local frontend origin", () => {
    const { response, getHeader } = createResponse();
    let nextCalled = false;

    corsMiddleware(
      {
        method: "GET",
        headers: {
          origin: "http://localhost:5173",
        },
      } as never,
      response as never,
      () => {
        nextCalled = true;
      },
    );

    expect(getHeader("Access-Control-Allow-Origin")).toBe("http://localhost:5173");
    expect(getHeader("Access-Control-Allow-Methods")).toBe("GET,POST,OPTIONS");
    expect(nextCalled).toBe(true);
  });

  it("terminates preflight requests with 204", () => {
    const { response, getStatusCode, isEnded } = createResponse();
    let nextCalled = false;

    corsMiddleware(
      {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:5173",
        },
      } as never,
      response as never,
      () => {
        nextCalled = true;
      },
    );

    expect(getStatusCode()).toBe(204);
    expect(isEnded()).toBe(true);
    expect(nextCalled).toBe(false);
  });
});
