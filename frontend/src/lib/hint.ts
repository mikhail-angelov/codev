const API_BASE = (import.meta.env.VITE_API_URL ?? "/").replace(/\/$/, "");

export type HintMode = "approach" | "complexity" | "edge-cases" | "explain-current-code";

export interface HintRequest {
  problemId: number;
  code: string;
  mode: HintMode;
}

export interface HintResponse {
  mode: HintMode;
  hint: string;
  whyItHelps: string;
  nextStep: string;
}

export function buildHintRequest(problemId: number, code: string, mode: HintMode): HintRequest {
  return {
    problemId,
    code,
    mode,
  };
}

export function getHintModeLabel(mode: HintMode): string {
  switch (mode) {
    case "approach":
      return "Approach";
    case "complexity":
      return "Complexity";
    case "edge-cases":
      return "Edge cases";
    case "explain-current-code":
      return "Explain current code";
  }
}

export async function submitHint(request: HintRequest, signal?: AbortSignal): Promise<HintResponse> {
  const response = await fetch(`${API_BASE}/hint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to request hint (${response.status})`);
  }

  return (await response.json()) as HintResponse;
}
