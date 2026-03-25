export type ProblemDifficulty = "easy" | "medium" | "hard";

export interface ProblemListItem {
  id: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
}

export interface ProblemTopicCount {
  topic: string;
  count: number;
}

export interface ProblemExample {
  input: string;
  output: string;
  note?: string;
}

export interface ProblemSampleTest {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface ProblemDetail extends ProblemListItem {
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterTemplate: string;
  hints: string[];
  sampleTests: ProblemSampleTest[];
}

const API_BASE = '';

export async function loadProblemList(signal?: AbortSignal): Promise<ProblemListItem[]> {
  const response = await fetch(`${API_BASE}/problems`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load problems (${response.status})`);
  }

  return (await response.json()) as ProblemListItem[];
}

export async function loadProblemDetail(problemId: number, signal?: AbortSignal): Promise<ProblemDetail> {
  const response = await fetch(`${API_BASE}/problems/${problemId}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load problem details (${response.status})`);
  }

  return (await response.json()) as ProblemDetail;
}
