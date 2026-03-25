import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import type { ProblemDetail, ProblemListItem } from "../lib/problems";
import type { VisibleSampleTestExecutionSummary } from "../lib/sample-tests";

interface WorkspacePanelProps {
  summary: ProblemListItem | null;
  problem: ProblemDetail | null;
  loading: boolean;
  error: string | null;
  editorValue: string;
  elapsedLabel: string;
  canResetEditor: boolean;
  canRunSampleTests: boolean;
  canPrimaryAction: boolean;
  primaryActionLabel: string;
  primaryActionTone?: "primary" | "success";
  sampleTestSummary: VisibleSampleTestExecutionSummary | null;
  onEditorChange: (value: string) => void;
  onResetEditor: () => void;
  onRunSampleTests: () => void;
  onPrimaryAction: () => void;
}

function WorkspacePanel({
  summary,
  problem,
  loading,
  error,
  editorValue,
  elapsedLabel,
  canResetEditor,
  canRunSampleTests,
  canPrimaryAction,
  primaryActionLabel,
  primaryActionTone = "primary",
  sampleTestSummary,
  onEditorChange,
  onResetEditor,
  onRunSampleTests,
  onPrimaryAction,
}: WorkspacePanelProps) {
  const displayTitle = problem?.title ?? summary?.title ?? "Workspace Shell";
  const displayDifficulty =
    problem?.difficulty ?? summary?.difficulty ?? "medium";
  const displayTopic = problem?.topic ?? summary?.topic ?? "Arrays";
  const displayId = problem?.id ?? summary?.id ?? null;
  const sampleSummaryStatus = !sampleTestSummary
    ? null
    : sampleTestSummary.runtimeError
      ? "errored"
      : sampleTestSummary.failedCount > 0
        ? "failed"
        : sampleTestSummary.passedCount === sampleTestSummary.totalCount
          ? "passed"
          : "neutral";

  return (
    <section className="workspace-shell ui-panel ui-panel--elevated">
      <div className="content-split">
        <div className="problem-body">
          <div className="workspace-problem-header">
            <div>
              <h1 className="workspace-problem-title">{displayTitle}</h1>
              {displayId !== null ? (
                <div className="workspace-problem-meta">
                  <span className={`diff-badge diff-${displayDifficulty}`}>{displayDifficulty}</span>
                  <span className="topic-tag">{displayTopic}</span>
                </div>
              ) : null}
            </div>
            <div className="workspace-elapsed" aria-label={`Elapsed time ${elapsedLabel}`}>
              <span className="workspace-elapsed-label">Elapsed time</span>
              <span>{elapsedLabel}</span>
            </div>
          </div>

          {loading ? (
            <div className="workspace-state" role="status" aria-live="polite">
              Loading problem details...
            </div>
          ) : null}

          {error ? (
            <div
              className="workspace-state workspace-state--error"
              role="status"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          {!loading && !error && !problem ? (
            <div className="workspace-state" role="status" aria-live="polite">
              Select a problem to load its details.
            </div>
          ) : null}

          {problem ? (
            <>
              <p className="problem-desc">{problem.description}</p>
            </>
          ) : null}
        </div>

        <div className="editor-section">
          <div className="editor-header">
            <div className="editor-lang-badge">JavaScript</div>
            <div className="editor-meta">{displayTitle}</div>
            <div className="editor-actions">
              <button
                className="editor-btn ui-button ui-button--ghost"
                type="button"
                onClick={onResetEditor}
                disabled={!canResetEditor}
              >
                Reset
              </button>
              <button
                className="editor-btn ui-button ui-button--ghost"
                type="button"
                onClick={onRunSampleTests}
                disabled={!canRunSampleTests}
              >
                Run tests
              </button>
              <button
                className={`editor-btn ui-button ${primaryActionTone === "success" ? "ui-button--success" : "ui-button--primary"}`}
                type="button"
                onClick={onPrimaryAction}
                disabled={!canPrimaryAction}
              >
                {primaryActionLabel}
              </button>
            </div>
          </div>
          <div className="editor-codemirror" data-testid="problem-code-editor">
            <CodeMirror
              key={problem?.id ?? "default"}
              value={editorValue}
              height="100%"
              theme="none"
              extensions={[javascript({ jsx: false })]}
              aria-label="Code editor"
              onChange={onEditorChange}
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLineGutter: false,
                highlightSelectionMatches: false,
                autocompletion: false,
                closeBrackets: false,
                bracketMatching: false,
                indentOnInput: false,
              }}
            />
          </div>
          {sampleTestSummary ? (
            <div
              className={`sample-test-summary sample-test-summary--${sampleSummaryStatus ?? "neutral"}`}
              role="status"
              aria-live="polite"
            >
              <div className="sample-test-summary-header">
                <div>
                  <div className="sample-test-summary-title">
                    Latest sample test run
                  </div>
                  <div className="sample-test-summary-line">
                    {sampleTestSummary.totalCount === 0
                      ? "No visible sample tests were configured for this problem."
                      : `Passed ${sampleTestSummary.passedCount} · Failed ${sampleTestSummary.failedCount} · Errors ${sampleTestSummary.errorCount}`}
                  </div>
                </div>
                <div
                  className={`sample-test-summary-badge sample-test-summary-badge--${sampleSummaryStatus ?? "neutral"}`}
                >
                  {sampleSummaryStatus === "passed"
                    ? "All passed"
                    : sampleSummaryStatus === "failed"
                      ? "Needs work"
                      : sampleSummaryStatus === "errored"
                        ? "Runtime error"
                        : "Ready"}
                </div>
              </div>

              {sampleTestSummary.runtimeError ? (
                <div className="sample-test-summary-runtime">
                  Runtime error: {sampleTestSummary.runtimeError}
                </div>
              ) : null}

              {sampleTestSummary.results.length > 0 ? (
                <div className="sample-test-results">
                  {sampleTestSummary.results.map((result) => (
                    <article
                      key={`${result.index}-${result.input}`}
                      className="sample-test-result ui-card"
                    >
                      <div className="sample-test-result-header">
                        <div
                          className={`sample-test-result-index sample-test-result-index--${result.status}`}
                        >
                          Sample {result.index + 1}
                        </div>
                        <div
                          className={`sample-test-result-status sample-test-result-status--${result.status}`}
                        >
                          {result.status}
                        </div>
                      </div>

                      <div className="sample-test-result-row">
                        <div className="sample-test-result-label">Input</div>
                        <div className="sample-test-result-value">
                          {result.input}
                        </div>
                      </div>

                      <div className="sample-test-result-row">
                        <div className="sample-test-result-label">Expected</div>
                        <div className="sample-test-result-value sample-test-result-value--code">
                          {result.expectedOutput}
                        </div>
                      </div>

                      {result.status === "passed" ||
                      result.status === "failed" ? (
                        <div className="sample-test-result-row">
                          <div className="sample-test-result-label">Actual</div>
                          <div className="sample-test-result-value sample-test-result-value--code">
                            {result.actualOutput}
                          </div>
                        </div>
                      ) : null}

                      {result.status === "errored" ? (
                        <div className="sample-test-result-row">
                          <div className="sample-test-result-label">
                            Runtime error
                          </div>
                          <div className="sample-test-result-value sample-test-result-value--error">
                            {result.runtimeError}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {problem ? (
          <div className="problem-supporting">
            <div className="examples-section">
              <div className="examples-title">Examples</div>
              {problem.examples.map((example, index) => (
                <div
                  key={`${example.input}-${index}`}
                  className="example-block"
                >
                  <div className="example-label">Input</div>
                  <div className="example-in">{example.input}</div>
                  <div className="example-label">Output</div>
                  <div className="example-out">{example.output}</div>
                  {example.note ? (
                    <>
                      <div className="example-label">Note</div>
                      <div className="example-note">{example.note}</div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="constraints-section">
              <div className="constraints-title">Constraints</div>
              {problem.constraints.map((constraint) => (
                <div key={constraint} className="constraint-item">
                  <span className="constraint-bullet">•</span>
                  <span>{constraint}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default WorkspacePanel;
