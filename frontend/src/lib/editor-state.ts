import type { ProblemDetail } from "./problems";

export type EditorState = Record<number, string>;

export const DEFAULT_EDITOR_TEMPLATE = `function solve(problem) {
  // The live editor arrives in the next task.
  return problem;
}`;

export function getEditorValueForProblem(
  editorState: EditorState,
  selectedProblemId: number | null,
  activeProblem: Pick<ProblemDetail, "starterTemplate"> | null,
): string {
  if (selectedProblemId === null) {
    return DEFAULT_EDITOR_TEMPLATE;
  }

  return editorState[selectedProblemId] ?? activeProblem?.starterTemplate ?? DEFAULT_EDITOR_TEMPLATE;
}

export function ensureEditorTemplate(
  editorState: EditorState,
  problemId: number,
  starterTemplate: string,
): EditorState {
  if (editorState[problemId] !== undefined) {
    return editorState;
  }

  return {
    ...editorState,
    [problemId]: starterTemplate,
  };
}

export function setEditorValueForProblem(
  editorState: EditorState,
  problemId: number,
  value: string,
): EditorState {
  if (editorState[problemId] === value) {
    return editorState;
  }

  return {
    ...editorState,
    [problemId]: value,
  };
}

export function resetEditorValueForProblem(
  editorState: EditorState,
  problemId: number,
  starterTemplate: string,
): EditorState {
  if (editorState[problemId] === starterTemplate) {
    return editorState;
  }

  return {
    ...editorState,
    [problemId]: starterTemplate,
  };
}
