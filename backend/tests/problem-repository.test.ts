import { describe, expect, it } from "vitest";
import { createProblemRepository, problemRepository } from "../src/problems/problem-repository.js";
import { problemSeeds } from "../src/problems/problem-seeds.js";

describe("problem repository", () => {
  it("lists public problem summaries", () => {
    const problems = problemRepository.list();

    expect(problems).toHaveLength(15);
    expect(problems[0]).toEqual({
      id: 1,
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "easy",
      topic: "Arrays",
    });
    expect(problems[14]).toEqual({
      id: 124,
      slug: "coin-change",
      title: "Coin Change",
      difficulty: "medium",
      topic: "Dynamic Programming",
    });
  });

  it("returns a public problem detail by id without leaking internal fields", () => {
    const problem = problemRepository.getById(15);

    expect(problem).not.toBeNull();
    expect(problem).toMatchObject({
      id: 15,
      slug: "longest-substring-without-repeating-characters",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "medium",
      topic: "Strings",
    });
    expect(problem).not.toHaveProperty("referenceSolution");
  });

  it("returns a public problem detail by slug without leaking internal fields", () => {
    const problem = problemRepository.getBySlug("merge-k-sorted-lists");

    expect(problem).not.toBeNull();
    expect(problem).toMatchObject({
      id: 57,
      slug: "merge-k-sorted-lists",
      title: "Merge K Sorted Lists",
      difficulty: "hard",
      topic: "Linked Lists",
    });
    expect(problem).not.toHaveProperty("referenceSolution");
  });

  it("returns null when a problem does not exist", () => {
    expect(problemRepository.getById(999)).toBeNull();
    expect(problemRepository.getBySlug("missing-problem")).toBeNull();
  });

  it("keeps repository results isolated from the underlying seed objects", () => {
    const repository = createProblemRepository(problemSeeds);
    const problem = repository.getById(1);

    expect(problem).not.toBeNull();
    if (!problem) {
      throw new Error("Expected problem 1 to exist");
    }

    problem.title = "Mutated title";
    problem.examples[0].input = "changed";

    const freshLookup = repository.getById(1);

    expect(freshLookup?.title).toBe("Two Sum");
    expect(freshLookup?.examples[0].input).toBe("nums = [2,7,11,15], target = 9");
  });
});
