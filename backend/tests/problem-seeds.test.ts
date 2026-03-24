import { describe, expect, it } from "vitest";
import { problemSeeds } from "../src/problems/problem-seeds.js";
import { loadProblemRecords } from "../src/problems/problem-schema.js";

describe("problem seeds", () => {
  it("contains fifteen valid curated problems across the planned MVP topics", () => {
    const validated = loadProblemRecords(problemSeeds);

    expect(validated).toHaveLength(15);
    expect([...new Set(validated.map((problem) => problem.topic))]).toEqual([
      "Arrays",
      "Strings",
      "Trees",
      "Graphs",
      "Linked Lists",
      "Recursion",
      "Dynamic Programming",
    ]);
  });
});
