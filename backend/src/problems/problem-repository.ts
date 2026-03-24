import { problemSeeds } from "./problem-seeds.js";
import type { ProblemDifficulty, ProblemRecord, ProblemTopic } from "./problem-schema.js";
import { stripStarterTemplateImplementation } from "./starter-template.js";

export interface ProblemListItem {
  id: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: ProblemTopic;
}

export type ProblemPublicRecord = Omit<ProblemRecord, "referenceSolution">;

export interface ProblemRepository {
  list(): ProblemListItem[];
  getById(id: number): ProblemPublicRecord | null;
  getBySlug(slug: string): ProblemPublicRecord | null;
}

type ProblemIndex = {
  byId: Map<number, ProblemRecord>;
  bySlug: Map<string, ProblemRecord>;
};

function cloneProblemRecord(problem: ProblemRecord): ProblemRecord {
  return {
    ...problem,
    examples: problem.examples.map((example) => ({ ...example })),
    constraints: [...problem.constraints],
    starterTemplate: stripStarterTemplateImplementation(problem.starterTemplate),
    hints: [...problem.hints],
    referenceSolution: problem.referenceSolution,
    sampleTests: problem.sampleTests.map((sampleTest) => ({ ...sampleTest })),
  };
}

function toPublicProblemRecord(problem: ProblemRecord): ProblemPublicRecord {
  const { referenceSolution: _referenceSolution, ...publicProblem } = cloneProblemRecord(problem);
  return publicProblem;
}

function toProblemListItem(problem: ProblemRecord): ProblemListItem {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    topic: problem.topic,
  };
}

function buildProblemIndex(records: ProblemRecord[]): ProblemIndex {
  const byId = new Map<number, ProblemRecord>();
  const bySlug = new Map<string, ProblemRecord>();

  for (const record of records) {
    byId.set(record.id, record);
    bySlug.set(record.slug, record);
  }

  return { byId, bySlug };
}

export function createProblemRepository(records: ProblemRecord[] = problemSeeds): ProblemRepository {
  const index = buildProblemIndex(records);

  return {
    list() {
      return records.map((problem) => toProblemListItem(problem));
    },

    getById(id: number) {
      const problem = index.byId.get(id);
      return problem ? toPublicProblemRecord(problem) : null;
    },

    getBySlug(slug: string) {
      const problem = index.bySlug.get(slug);
      return problem ? toPublicProblemRecord(problem) : null;
    },
  };
}

export const problemRepository = createProblemRepository();
