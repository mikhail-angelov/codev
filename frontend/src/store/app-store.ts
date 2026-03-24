import { create } from "zustand";
import { createSeedThreadMessages, type AIThreadLoadingState, type AIThreadMessage } from "../lib/ai-thread";
import type { ProblemDetail, ProblemListItem } from "../lib/problems";
import type { VisibleSampleTestExecutionSummary } from "../lib/sample-tests";

interface ProblemThreadSessionState {
  messages: AIThreadMessage[];
  loadingState: AIThreadLoadingState | null;
  draft: string;
}

interface AppStoreState {
  problems: ProblemListItem[];
  selectedProblemId: number | null;
  activeTopic: string;
  listLoading: boolean;
  listError: string | null;
  problem: ProblemDetail | null;
  problemLoading: boolean;
  problemError: string | null;
  editorValues: Record<number, string>;
  sampleTestSummaries: Record<number, VisibleSampleTestExecutionSummary>;
  sessionStartedAtByProblem: Record<number, number>;
  sessionNow: number;
  threadSessionsByProblem: Record<number, ProblemThreadSessionState>;
}

interface AppStoreActions {
  setProblems: (problems: ProblemListItem[]) => void;
  setSelectedProblemId: (problemId: number | null) => void;
  setActiveTopic: (topic: string) => void;
  setListLoading: (loading: boolean) => void;
  setListError: (error: string | null) => void;
  setProblem: (problem: ProblemDetail | null) => void;
  setProblemLoading: (loading: boolean) => void;
  setProblemError: (error: string | null) => void;
  ensureEditorTemplate: (problemId: number, starterTemplate: string) => void;
  setEditorValue: (problemId: number, value: string) => void;
  resetEditorValue: (problemId: number, starterTemplate: string) => void;
  setSampleTestSummary: (problemId: number, summary: VisibleSampleTestExecutionSummary | null) => void;
  setSessionStartedAt: (problemId: number, value: number | null) => void;
  setSessionNow: (value: number) => void;
  ensureThreadSession: (problemId: number) => void;
  resetThreadSession: (problemId: number) => void;
  setThreadMessages: (problemId: number, messages: AIThreadMessage[]) => void;
  appendThreadMessages: (problemId: number, ...messages: AIThreadMessage[]) => void;
  setReviewFeedback: (problemId: number, messageId: string, feedback: "up" | "down") => void;
  setThreadLoadingState: (problemId: number, loadingState: AIThreadLoadingState | null) => void;
  setThreadDraft: (problemId: number, draft: string) => void;
  resetStore: () => void;
}

export type AppStore = AppStoreState & AppStoreActions;

function createThreadSessionState(): ProblemThreadSessionState {
  return {
    messages: createSeedThreadMessages(),
    loadingState: null,
    draft: "",
  };
}

function createInitialState(): AppStoreState {
  return {
    problems: [],
    selectedProblemId: null,
    activeTopic: "all",
    listLoading: true,
    listError: null,
    problem: null,
    problemLoading: false,
    problemError: null,
    editorValues: {},
    sampleTestSummaries: {},
    // Problem switches preserve each problem's code, latest sample run, timer, and AI thread.
    sessionStartedAtByProblem: {},
    sessionNow: Date.now(),
    threadSessionsByProblem: {},
  };
}

export const useAppStore = create<AppStore>((set) => ({
  ...createInitialState(),
  setProblems: (problems) => set({ problems }),
  setSelectedProblemId: (selectedProblemId) => set({ selectedProblemId }),
  setActiveTopic: (activeTopic) => set({ activeTopic }),
  setListLoading: (listLoading) => set({ listLoading }),
  setListError: (listError) => set({ listError }),
  setProblem: (problem) => set({ problem }),
  setProblemLoading: (problemLoading) => set({ problemLoading }),
  setProblemError: (problemError) => set({ problemError }),
  ensureEditorTemplate: (problemId, starterTemplate) =>
    set((state) =>
      state.editorValues[problemId] !== undefined
        ? {}
        : {
            editorValues: {
              ...state.editorValues,
              [problemId]: starterTemplate,
            },
          },
    ),
  setEditorValue: (problemId, value) =>
    set((state) =>
      state.editorValues[problemId] === value
        ? {}
        : {
            editorValues: {
              ...state.editorValues,
              [problemId]: value,
            },
          },
    ),
  resetEditorValue: (problemId, starterTemplate) =>
    set((state) =>
      state.editorValues[problemId] === starterTemplate
        ? {}
        : {
            editorValues: {
              ...state.editorValues,
              [problemId]: starterTemplate,
            },
          },
    ),
  setSampleTestSummary: (problemId, summary) =>
    set((state) => {
      if (summary === null) {
        if (!(problemId in state.sampleTestSummaries)) {
          return {};
        }

        const nextSummaries = { ...state.sampleTestSummaries };
        delete nextSummaries[problemId];
        return { sampleTestSummaries: nextSummaries };
      }

      if (state.sampleTestSummaries[problemId] === summary) {
        return {};
      }

      return {
        sampleTestSummaries: {
          ...state.sampleTestSummaries,
          [problemId]: summary,
        },
      };
    }),
  setSessionStartedAt: (problemId, value) =>
    set((state) => {
      if (value === null) {
        if (!(problemId in state.sessionStartedAtByProblem)) {
          return {};
        }

        const nextStartedAt = { ...state.sessionStartedAtByProblem };
        delete nextStartedAt[problemId];
        return { sessionStartedAtByProblem: nextStartedAt };
      }

      if (state.sessionStartedAtByProblem[problemId] === value) {
        return {};
      }

      return {
        sessionStartedAtByProblem: {
          ...state.sessionStartedAtByProblem,
          [problemId]: value,
        },
      };
    }),
  setSessionNow: (sessionNow) => set({ sessionNow }),
  ensureThreadSession: (problemId) =>
    set((state) =>
      state.threadSessionsByProblem[problemId]
        ? {}
        : {
            threadSessionsByProblem: {
              ...state.threadSessionsByProblem,
              [problemId]: createThreadSessionState(),
            },
          },
    ),
  resetThreadSession: (problemId) =>
    set((state) => ({
      threadSessionsByProblem: {
        ...state.threadSessionsByProblem,
        [problemId]: createThreadSessionState(),
      },
    })),
  setThreadMessages: (problemId, messages) =>
    set((state) => ({
      threadSessionsByProblem: {
        ...state.threadSessionsByProblem,
        [problemId]: {
          ...(state.threadSessionsByProblem[problemId] ?? createThreadSessionState()),
          messages,
        },
      },
    })),
  appendThreadMessages: (problemId, ...messages) =>
    set((state) => ({
      threadSessionsByProblem: {
        ...state.threadSessionsByProblem,
        [problemId]: {
          ...(state.threadSessionsByProblem[problemId] ?? createThreadSessionState()),
          messages: (state.threadSessionsByProblem[problemId]?.messages ?? createSeedThreadMessages()).concat(messages),
        },
      },
    })),
  setReviewFeedback: (problemId, messageId, feedback) =>
    set((state) => {
      const session = state.threadSessionsByProblem[problemId];

      if (!session) {
        return {};
      }

      let changed = false;
      const nextMessages = session.messages.map((message) => {
        if (message.kind !== "review" || message.id !== messageId || message.usefulnessFeedback === feedback) {
          return message;
        }

        changed = true;
        return {
          ...message,
          usefulnessFeedback: feedback,
        };
      });

      if (!changed) {
        return {};
      }

      return {
        threadSessionsByProblem: {
          ...state.threadSessionsByProblem,
          [problemId]: {
            ...session,
            messages: nextMessages,
          },
        },
      };
    }),
  setThreadLoadingState: (problemId, loadingState) =>
    set((state) => ({
      threadSessionsByProblem: {
        ...state.threadSessionsByProblem,
        [problemId]: {
          ...(state.threadSessionsByProblem[problemId] ?? createThreadSessionState()),
          loadingState,
        },
      },
    })),
  setThreadDraft: (problemId, draft) =>
    set((state) => ({
      threadSessionsByProblem: {
        ...state.threadSessionsByProblem,
        [problemId]: {
          ...(state.threadSessionsByProblem[problemId] ?? createThreadSessionState()),
          draft,
        },
      },
    })),
  resetStore: () => set(createInitialState()),
}));

export function resetAppStore() {
  useAppStore.getState().resetStore();
}
