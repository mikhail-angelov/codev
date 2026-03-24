import { describe, expect, it } from "vitest";
import { getProblemById, getProblems } from "../src/routes/problems.js";

function createResponse() {
  const state: {
    statusCode: number | null;
    body: unknown;
  } = {
    statusCode: null,
    body: null,
  };

  const response = {
    status(code: number) {
      state.statusCode = code;
      return {
        json(body: unknown) {
          state.body = body;
          return undefined;
        },
      };
    },
  };

  return { response, state };
}

describe("problems routes", () => {
  it("returns the public problem list", () => {
    const { response, state } = createResponse();

    getProblems({} as never, response as never);

    expect(state.statusCode).toBe(200);
    expect(Array.isArray(state.body)).toBe(true);
    const body = state.body as Array<Record<string, unknown>>;

    expect(body).toHaveLength(15);
    expect(body[0]).toEqual({
      id: 1,
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "easy",
      topic: "Arrays",
    });
    expect(body[4]).toEqual({
      id: 57,
      slug: "merge-k-sorted-lists",
      title: "Merge K Sorted Lists",
      difficulty: "hard",
      topic: "Linked Lists",
    });
    expect(body[10]).toEqual({
      id: 93,
      slug: "generate-parentheses",
      title: "Generate Parentheses",
      difficulty: "medium",
      topic: "Recursion",
    });
    expect(body[14]).toEqual({
      id: 124,
      slug: "coin-change",
      title: "Coin Change",
      difficulty: "medium",
      topic: "Dynamic Programming",
    });
  });

  it("returns a public problem detail by id", () => {
    const { response, state } = createResponse();

    getProblemById(
      {
        params: { id: "15" },
      } as never,
      response as never,
    );

    expect(state.statusCode).toBe(200);
    expect(state.body).toMatchObject({
      id: 15,
      slug: "longest-substring-without-repeating-characters",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "medium",
      topic: "Strings",
    });
    expect(state.body).not.toHaveProperty("referenceSolution");
    expect(state.body).toMatchObject({
      starterTemplate: "/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n}",
    });
  });

  it("returns 404 for an unknown id", () => {
    const { response, state } = createResponse();

    getProblemById(
      {
        params: { id: "999" },
      } as never,
      response as never,
    );

    expect(state.statusCode).toBe(404);
    expect(state.body).toEqual({ error: "Problem not found" });
  });

  it("returns 404 for an invalid id", () => {
    const { response, state } = createResponse();

    getProblemById(
      {
        params: { id: "abc" },
      } as never,
      response as never,
    );

    expect(state.statusCode).toBe(404);
    expect(state.body).toEqual({ error: "Problem not found" });
  });
});
