import { describe, expect, it } from "vitest";
import {
  loadProblemRecords,
  ProblemValidationError,
  validateProblemRecord,
  validateProblemRecords,
} from "../src/problems/problem-schema.js";

const validProblemRecord = {
  id: 1,
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "easy",
  topic: "Arrays",
  description: "Find two numbers that add up to the target.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      note: "2 + 7 = 9",
    },
  ],
  constraints: ["Exactly one valid answer exists."],
  starterTemplate: "function twoSum(nums, target) {\n  \n}",
  hints: ["Use a hash map."],
  referenceSolution: "function twoSum(nums, target) { return []; }",
  sampleTests: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
    },
  ],
};

describe("problem schema validation", () => {
  it("accepts a valid problem record", () => {
    const result = validateProblemRecord(validProblemRecord);

    expect(result).toEqual(validProblemRecord);
  });

  it("accepts a valid problem record array", () => {
    const result = validateProblemRecords([validProblemRecord]);

    expect(result).toEqual([validProblemRecord]);
  });

  it("accepts load-time validation for a problem record array", () => {
    const result = loadProblemRecords([validProblemRecord]);

    expect(result).toEqual([validProblemRecord]);
  });

  it("rejects an invalid problem record with readable issues", () => {
    expect(() =>
      validateProblemRecord(
        {
          ...validProblemRecord,
          slug: "Two Sum",
          difficulty: "insane",
          sampleTests: [{ input: "", expectedOutput: 9 }],
        },
        0,
      ),
    ).toThrowError(ProblemValidationError);

    try {
      validateProblemRecord(
        {
          ...validProblemRecord,
          slug: "Two Sum",
          difficulty: "insane",
          sampleTests: [{ input: "", expectedOutput: 9 }],
        },
        0,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ProblemValidationError);
      expect((error as ProblemValidationError).issues).toEqual([
        "problem[0].slug must use lowercase kebab-case",
        "problem[0].difficulty must be one of easy, medium, hard",
        "problem[0].sampleTests[0].input must be a non-empty string",
        "problem[0].sampleTests[0].expectedOutput must be a non-empty string",
      ]);
      expect((error as Error).message).toContain("problem[0].slug must use lowercase kebab-case");
    }
  });

  it("rejects a non-array payload at load time", () => {
    expect(() => validateProblemRecords(validProblemRecord)).toThrowError(
      "problem records payload must be an array",
    );
  });
});
