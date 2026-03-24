export type ProblemDifficulty = "easy" | "medium" | "hard";

export type ProblemTopic =
  | "Arrays"
  | "Strings"
  | "Trees"
  | "Graphs"
  | "Linked Lists"
  | "Recursion"
  | "Dynamic Programming";

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

export interface ProblemRecord {
  id: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: ProblemTopic;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterTemplate: string;
  hints: string[];
  referenceSolution: string;
  sampleTests: ProblemSampleTest[];
}

export class ProblemValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super(`Invalid problem record(s): ${issues.join("; ")}`);
    this.name = "ProblemValidationError";
    this.issues = issues;
  }
}

const validDifficulties: ProblemDifficulty[] = ["easy", "medium", "hard"];
const validTopics: ProblemTopic[] = [
  "Arrays",
  "Strings",
  "Trees",
  "Graphs",
  "Linked Lists",
  "Recursion",
  "Dynamic Programming",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function validateStringArray(
  value: unknown,
  fieldPath: string,
  issues: string[],
): string[] | null {
  if (!Array.isArray(value)) {
    issues.push(`${fieldPath} must be an array of strings`);
    return null;
  }

  const items: string[] = [];

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      issues.push(`${fieldPath}[${index}] must be a non-empty string`);
      return;
    }
    items.push(item);
  });

  return items;
}

function validateExample(
  value: unknown,
  fieldPath: string,
  issues: string[],
): ProblemExample | null {
  if (!isRecord(value)) {
    issues.push(`${fieldPath} must be an object`);
    return null;
  }

  if (!isNonEmptyString(value.input)) {
    issues.push(`${fieldPath}.input must be a non-empty string`);
  }

  if (!isNonEmptyString(value.output)) {
    issues.push(`${fieldPath}.output must be a non-empty string`);
  }

  if (value.note !== undefined && !isNonEmptyString(value.note)) {
    issues.push(`${fieldPath}.note must be a non-empty string when provided`);
  }

  if (!isNonEmptyString(value.input) || !isNonEmptyString(value.output)) {
    return null;
  }

  return {
    input: value.input,
    output: value.output,
    ...(isNonEmptyString(value.note) ? { note: value.note } : {}),
  };
}

function validateSampleTest(
  value: unknown,
  fieldPath: string,
  issues: string[],
): ProblemSampleTest | null {
  if (!isRecord(value)) {
    issues.push(`${fieldPath} must be an object`);
    return null;
  }

  if (!isNonEmptyString(value.input)) {
    issues.push(`${fieldPath}.input must be a non-empty string`);
  }

  if (!isNonEmptyString(value.expectedOutput)) {
    issues.push(`${fieldPath}.expectedOutput must be a non-empty string`);
  }

  if (value.description !== undefined && !isNonEmptyString(value.description)) {
    issues.push(`${fieldPath}.description must be a non-empty string when provided`);
  }

  if (!isNonEmptyString(value.input) || !isNonEmptyString(value.expectedOutput)) {
    return null;
  }

  return {
    input: value.input,
    expectedOutput: value.expectedOutput,
    ...(isNonEmptyString(value.description) ? { description: value.description } : {}),
  };
}

export function validateProblemRecord(
  value: unknown,
  index = 0,
): ProblemRecord {
  const issues: string[] = [];
  const fieldPrefix = `problem[${index}]`;

  if (!isRecord(value)) {
    throw new ProblemValidationError([`${fieldPrefix} must be an object`]);
  }

  if (!isInteger(value.id) || value.id <= 0) {
    issues.push(`${fieldPrefix}.id must be a positive integer`);
  }

  if (!isNonEmptyString(value.slug)) {
    issues.push(`${fieldPrefix}.slug must be a non-empty string`);
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) {
    issues.push(`${fieldPrefix}.slug must use lowercase kebab-case`);
  }

  if (!isNonEmptyString(value.title)) {
    issues.push(`${fieldPrefix}.title must be a non-empty string`);
  }

  if (!validDifficulties.includes(value.difficulty as ProblemDifficulty)) {
    issues.push(
      `${fieldPrefix}.difficulty must be one of ${validDifficulties.join(", ")}`,
    );
  }

  if (!validTopics.includes(value.topic as ProblemTopic)) {
    issues.push(
      `${fieldPrefix}.topic must be one of ${validTopics.join(", ")}`,
    );
  }

  if (!isNonEmptyString(value.description)) {
    issues.push(`${fieldPrefix}.description must be a non-empty string`);
  }

  const examples = validateArrayOfObjects(value.examples, `${fieldPrefix}.examples`, validateExample, issues);
  const constraints = validateStringArray(value.constraints, `${fieldPrefix}.constraints`, issues);
  const hints = validateStringArray(value.hints, `${fieldPrefix}.hints`, issues);

  if (!isNonEmptyString(value.starterTemplate)) {
    issues.push(`${fieldPrefix}.starterTemplate must be a non-empty string`);
  }

  if (!isNonEmptyString(value.referenceSolution)) {
    issues.push(`${fieldPrefix}.referenceSolution must be a non-empty string`);
  }

  const sampleTests = validateArrayOfObjects(
    value.sampleTests,
    `${fieldPrefix}.sampleTests`,
    validateSampleTest,
    issues,
  );

  if (issues.length > 0 || !examples || !constraints || !hints || !sampleTests) {
    throw new ProblemValidationError(issues);
  }

  const record = value as {
    id: number;
    slug: string;
    title: string;
    difficulty: ProblemDifficulty;
    topic: ProblemTopic;
    description: string;
    starterTemplate: string;
    referenceSolution: string;
  };

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    difficulty: record.difficulty,
    topic: record.topic,
    description: record.description,
    examples,
    constraints,
    starterTemplate: record.starterTemplate,
    hints,
    referenceSolution: record.referenceSolution,
    sampleTests,
  };
}

function validateArrayOfObjects<T>(
  value: unknown,
  fieldPath: string,
  validator: (item: unknown, itemFieldPath: string, issues: string[]) => T | null,
  issues: string[],
): T[] | null {
  if (!Array.isArray(value)) {
    issues.push(`${fieldPath} must be an array`);
    return null;
  }

  const result: T[] = [];

  value.forEach((item, index) => {
    const validated = validator(item, `${fieldPath}[${index}]`, issues);
    if (validated) {
      result.push(validated);
    }
  });

  return result;
}

export function validateProblemRecords(value: unknown): ProblemRecord[] {
  if (!Array.isArray(value)) {
    throw new ProblemValidationError(["problem records payload must be an array"]);
  }

  const records = value.map((item, index) => validateProblemRecord(item, index));
  return records;
}

export function loadProblemRecords(value: unknown): ProblemRecord[] {
  return validateProblemRecords(value);
}
