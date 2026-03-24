import { describe, expect, it } from "vitest";
import {
  DEFAULT_EDITOR_TEMPLATE,
  ensureEditorTemplate,
  getEditorValueForProblem,
  resetEditorValueForProblem,
  setEditorValueForProblem,
} from "./editor-state";

describe("editor state helpers", () => {
  it("preserves a separate working buffer per problem across switches", () => {
    const twoSumStarter = "function twoSum(nums, target) {\n  return [];\n}";
    const longestStarter = "function lengthOfLongestSubstring(s) {\n  return 0;\n}";

    const afterFirstOpen = ensureEditorTemplate({}, 1, twoSumStarter);
    const afterEdit = setEditorValueForProblem(afterFirstOpen, 1, "function twoSum(nums, target) {\n  return [0, 1];\n}");
    const afterSwitch = ensureEditorTemplate(afterEdit, 15, longestStarter);

    expect(getEditorValueForProblem(afterSwitch, 1, { starterTemplate: twoSumStarter })).toBe(
      "function twoSum(nums, target) {\n  return [0, 1];\n}",
    );
    expect(getEditorValueForProblem(afterSwitch, 15, { starterTemplate: longestStarter })).toBe(longestStarter);

    const afterReturn = ensureEditorTemplate(afterSwitch, 1, twoSumStarter);

    expect(getEditorValueForProblem(afterReturn, 1, { starterTemplate: twoSumStarter })).toBe(
      "function twoSum(nums, target) {\n  return [0, 1];\n}",
    );
  });

  it("falls back to the default template when no problem is active", () => {
    expect(getEditorValueForProblem({}, null, null)).toBe(DEFAULT_EDITOR_TEMPLATE);
  });

  it("resets a problem buffer to its starter template", () => {
    const starter = "function solve() {}";
    const afterReset = resetEditorValueForProblem(
      setEditorValueForProblem({}, 1, "function solve() { return 1; }"),
      1,
      starter,
    );

    expect(afterReset[1]).toBe(starter);
  });
});
