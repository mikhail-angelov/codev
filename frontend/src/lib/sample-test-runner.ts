import type { ProblemDetail } from "./problems";
import type { VisibleSampleTestExecutionRequest, VisibleSampleTestExecutionSummary, VisibleSampleTestResult } from "./sample-tests";
import { summarizeVisibleSampleTestResults } from "./sample-tests";

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class ListNode {
  val: number;
  next: ListNode | null;

  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function splitTopLevel(source: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const previous = source[index - 1];

    if (quote) {
      current += character;
      if (character === quote && previous !== "\\") {
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"' || character === "`") {
      quote = character;
      current += character;
      continue;
    }

    if (character === "[" || character === "(" || character === "{") {
      depth += 1;
      current += character;
      continue;
    }

    if (character === "]" || character === ")" || character === "}") {
      depth -= 1;
      current += character;
      continue;
    }

    if (character === "," && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) {
        parts.push(trimmed);
      }
      current = "";
      continue;
    }

    current += character;
  }

  const trimmed = current.trim();
  if (trimmed) {
    parts.push(trimmed);
  }

  return parts;
}

function parseAssignments(input: string): Record<string, unknown> {
  const assignments = splitTopLevel(input);
  const values: Record<string, unknown> = {};

  for (const assignment of assignments) {
    const separatorIndex = assignment.indexOf("=");
    if (separatorIndex === -1) {
      throw new Error(`Invalid sample input assignment: ${assignment}`);
    }

    const key = assignment.slice(0, separatorIndex).trim();
    const expression = assignment.slice(separatorIndex + 1).trim();
    values[key] = new Function(`return (${expression});`)();
  }

  return values;
}

function getSignature(code: string): { name: string; params: string[] } {
  const match = code.match(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);

  if (!match) {
    throw new Error("The editor code must declare a function.");
  }

  return {
    name: match[1],
    params: match[2]
      .split(",")
      .map((param) => param.trim())
      .filter(Boolean),
  };
}

function buildTree(values: Array<number | null>): TreeNode | null {
  if (values.length === 0 || values[0] === null) {
    return null;
  }

  const nodes = values.map((value) => (value === null ? null : new TreeNode(value)));
  let childIndex = 1;

  for (let index = 0; index < nodes.length && childIndex < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    node.left = nodes[childIndex] ?? null;
    childIndex += 1;

    if (childIndex < nodes.length) {
      node.right = nodes[childIndex] ?? null;
      childIndex += 1;
    }
  }

  return nodes[0];
}

function buildList(values: number[]): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;

  for (const value of values) {
    tail.next = new ListNode(value);
    tail = tail.next;
  }

  return dummy.next;
}

function serializeList(node: ListNode | null): number[] {
  const values: number[] = [];
  let current = node;

  while (current) {
    values.push(current.val);
    current = current.next;
  }

  return values;
}

function normalizeArgument(problem: ProblemDetail, key: string, value: unknown): unknown {
  if (problem.topic === "Trees" && key === "root" && Array.isArray(value)) {
    return buildTree(value as Array<number | null>);
  }

  if (problem.slug === "merge-k-sorted-lists" && key === "lists" && Array.isArray(value)) {
    return (value as number[][]).map((listValues) => buildList(listValues));
  }

  return structuredClone(value);
}

function serializeActual(problem: ProblemDetail, actual: unknown): string {
  if (problem.slug === "merge-k-sorted-lists") {
    return JSON.stringify(serializeList(actual as ListNode | null));
  }

  if (typeof actual === "string") {
    return JSON.stringify(actual);
  }

  if (actual === undefined) {
    return "undefined";
  }

  return JSON.stringify(actual);
}

function buildSolver(code: string) {
  const { name, params } = getSignature(code);

  const solver = new Function(
    "TreeNode",
    "ListNode",
    `${code}
if (typeof ${name} !== "function") {
  throw new Error("Solver function not found");
}
return ${name};`,
  )(TreeNode, ListNode) as (...args: unknown[]) => unknown;

  return { solver, params };
}

function toFailureMessage(result: VisibleSampleTestResult): string {
  if (result.status === "errored") {
    return `Sample ${result.index + 1}: ${result.runtimeError ?? "Unknown runtime error"}`;
  }

  if (result.status === "failed") {
    return `Sample ${result.index + 1}: expected ${result.expectedOutput} but received ${result.actualOutput ?? "undefined"}`;
  }

  return "";
}

export function executeVisibleSampleTests(
  problem: ProblemDetail,
  request: VisibleSampleTestExecutionRequest,
): VisibleSampleTestExecutionSummary {
  const { solver, params } = buildSolver(request.code);

  const results = request.sampleTests.map<VisibleSampleTestResult>((sampleTest) => {
    try {
      const assignments = parseAssignments(sampleTest.input);
      const args = params.map((param) => normalizeArgument(problem, param, assignments[param]));
      const actual = solver(...args);
      const actualOutput = serializeActual(problem, actual);

      if (actualOutput === sampleTest.expectedOutput) {
        return {
          ...sampleTest,
          status: "passed",
          actualOutput,
        };
      }

      return {
        ...sampleTest,
        status: "failed",
        actualOutput,
      };
    } catch (error) {
      return {
        ...sampleTest,
        status: "errored",
        runtimeError: error instanceof Error ? error.message : "Unknown runtime error",
      };
    }
  });

  const summary = summarizeVisibleSampleTestResults(problem, results);

  return {
    ...summary,
    failureMessages: results.map(toFailureMessage).filter(Boolean),
    runtimeError: results.find((result) => result.status === "errored")?.runtimeError ?? null,
  };
}
