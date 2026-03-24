import type { ProblemDetail } from "./problems";

export interface ProblemSessionActionState {
  canResetEditor: boolean;
  canRunSampleTests: boolean;
  canSubmitForReview: boolean;
}

interface ProblemSessionActionInput {
  activeProblem: Pick<ProblemDetail, "starterTemplate"> | null;
  editorValue: string;
  isLoading: boolean;
  hasError: boolean;
}

export function getProblemSessionActionState({
  activeProblem,
  editorValue,
  isLoading,
  hasError,
}: ProblemSessionActionInput): ProblemSessionActionState {
  const isReady = activeProblem !== null && !isLoading && !hasError;

  return {
    canResetEditor: isReady && editorValue !== activeProblem.starterTemplate,
    canRunSampleTests: isReady,
    canSubmitForReview: isReady,
  };
}

export function formatElapsedTime(elapsedMs: number): string {
  const safeElapsedMs = Math.max(0, elapsedMs);
  const totalSeconds = Math.floor(safeElapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

