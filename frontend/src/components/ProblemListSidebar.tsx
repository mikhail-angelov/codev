import type { ProblemListItem, ProblemTopicCount } from "../lib/problems";

interface ProblemListSidebarProps {
  problems: ProblemListItem[];
  topics: ProblemTopicCount[];
  activeTopic: string;
  loading: boolean;
  error: string | null;
  selectedProblemId: number | null;
  onSelectTopic: (topic: string) => void;
  onSelectProblem: (problemId: number) => void;
}

function ProblemListSidebar({
  problems,
  topics,
  activeTopic,
  loading,
  error,
  selectedProblemId,
  onSelectTopic,
  onSelectProblem,
}: ProblemListSidebarProps) {
  const isEmpty = !loading && !error && problems.length === 0;

  return (
    <aside className="sidebar ui-panel">
      <div className="sidebar-section">
        <div className="sidebar-heading">Problems</div>
        <div className="problem-list-meta">
          <span>{problems.length} visible</span>
          <span>JavaScript only</span>
        </div>

        <div className="topic-filter" aria-label="Filter problems by topic">
          <button
            type="button"
            className={`topic-filter-pill ui-button ui-button--ghost${activeTopic === "all" ? " active" : ""}`}
            aria-pressed={activeTopic === "all"}
            aria-label="All topics"
            onClick={() => onSelectTopic("all")}
          >
            All
          </button>
          {topics.map((topic) => (
            <button
              key={topic.topic}
              type="button"
              className={`topic-filter-pill ui-button ui-button--ghost${activeTopic === topic.topic ? " active" : ""}`}
              aria-pressed={activeTopic === topic.topic}
              aria-label={`${topic.topic} (${topic.count})`}
              onClick={() => onSelectTopic(topic.topic)}
            >
              <span>{topic.topic}</span>
              <span className="topic-filter-count">{topic.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="problem-list-status" role="status" aria-live="polite">
            Loading problems...
          </div>
        ) : null}

        {error ? (
          <div className="problem-list-status problem-list-status--error" role="status" aria-live="polite">
            {error}
          </div>
        ) : null}

        {isEmpty ? (
          <div className="problem-list-status" role="status" aria-live="polite">
            No problems available yet.
          </div>
        ) : null}

        <div className="problem-list" aria-label="Problem list">
          {problems.map((problem) => {
            const selected = problem.id === selectedProblemId;

            return (
              <button
                key={problem.slug}
                type="button"
                className={`problem-list-item ui-card${selected ? " active" : ""}`}
                aria-pressed={selected}
                onClick={() => onSelectProblem(problem.id)}
              >
                <div className="problem-list-item-index">#{String(problem.id).padStart(2, "0")}</div>
                <div className="problem-list-item-body">
                  <div className="problem-list-item-title">{problem.title}</div>
                  <div className="problem-list-item-badges">
                    <span className={`diff-badge diff-${problem.difficulty}`}>{problem.difficulty}</span>
                    <span className="topic-tag">{problem.topic}</span>
                  </div>
                </div>
                <div className="problem-list-item-arrow">›</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="progress-section ui-panel ui-panel--subtle">
        <div className="progress-title">Session rhythm</div>
        <div className="progress-bars">
          <div className="pbar-row">
            <div className="pbar-label">Easy</div>
            <div className="pbar-track">
              <div className="pbar-fill green" style={{ width: "78%" }} />
            </div>
            <div className="pbar-pct">78%</div>
          </div>
          <div className="pbar-row">
            <div className="pbar-label">Medium</div>
            <div className="pbar-track">
              <div className="pbar-fill amber" style={{ width: "46%" }} />
            </div>
            <div className="pbar-pct">46%</div>
          </div>
          <div className="pbar-row">
            <div className="pbar-label">Hard</div>
            <div className="pbar-track">
              <div className="pbar-fill red" style={{ width: "22%" }} />
            </div>
            <div className="pbar-pct">22%</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ProblemListSidebar;
