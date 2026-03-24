import { useEffect, useRef } from "react";
import ProblemListSidebar from "./components/ProblemListSidebar";
import AIThreadPanel from "./components/AIThreadPanel";
import WorkspacePanel from "./components/WorkspacePanel";
import { loadProblemDetail, loadProblemList, type ProblemTopicCount } from "./lib/problems";
import {
  getEditorValueForProblem,
} from "./lib/editor-state";
import {
  formatElapsedTime,
  getProblemSessionActionState,
} from "./lib/problem-session";
import { createVisibleSampleTestExecutionRequest } from "./lib/sample-tests";
import { executeVisibleSampleTests } from "./lib/sample-test-runner";
import { buildReviewRequest, submitReview } from "./lib/review";
import { buildHintRequest, getHintModeLabel, submitHint, type HintMode } from "./lib/hint";
import { buildChatRequest, submitChat } from "./lib/chat";
import {
  createAssistantChatThreadMessage,
  createHintThreadMessage,
  createReviewThreadMessage,
  createSystemThreadMessage,
  createUserChatThreadMessage,
} from "./lib/ai-thread";
import { useAppStore } from "./store/app-store";

function App() {
  const {
    problems,
    selectedProblemId,
    activeTopic,
    listLoading,
    listError,
    problem,
    problemLoading,
    problemError,
    editorValues,
    sampleTestSummaries,
    sessionStartedAtByProblem,
    sessionNow,
    threadSessionsByProblem,
    setProblems,
    setSelectedProblemId,
    setActiveTopic,
    setListLoading,
    setListError,
    setProblem,
    setProblemLoading,
    setProblemError,
    ensureEditorTemplate: ensureEditorTemplateInStore,
    setEditorValue,
    resetEditorValue,
    setSampleTestSummary,
    setSessionStartedAt,
    setSessionNow,
    ensureThreadSession,
    resetThreadSession,
    setThreadMessages,
    appendThreadMessages,
    setReviewFeedback,
    setThreadLoadingState,
    setThreadDraft,
  } = useAppStore();
  const reviewRequestSequence = useRef<Record<number, number>>({});
  const hintRequestSequence = useRef<Record<number, number>>({});
  const chatRequestSequence = useRef<Record<number, number>>({});

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    async function fetchProblems() {
      try {
        const data = await loadProblemList(controller.signal);

        if (!alive) {
          return;
        }

        setProblems(data);
        setSelectedProblemId(useAppStore.getState().selectedProblemId ?? data[0]?.id ?? null);
        setListError(null);
      } catch (fetchError) {
        if (!alive || controller.signal.aborted) {
          return;
        }

        setListError(fetchError instanceof Error ? fetchError.message : "Failed to load problems");
      } finally {
        if (alive) {
          setListLoading(false);
        }
      }
    }

    void fetchProblems();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (selectedProblemId === null) {
      setProblem(null);
      setProblemError(null);
      setProblemLoading(false);
      return;
    }

    const problemId: number = selectedProblemId;
    ensureThreadSession(problemId);

    const controller = new AbortController();
    let alive = true;

    async function fetchProblemDetail() {
      setProblemLoading(true);
      setProblemError(null);

      try {
        const data = await loadProblemDetail(problemId, controller.signal);

        if (!alive) {
          return;
        }

        setProblem(data);
      } catch (fetchError) {
        if (!alive || controller.signal.aborted) {
          return;
        }

        setProblem(null);
        setProblemError(fetchError instanceof Error ? fetchError.message : "Failed to load problem details");
      } finally {
        if (alive) {
          setProblemLoading(false);
        }
      }
    }

    void fetchProblemDetail();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [ensureThreadSession, selectedProblemId, setProblem, setProblemError, setProblemLoading]);

  useEffect(() => {
    if (selectedProblemId === null || sessionStartedAtByProblem[selectedProblemId] !== undefined) {
      return;
    }

    setSessionStartedAt(selectedProblemId, Date.now());
  }, [selectedProblemId, sessionStartedAtByProblem, setSessionStartedAt]);

  useEffect(() => {
    if (sessionStartedAt === null) {
      setSessionNow(Date.now());
      return;
    }

    const updateSessionClock = () => {
      setSessionNow(Date.now());
    };

    updateSessionClock();
    const timer = window.setInterval(updateSessionClock, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [sessionStartedAtByProblem, setSessionNow]);

  const topicCounts: ProblemTopicCount[] = [];
  for (const problemItem of problems) {
    const existing = topicCounts.find((topic) => topic.topic === problemItem.topic);

    if (existing) {
      existing.count += 1;
    } else {
      topicCounts.push({ topic: problemItem.topic, count: 1 });
    }
  }

  const visibleProblems =
    activeTopic === "all" ? problems : problems.filter((problemItem) => problemItem.topic === activeTopic);

  useEffect(() => {
    if (listLoading) {
      return;
    }

    if (visibleProblems.length === 0) {
      if (selectedProblemId !== null) {
        setSelectedProblemId(null);
      }
      return;
    }

    const selectedStillVisible = visibleProblems.some((problemItem) => problemItem.id === selectedProblemId);

    if (!selectedStillVisible) {
      setSelectedProblemId(visibleProblems[0].id);
    }
  }, [listLoading, selectedProblemId, visibleProblems]);

  const selectedProblem = problems.find((problemItem) => problemItem.id === selectedProblemId) ?? null;
  const activeProblem = problem?.id === selectedProblemId ? problem : null;
  const sampleTestSummary = selectedProblemId === null ? null : sampleTestSummaries[selectedProblemId] ?? null;
  const currentThreadSession =
    selectedProblemId === null ? null : threadSessionsByProblem[selectedProblemId] ?? null;
  const threadMessages = currentThreadSession?.messages ?? [];
  const threadLoadingState = currentThreadSession?.loadingState ?? null;
  const threadDraft = currentThreadSession?.draft ?? "";
  const sessionStartedAt = selectedProblemId === null ? null : sessionStartedAtByProblem[selectedProblemId] ?? null;
  const editorValue = getEditorValueForProblem(editorValues, selectedProblemId, activeProblem);
  const elapsedLabel = formatElapsedTime(sessionStartedAt === null ? 0 : sessionNow - sessionStartedAt);
  const aiThreadBusy = threadLoadingState !== null;
  const sessionActionState = getProblemSessionActionState({
    activeProblem,
    editorValue,
    isLoading: listLoading || problemLoading,
    hasError: listError !== null || problemError !== null,
  });

  useEffect(() => {
    if (!activeProblem || selectedProblemId === null) {
      return;
    }

    ensureEditorTemplateInStore(selectedProblemId, activeProblem.starterTemplate);
  }, [activeProblem?.id, activeProblem?.starterTemplate, ensureEditorTemplateInStore, selectedProblemId]);

  function handleEditorChange(value: string) {
    if (selectedProblemId === null) {
      return;
    }

    setEditorValue(selectedProblemId, value);
  }

  function handleResetEditor() {
    if (selectedProblemId === null || !activeProblem) {
      return;
    }

    resetEditorValue(selectedProblemId, activeProblem.starterTemplate);
  }

  function handleRunSampleTests() {
    if (!activeProblem) {
      return;
    }

    const request = createVisibleSampleTestExecutionRequest(activeProblem, editorValue);
    setSampleTestSummary(activeProblem.id, executeVisibleSampleTests(activeProblem, request));
  }

  function handleSubmitForReview() {
    if (!activeProblem || selectedProblemId === null) {
      return;
    }

    const problemId = selectedProblemId;
    const requestId = (reviewRequestSequence.current[problemId] ?? 0) + 1;
    reviewRequestSequence.current[problemId] = requestId;

    const latestTestSummary = sampleTestSummary
      ? {
          passedCount: sampleTestSummary.passedCount,
          failedCount: sampleTestSummary.failedCount,
          failureMessages: sampleTestSummary.failureMessages,
        }
      : undefined;

    setThreadLoadingState(problemId, {
      kind: "review",
      label: "Submitting for review...",
    });

    const request = buildReviewRequest(problemId, editorValue, latestTestSummary);

    void submitReview(request, undefined)
      .then((response) => {
        if (reviewRequestSequence.current[problemId] !== requestId) {
          return;
        }

        appendThreadMessages(problemId, createReviewThreadMessage(response));
      })
      .catch((submitError) => {
        if (reviewRequestSequence.current[problemId] !== requestId) {
          return;
        }

        appendThreadMessages(
          problemId,
          createSystemThreadMessage(
            `Review failed: ${submitError instanceof Error ? submitError.message : "Failed to submit review"}`,
            "error",
          ),
        );
      })
      .finally(() => {
        if (reviewRequestSequence.current[problemId] === requestId) {
          setThreadLoadingState(problemId, null);
        }
      });
  }

  function handleHintClick(mode: HintMode) {
    if (!activeProblem || selectedProblemId === null || aiThreadBusy) {
      return;
    }

    const problemId = selectedProblemId;
    const requestId = (hintRequestSequence.current[problemId] ?? 0) + 1;
    hintRequestSequence.current[problemId] = requestId;

    setThreadLoadingState(problemId, {
      kind: "hint",
      label: `Requesting ${getHintModeLabel(mode)} hint...`,
    });

    const request = buildHintRequest(problemId, editorValue, mode);

    void submitHint(request, undefined)
      .then((response) => {
        if (hintRequestSequence.current[problemId] !== requestId) {
          return;
        }

        appendThreadMessages(problemId, createHintThreadMessage(response));
      })
      .catch((submitError) => {
        if (hintRequestSequence.current[problemId] !== requestId) {
          return;
        }

        appendThreadMessages(
          problemId,
          createSystemThreadMessage(
            `Hint failed: ${submitError instanceof Error ? submitError.message : "Failed to request hint"}`,
            "error",
          ),
        );
      })
      .finally(() => {
        if (hintRequestSequence.current[problemId] === requestId) {
          setThreadLoadingState(problemId, null);
        }
      });
  }

  function handleSendMessage() {
    if (!activeProblem || selectedProblemId === null || threadDraft.trim().length === 0 || aiThreadBusy) {
      return;
    }

    const problemId = selectedProblemId;
    const message = threadDraft.trim();
    const requestId = (chatRequestSequence.current[problemId] ?? 0) + 1;
    chatRequestSequence.current[problemId] = requestId;
    const nextMessages = threadMessages.concat(createUserChatThreadMessage(message));
    const request = buildChatRequest(problemId, editorValue, message, nextMessages);

    setThreadMessages(problemId, nextMessages);
    setThreadDraft(problemId, "");
    setThreadLoadingState(problemId, {
      kind: "chat",
      label: "Sending message...",
    });

    void submitChat(request, undefined)
      .then((response) => {
        if (chatRequestSequence.current[problemId] !== requestId) {
          return;
        }

        appendThreadMessages(problemId, createAssistantChatThreadMessage(response));
      })
      .catch((submitError) => {
        if (chatRequestSequence.current[problemId] !== requestId) {
          return;
        }

        appendThreadMessages(
          problemId,
          createSystemThreadMessage(
            `Chat failed: ${submitError instanceof Error ? submitError.message : "Failed to send chat message"}`,
            "error",
          ),
        );
      })
      .finally(() => {
        if (chatRequestSequence.current[problemId] === requestId) {
          setThreadLoadingState(problemId, null);
        }
      });
  }

  const navText = listLoading
    ? "Loading problem list..."
    : selectedProblem
      ? `Selected: ${selectedProblem.title}`
      : "Select a problem to begin";

  return (
    <div className="app-shell">
      <nav className="nav" aria-label="Codev top bar">
        <div className="nav-logo">
          co<em>dev</em>
        </div>
        <div className="nav-sep" />
        <div className="nav-track">
          <div className="nav-track-dot" />
          <span>{navText}</span>
        </div>
        <div className="nav-right">
          <div className="xp-bar-wrap">
            <span>XP</span>
            <div className="xp-bar" aria-hidden="true">
              <div className="xp-fill" style={{ width: "35%" }} />
            </div>
            <span>350</span>
          </div>
          <div className="streak-badge">3 day streak</div>
        </div>
      </nav>

      <div className="layout">
        <main className="main">
          <ProblemListSidebar
            problems={visibleProblems}
            topics={topicCounts}
            activeTopic={activeTopic}
            loading={listLoading}
            error={listError}
            selectedProblemId={selectedProblemId}
            onSelectTopic={setActiveTopic}
            onSelectProblem={setSelectedProblemId}
          />
          <WorkspacePanel
            summary={selectedProblem}
            problem={problem}
            loading={listLoading || problemLoading}
            error={problemError ?? listError}
            editorValue={editorValue}
            elapsedLabel={elapsedLabel}
            canResetEditor={sessionActionState.canResetEditor}
            canRunSampleTests={sessionActionState.canRunSampleTests}
            canSubmitForReview={sessionActionState.canSubmitForReview && !aiThreadBusy}
            sampleTestSummary={sampleTestSummary}
            onEditorChange={handleEditorChange}
            onResetEditor={handleResetEditor}
            onRunSampleTests={handleRunSampleTests}
            onSubmitForReview={handleSubmitForReview}
          />
        </main>

        <AIThreadPanel
          messages={threadMessages}
          loadingState={threadLoadingState}
          draft={threadDraft}
          onDraftChange={(value) => {
            if (selectedProblemId !== null) {
              setThreadDraft(selectedProblemId, value);
            }
          }}
          onSendMessage={handleSendMessage}
          onHintClick={handleHintClick}
          onReviewFeedback={(messageId, feedback) => {
            if (selectedProblemId !== null) {
              setReviewFeedback(selectedProblemId, messageId, feedback);
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
