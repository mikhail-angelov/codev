import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { resetAppStore, useAppStore } from "./store/app-store";

type ProblemFixture = {
  id: number;
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
};

type ProblemDetailFixture = ProblemFixture & {
  description: string;
  examples: Array<{ input: string; output: string; note?: string }>;
  constraints: string[];
  starterTemplate: string;
  hints: string[];
  sampleTests: Array<{ input: string; expectedOutput: string; description?: string }>;
};

const problems: ProblemFixture[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    topic: "Arrays",
  },
  {
    id: 15,
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    topic: "Strings",
  },
];

const problemDetails: Record<number, ProblemDetailFixture> = {
  1: {
    ...problems[0],
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        note: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    constraints: ["2 <= nums.length <= 10^4", "Exactly one valid answer exists"],
    starterTemplate: "function twoSum(nums, target) {\n  return [];\n}",
    hints: ["Try a hash map."],
    sampleTests: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        description: "classic case",
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
      },
    ],
  },
  15: {
    ...problems[1],
    description: "Given a string s, return the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", note: 'The answer is "abc".' },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    starterTemplate: "function lengthOfLongestSubstring(s) {\n  return 0;\n}",
    hints: ["Use a sliding window."],
    sampleTests: [
      {
        input: 's = "abcabcbb"',
        expectedOutput: "3",
      },
    ],
  },
};

const reviewResponseFixture = {
  isCorrect: true,
  correctness: "Logic is sound for the provided examples.",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  improvements: ["Handle duplicate inputs more explicitly.", "Add a short comment for the lookup map."],
  followUp: "How would you adapt this if the input were streamed?",
};

const hintResponseFixture = {
  mode: "approach" as const,
  hint: "Use a hash map to track complements.",
  whyItHelps: "It turns the lookup into constant time.",
  nextStep: "Scan the array once and return when the complement appears.",
};

const chatResponseFixture = {
  reply: "You are close. The key is to keep the left boundary moving until the window has no duplicates.",
  focus: "Sliding window invariant",
  nextStep: "Write out the duplicate-shrinking loop and test it on pwwkew.",
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetAppStore();
});

function mockFetchOnce(body: unknown, options: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => body,
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockProblemRequests(options: {
  detailFailures?: Record<number, { ok?: boolean; status?: number; body?: unknown }>;
  hintFailure?: { ok?: boolean; status?: number; body?: unknown };
  hintResponse?: unknown | Promise<unknown>;
  chatFailure?: { ok?: boolean; status?: number; body?: unknown };
  chatResponse?: unknown | Promise<unknown>;
  reviewFailure?: { ok?: boolean; status?: number; body?: unknown };
  reviewResponse?: unknown | Promise<unknown>;
} = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith("/problems")) {
      return {
        ok: true,
        status: 200,
        json: async () => problems,
      } as Response;
    }

    const match = url.match(/\/problems\/(\d+)$/);

    if (match) {
      const problemId = Number(match[1]);
      const failure = options.detailFailures?.[problemId];

      if (failure) {
        return {
          ok: failure.ok ?? false,
          status: failure.status ?? 500,
          json: async () => failure.body ?? { error: "failed" },
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => problemDetails[problemId],
      } as Response;
    }

    if (url.endsWith("/review")) {
      const reviewFailure = options.reviewFailure;

      if (reviewFailure) {
        return {
          ok: reviewFailure.ok ?? false,
          status: reviewFailure.status ?? 500,
          json: async () => reviewFailure.body ?? { error: "failed" },
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => options.reviewResponse ?? reviewResponseFixture,
      } as Response;
    }

    if (url.endsWith("/hint")) {
      const hintFailure = options.hintFailure;

      if (hintFailure) {
        return {
          ok: hintFailure.ok ?? false,
          status: hintFailure.status ?? 500,
          json: async () => hintFailure.body ?? { error: "failed" },
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => options.hintResponse ?? hintResponseFixture,
      } as Response;
    }

    if (url.endsWith("/chat")) {
      const chatFailure = options.chatFailure;

      if (chatFailure) {
        return {
          ok: chatFailure.ok ?? false,
          status: chatFailure.status ?? 500,
          json: async () => chatFailure.body ?? { error: "failed" },
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => options.chatResponse ?? chatResponseFixture,
      } as Response;
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("App problem list flow", () => {
  it("renders loading states while the problem list is pending", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    const { container } = render(<App />);
    const workspace = within(container.querySelector(".workspace-shell") as HTMLElement);

    expect(screen.getByText("Loading problems...")).toBeInTheDocument();
    expect(screen.getByText("Loading problem details...")).toBeInTheDocument();
    expect(workspace.getAllByRole("button", { name: /^Reset$/i })[0]).toBeDisabled();
    expect(workspace.getAllByRole("button", { name: /^Run tests$/i })[0]).toBeDisabled();
    expect(workspace.getAllByRole("button", { name: /^Submit & review$/i })[0]).toBeDisabled();
    expect(screen.getByLabelText(/Elapsed time/i)).toHaveTextContent("00:00");
  });

  it("keeps the action bar gated until a problem is ready and preserves timer state per problem", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const app = within(container.querySelector(".app-shell") as HTMLElement);
    const workspace = within(container.querySelector(".workspace-shell") as HTMLElement);
    const problemList = within(container.querySelector(".sidebar") as HTMLElement);

    expect(await app.findByText(problemDetails[1].description)).toBeInTheDocument();

    expect(workspace.getAllByRole("button", { name: /^Reset$/i })[0]).toBeDisabled();
    expect(workspace.getAllByRole("button", { name: /^Run tests$/i }).some((button) => !button.hasAttribute("disabled"))).toBe(true);
    expect(workspace.getAllByRole("button", { name: /^Submit & review$/i }).some((button) => !button.hasAttribute("disabled"))).toBe(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1100);
    });

    await waitFor(() => {
      expect(app.getByLabelText(/Elapsed time/i)).toHaveTextContent("00:01");
    });

    fireEvent.click(problemList.getAllByRole("button", { name: /longest substring without repeating characters/i })[0]);
    expect(await app.findByText(problemDetails[15].description)).toBeInTheDocument();
    expect(app.getByLabelText(/Elapsed time/i)).toHaveTextContent("00:00");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1100);
    });

    await waitFor(() => {
      expect(app.getByLabelText(/Elapsed time/i)).toHaveTextContent("00:01");
    });

    fireEvent.click(problemList.getAllByRole("button", { name: /two sum/i })[0]);
    expect(await app.findByText(problemDetails[1].description)).toBeInTheDocument();

    await waitFor(() => {
      expect(app.getByLabelText(/Elapsed time/i)).toHaveTextContent("00:02");
    });
  });

  it("clears the AI panel draft while keeping sample test results when switching problems", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const app = within(container.querySelector(".app-shell") as HTMLElement);
    const problemList = within(container.querySelector(".sidebar") as HTMLElement);

    await app.findByRole("heading", { name: /two sum/i });

    fireEvent.click(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)!);
    expect(await app.findByText("Latest sample test run")).toBeInTheDocument();

    const composer = app.getByPlaceholderText("Ask the interviewer anything...");
    fireEvent.change(composer, { target: { value: "Need help on Two Sum" } });
    expect(composer).toHaveValue("Need help on Two Sum");

    fireEvent.click(problemList.getAllByRole("button", { name: /longest substring without repeating characters/i })[0]);
    expect(await app.findByRole("heading", { name: /longest substring without repeating characters/i })).toBeInTheDocument();
    expect(app.queryByText("Latest sample test run")).not.toBeInTheDocument();
    expect(app.getByPlaceholderText("Ask the interviewer anything...")).toHaveValue("");

    fireEvent.click(problemList.getAllByRole("button", { name: /two sum/i })[0]);
    expect(await app.findByRole("heading", { name: /two sum/i })).toBeInTheDocument();
    expect(await app.findByText("Latest sample test run")).toBeInTheDocument();
    expect(app.getByPlaceholderText("Ask the interviewer anything...")).toHaveValue("");
  });

  it("renders the selected problem detail and updates when a problem is selected", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const app = within(container.querySelector(".app-shell") as HTMLElement);
    const sidebar = within(container.querySelector(".sidebar") as HTMLElement);

    const editorContains = async (text: string) => {
      const editors = await app.findAllByTestId("problem-code-editor");
      return editors.some((editor) => editor.textContent?.includes(text));
    };

    const firstProblem = (await sidebar.findAllByRole("button", { name: /two sum/i }))[0];
    expect(await app.findByRole("heading", { name: /two sum/i })).toBeInTheDocument();
    expect(
      await app.findByText(
        /Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target\./i,
      ),
    ).toBeInTheDocument();
    expect(app.getByText("nums = [2,7,11,15], target = 9")).toBeInTheDocument();
    expect(app.getByText("2 <= nums.length <= 10^4")).toBeInTheDocument();
    expect(await editorContains("function twoSum(nums, target)")).toBe(true);
    expect(await editorContains("return [];")).toBe(true);
    expect(firstProblem).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(sidebar.getAllByRole("button", { name: /longest substring without repeating characters/i })[0]);

    expect(await app.findByRole("heading", { name: /longest substring without repeating characters/i })).toBeInTheDocument();
    expect(app.getByText("Given a string s, return the length of the longest substring without repeating characters.")).toBeInTheDocument();
    expect(await editorContains("function lengthOfLongestSubstring(s)")).toBe(true);
    expect(sidebar.getByRole("button", { name: /longest substring without repeating characters/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("filters problems by topic and keeps selection on a visible problem", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });

    const stringsTopicButtons = await app.findAllByRole("button", { name: /^Strings \(1\)$/i });
    stringsTopicButtons.forEach((button) => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(app.queryByRole("button", { name: /two sum/i })).not.toBeInTheDocument();
      expect(app.getByRole("button", { name: /longest substring without repeating characters/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
    expect(await app.findByRole("heading", { name: /longest substring without repeating characters/i })).toBeInTheDocument();

    app.getAllByRole("button", { name: /^All topics$/i }).forEach((button) => {
      fireEvent.click(button);
    });

    expect(app.getByRole("button", { name: /two sum/i })).toBeInTheDocument();
    expect(app.getByRole("button", { name: /longest substring without repeating characters/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders empty states when no problems are returned", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/problems")) {
        return {
          ok: true,
          status: 200,
          json: async () => [],
        } as Response;
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findByText("No problems available yet.")).toBeInTheDocument();
    expect(screen.getByText("Select a problem to load its details.")).toBeInTheDocument();
  });

  it("shows an error when problem details fail to load", async () => {
    mockProblemRequests({
      detailFailures: {
        1: {
          ok: false,
          status: 500,
          body: { error: "boom" },
        },
      },
    });

    render(<App />);

    expect(await screen.findByText("Failed to load problem details (500)")).toBeInTheDocument();
  });

  it("shows readable list-level errors when the problem catalog fails to load", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/problems")) {
        return {
          ok: false,
          status: 503,
          json: async () => ({ error: "unavailable" }),
        } as Response;
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findAllByText("Failed to load problems (503)")).toHaveLength(2);
  });

  it("runs visible sample tests and shows the summary", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await waitFor(() => {
      expect(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)).not.toBeDisabled();
    });
    fireEvent.click(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)!);

    const summaryTitle = await app.findByText("Latest sample test run");
    expect(summaryTitle).toBeInTheDocument();
    expect(summaryTitle.parentElement?.textContent).toContain("Failed");
    expect(app.getByText("Sample 1")).toBeInTheDocument();
  });

  it("submits the current code and latest sample summary for review", async () => {
    let resolveReviewResponse!: (value: typeof reviewResponseFixture) => void;
    const reviewResponsePromise = new Promise<typeof reviewResponseFixture>((resolve) => {
      resolveReviewResponse = resolve;
    });

    const fetchMock = mockProblemRequests({
      reviewResponse: reviewResponsePromise,
    });

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await waitFor(() => {
      expect(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)).not.toBeDisabled();
    });

    fireEvent.click(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)!);
    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);

    expect(await app.findByText("Submitting for review...", { selector: ".ai-thread-loading-copy" })).toBeInTheDocument();
    expect(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)).toBeDisabled();

    resolveReviewResponse(reviewResponseFixture);

    expect(await app.findByText(reviewResponseFixture.correctness)).toBeInTheDocument();
    expect(app.getAllByText(reviewResponseFixture.timeComplexity).length).toBeGreaterThan(0);
    expect(app.getAllByText(reviewResponseFixture.spaceComplexity).length).toBeGreaterThan(0);
    expect(app.getByText(reviewResponseFixture.followUp)).toBeInTheDocument();
    expect(app.getByText(reviewResponseFixture.improvements[0])).toBeInTheDocument();

    const reviewCall = fetchMock.mock.calls.find(([input]) => String(input).endsWith("/review"));
    expect(reviewCall).toBeDefined();

    const init = reviewCall?.[1] as RequestInit | undefined;
    const body = init?.body ? JSON.parse(String(init.body)) : null;

    expect(body).toEqual(
      expect.objectContaining({
        problemId: 1,
        code: expect.stringContaining("function twoSum(nums, target)"),
        latestTestSummary: expect.objectContaining({
          passedCount: 0,
          failedCount: 2,
          failureMessages: expect.any(Array),
        }),
      }),
    );
  });

  it("appends each review to the AI thread when the user submits again", async () => {
    const reviewResponses = [
      {
        isCorrect: true,
        correctness: "First review",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        improvements: ["First improvement"],
        followUp: "First follow-up?",
      },
      {
        isCorrect: true,
        correctness: "Second review",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        improvements: ["Second improvement"],
        followUp: "Second follow-up?",
      },
    ];

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/problems")) {
        return {
          ok: true,
          status: 200,
          json: async () => problems,
        } as Response;
      }

      const match = url.match(/\/problems\/(\d+)$/);

      if (match) {
        return {
          ok: true,
          status: 200,
          json: async () => problemDetails[Number(match[1])],
        } as Response;
      }

      if (url.endsWith("/review")) {
        const response = reviewResponses.shift();

        return {
          ok: true,
          status: 200,
          json: async () => response,
        } as Response;
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await waitFor(() => {
      expect(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)).not.toBeDisabled();
    });

    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);
    expect(await app.findByText("First review")).toBeInTheDocument();

    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);

    expect(await app.findByText("Second review")).toBeInTheDocument();
    expect(app.getAllByText("First review").length).toBeGreaterThan(0);

    const reviewCalls = fetchMock.mock.calls.filter(([input]) => String(input).endsWith("/review")) as Array<
      [RequestInfo | URL, RequestInit?]
    >;
    expect(reviewCalls).toHaveLength(2);

    const secondInit = reviewCalls[1]?.[1] as RequestInit | undefined;
    const secondBody = secondInit?.body ? JSON.parse(String(secondInit.body)) : null;

    expect(secondBody).toEqual(
      expect.objectContaining({
        problemId: 1,
        code: expect.stringContaining("function twoSum(nums, target)"),
      }),
    );
  });

  it("requests a live chat reply with recent thread context and renders it in the shared thread", async () => {
    let resolveHintResponse!: (value: typeof hintResponseFixture) => void;
    const hintResponsePromise = new Promise<typeof hintResponseFixture>((resolve) => {
      resolveHintResponse = resolve;
    });

    let resolveChatResponse!: (value: typeof chatResponseFixture) => void;
    const chatResponsePromise = new Promise<typeof chatResponseFixture>((resolve) => {
      resolveChatResponse = resolve;
    });

    const fetchMock = mockProblemRequests({
      hintResponse: hintResponsePromise,
      chatResponse: chatResponsePromise,
    });

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await app.findByText(problemDetails[1].description);

    fireEvent.click(app.getByRole("button", { name: /^Approach$/i }));

    expect(await app.findByText("Requesting Approach hint...", { selector: ".ai-thread-loading-copy" })).toBeInTheDocument();

    const hintCall = fetchMock.mock.calls.find(([input]) => String(input).endsWith("/hint"));
    expect(hintCall).toBeDefined();

    const hintInit = hintCall?.[1] as RequestInit | undefined;
    const hintBody = hintInit?.body ? JSON.parse(String(hintInit.body)) : null;

    expect(hintBody).toEqual(
      expect.objectContaining({
        problemId: 1,
        code: expect.stringContaining("function twoSum(nums, target)"),
        mode: "approach",
      }),
    );

    resolveHintResponse(hintResponseFixture);

    expect(await app.findByText(hintResponseFixture.hint)).toBeInTheDocument();
    expect(app.getByText(hintResponseFixture.whyItHelps)).toBeInTheDocument();
    expect(app.getByText(hintResponseFixture.nextStep)).toBeInTheDocument();

    const input = app.getByPlaceholderText("Ask the interviewer anything...");
    fireEvent.change(input, { target: { value: "What should I check first?" } });
    fireEvent.click(app.getByRole("button", { name: /^Send message$/i }));

    expect(await app.findByText("Sending message...", { selector: ".ai-thread-loading-copy" })).toBeInTheDocument();
    expect(await app.findByText("What should I check first?")).toBeInTheDocument();

    const chatCall = fetchMock.mock.calls.find(([inputUrl]) => String(inputUrl).endsWith("/chat"));
    expect(chatCall).toBeDefined();

    const chatInit = chatCall?.[1] as RequestInit | undefined;
    const chatBody = chatInit?.body ? JSON.parse(String(chatInit.body)) : null;

    expect(chatBody).toEqual(
      expect.objectContaining({
        problemId: 1,
        code: expect.stringContaining("function twoSum(nums, target)"),
        userMessage: "What should I check first?",
        recentMessages: expect.arrayContaining([
          expect.objectContaining({
            role: "assistant",
            content: expect.stringContaining(hintResponseFixture.hint),
          }),
        ]),
      }),
    );

    resolveChatResponse(chatResponseFixture);

    expect(await app.findByText(chatResponseFixture.reply)).toBeInTheDocument();
    expect(app.getByText(chatResponseFixture.focus)).toBeInTheDocument();
    expect(app.getByText(chatResponseFixture.nextStep)).toBeInTheDocument();
  });

  it("shows review errors when the submit request fails", async () => {
    mockProblemRequests({
      reviewFailure: {
        ok: false,
        status: 503,
        body: { error: "unavailable" },
      },
    });

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await waitFor(() => {
      expect(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)).not.toBeDisabled();
    });
    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);

    expect(await app.findByText("Review failed: Failed to submit review (503)")).toBeInTheDocument();
    expect(
      app.getByText("Review failed: Failed to submit review (503)", { selector: ".ai-thread-message--error" }),
    ).toBeInTheDocument();
  });

  it("covers the core integration loop from problem selection through chat follow-up", async () => {
    const fetchMock = mockProblemRequests();

    const { container } = render(<App />);
    const appShell = container.querySelector(".app-shell") as HTMLElement;
    const app = within(appShell);
    const sidebar = within(container.querySelector(".sidebar") as HTMLElement);

    expect(await app.findByRole("button", { name: /two sum/i })).toBeInTheDocument();
    expect(app.getByRole("button", { name: /longest substring without repeating characters/i })).toBeInTheDocument();

    fireEvent.click(sidebar.getByRole("button", { name: /longest substring without repeating characters/i }));
    expect(await app.findByRole("heading", { name: /longest substring without repeating characters/i })).toBeInTheDocument();

    act(() => {
      useAppStore.getState().setEditorValue(
        15,
        'function lengthOfLongestSubstring(s) {\n  if (s.length === 0) {\n    return 0;\n  }\n\n  return s.length;\n}',
      );
    });

    fireEvent.click(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)!);
    expect(await app.findByText("Latest sample test run")).toBeInTheDocument();

    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);
    expect(await app.findByText(reviewResponseFixture.correctness)).toBeInTheDocument();

    fireEvent.click(app.getByRole("button", { name: /^Approach$/i }));
    expect(await app.findByText(hintResponseFixture.hint)).toBeInTheDocument();

    const input = app.getByPlaceholderText("Ask the interviewer anything...");
    fireEvent.change(input, { target: { value: "What should I improve next?" } });
    fireEvent.click(app.getByRole("button", { name: /^Send message$/i }));

    expect(await app.findByText(chatResponseFixture.reply)).toBeInTheDocument();

    const reviewCall = fetchMock.mock.calls.find(([inputUrl]) => String(inputUrl).endsWith("/review"));
    const reviewBody = reviewCall?.[1]?.body ? JSON.parse(String(reviewCall[1]?.body)) : null;
    expect(reviewBody).toEqual(
      expect.objectContaining({
        problemId: 15,
        code: expect.stringContaining("return s.length;"),
      }),
    );
  });

  it("shows hint errors when the hint request fails", async () => {
    mockProblemRequests({
      hintFailure: {
        ok: false,
        status: 429,
        body: { error: "rate limited" },
      },
    });

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    fireEvent.click(app.getByRole("button", { name: /^Approach$/i }));

    expect(await app.findByText("Hint failed: Failed to request hint (429)")).toBeInTheDocument();
    expect(
      app.getByText("Hint failed: Failed to request hint (429)", { selector: ".ai-thread-message--error" }),
    ).toBeInTheDocument();
  });

  it("records review usefulness feedback locally in the review thread", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);
    expect(await app.findByText(reviewResponseFixture.correctness)).toBeInTheDocument();

    const helpfulButton = app.getByRole("button", { name: "Helpful" });
    const notHelpfulButton = app.getByRole("button", { name: "Not helpful" });

    fireEvent.click(helpfulButton);

    expect(helpfulButton).toHaveAttribute("aria-pressed", "true");
    expect(notHelpfulButton).toHaveAttribute("aria-pressed", "false");
  });

  it("shows a correctness verdict and unlocks moving to the next task after a correct reviewed solution", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await waitFor(() => {
      expect(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)).not.toBeDisabled();
    });

    act(() => {
      useAppStore.getState().setEditorValue(
        1,
        "function twoSum(nums, target) {\n  const seen = new Map();\n\n  for (let index = 0; index < nums.length; index += 1) {\n    const value = nums[index];\n    const complement = target - value;\n\n    if (seen.has(complement)) {\n      return [seen.get(complement), index];\n    }\n\n    seen.set(value, index);\n  }\n\n  return [];\n}",
      );
    });

    fireEvent.click(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)!);
    expect(await app.findByText("All passed")).toBeInTheDocument();

    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);
    expect(await app.findByText("Correct solution")).toBeInTheDocument();

    const nextTaskButton = app.getByRole("button", { name: /^Move to next task$/i });
    expect(nextTaskButton).toHaveClass("ui-button--success");
  });

  it("moves to the next visible task and clears the right panel after a correct review", async () => {
    mockProblemRequests();

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });
    await waitFor(() => {
      expect(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)).not.toBeDisabled();
    });

    fireEvent.click(app.getByRole("button", { name: /^Approach$/i }));
    expect(await app.findByText(hintResponseFixture.hint)).toBeInTheDocument();

    act(() => {
      useAppStore.getState().setEditorValue(
        1,
        "function twoSum(nums, target) {\n  const seen = new Map();\n\n  for (let index = 0; index < nums.length; index += 1) {\n    const value = nums[index];\n    const complement = target - value;\n\n    if (seen.has(complement)) {\n      return [seen.get(complement), index];\n    }\n\n    seen.set(value, index);\n  }\n\n  return [];\n}",
      );
    });

    fireEvent.click(app.getAllByRole("button", { name: /^Run tests$/i }).at(-1)!);
    fireEvent.click(app.getAllByRole("button", { name: /^Submit & review$/i }).at(-1)!);
    expect(await app.findByText("Correct solution")).toBeInTheDocument();

    fireEvent.click(app.getByRole("button", { name: /^Move to next task$/i }));

    expect(await app.findByRole("heading", { name: /longest substring without repeating characters/i })).toBeInTheDocument();
    expect(app.queryByText(hintResponseFixture.hint)).not.toBeInTheDocument();
    expect(app.queryByText("Correct solution")).not.toBeInTheDocument();
    expect(app.getByText("AI interviewer is ready. Select a problem and start the loop.")).toBeInTheDocument();
  });

  it("shows chat errors when the follow-up request fails", async () => {
    mockProblemRequests({
      chatFailure: {
        ok: false,
        status: 502,
        body: { error: "upstream failure" },
      },
    });

    const { container } = render(<App />);
    const appShells = container.querySelectorAll(".app-shell");
    const appShell = appShells[appShells.length - 1] as HTMLElement;
    const app = within(appShell);

    await app.findByRole("heading", { name: /two sum/i });

    const input = app.getByPlaceholderText("Ask the interviewer anything...");
    fireEvent.change(input, { target: { value: "Is my complexity right?" } });
    fireEvent.click(app.getByRole("button", { name: /^Send message$/i }));

    expect(await app.findByText("Chat failed: Failed to send chat (502)")).toBeInTheDocument();
    expect(
      app.getByText("Chat failed: Failed to send chat (502)", { selector: ".ai-thread-message--error" }),
    ).toBeInTheDocument();
  });
});
