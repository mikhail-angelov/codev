import { describe, expect, it } from "vitest";
import { getHealth } from "../src/routes/health.js";

describe("GET /health", () => {
  it("returns backend health metadata", async () => {
    let statusCode: number | null = null;
    let jsonBody: unknown = null;

    const response = {
      status(code: number) {
        statusCode = code;
        return {
          json(body: unknown) {
            jsonBody = body;
          },
        };
      },
    };

    getHealth({}, response);

    expect(statusCode).toBe(200);
    expect(jsonBody).toEqual({
      ok: true,
      service: "codev-backend",
    });
  });
});
