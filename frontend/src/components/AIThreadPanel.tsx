import { useEffect, useRef } from "react";
import ReviewCard from "./ReviewCard";
import { getHintModeLabel, type HintMode } from "../lib/hint";
import type {
  AIThreadLoadingState,
  AIThreadMessage,
} from "../lib/ai-thread";

interface AIThreadPanelProps {
  messages: AIThreadMessage[];
  loadingState: AIThreadLoadingState | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSendMessage: () => void;
  onHintClick: (mode: HintMode) => void;
  onReviewFeedback?: (messageId: string, feedback: "up" | "down") => void;
}

const hintButtons: Array<{ label: string; mode: HintMode }> = [
  { label: getHintModeLabel("approach"), mode: "approach" },
  { label: getHintModeLabel("complexity"), mode: "complexity" },
  { label: getHintModeLabel("edge-cases"), mode: "edge-cases" },
  { label: getHintModeLabel("explain-current-code"), mode: "explain-current-code" },
];

function renderThreadMessage(
  message: AIThreadMessage,
  onReviewFeedback?: (messageId: string, feedback: "up" | "down") => void,
) {
  switch (message.kind) {
    case "system":
      return (
        <div className={`ai-thread-message ai-thread-message--system${message.tone === "error" ? " ai-thread-message--error" : ""}`}>
          {message.content}
        </div>
      );
    case "review":
      return (
        <div className="ai-thread-message ai-thread-message--review">
          <ReviewCard
            review={message.review}
            loading={false}
            error={null}
            usefulnessFeedback={message.usefulnessFeedback}
            onUsefulnessFeedback={(feedback) => onReviewFeedback?.(message.id, feedback)}
          />
        </div>
      );
    case "hint":
      return (
        <article className="ai-thread-message ai-thread-message--assistant ai-thread-message--hint">
          <div className="msg-bubble msg-bubble--hint ui-card">
            <div className="msg-label">Hint · {getHintModeLabel(message.hint.mode)}</div>
            <div className="ai-thread-hint-lead">{message.hint.hint}</div>
            <div className="ai-thread-hint-section">
              <div className="ai-thread-hint-section-label">Why it helps</div>
              <div className="ai-thread-hint-section-copy">{message.hint.whyItHelps}</div>
            </div>
            <div className="ai-thread-hint-section">
              <div className="ai-thread-hint-section-label">Next step</div>
              <div className="ai-thread-hint-section-copy">{message.hint.nextStep}</div>
            </div>
          </div>
        </article>
      );
    case "user-chat":
      return (
        <article className="ai-thread-message ai-thread-message--user">
          <div className="msg-bubble msg-bubble--user ui-card">
            <div className="msg-label">You</div>
            <div>{message.content}</div>
          </div>
        </article>
      );
    case "ai-chat":
      return (
        <article className="ai-thread-message ai-thread-message--assistant ai-thread-message--chat">
          <div className="msg-bubble msg-bubble--assistant ui-card">
            <div className="msg-label">AI interviewer</div>
            <div className="ai-thread-chat-reply">{message.content}</div>
            {message.focus ? (
              <div className="ai-thread-hint-section">
                <div className="ai-thread-hint-section-label">Focus</div>
                <div className="ai-thread-hint-section-copy">{message.focus}</div>
              </div>
            ) : null}
            {message.nextStep ? (
              <div className="ai-thread-hint-section">
                <div className="ai-thread-hint-section-label">Next step</div>
                <div className="ai-thread-hint-section-copy">{message.nextStep}</div>
              </div>
            ) : null}
          </div>
        </article>
      );
  }
}

function AIThreadPanel({
  messages,
  loadingState,
  draft,
  onDraftChange,
  onSendMessage,
  onHintClick,
  onReviewFeedback,
}: AIThreadPanelProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const actionsDisabled = loadingState !== null;
  const canSendMessage = draft.trim().length > 0 && !actionsDisabled;

  useEffect(() => {
    const scrollTarget = endRef.current;

    if (scrollTarget && typeof scrollTarget.scrollIntoView === "function") {
      scrollTarget.scrollIntoView({ block: "end" });
    }
  }, [loadingState?.label, messages.length]);

  return (
    <aside className="ai-panel ui-panel">
      <div className="ai-header">
        <div className="ai-header-top">
          <div className="ai-title">AI Interviewer</div>
          <div className="ai-status">
            <div className={`ai-status-dot ${loadingState ? "active" : ""}`} />
            <span>{loadingState ? loadingState.label : "Ready"}</span>
          </div>
        </div>
        <div className="hint-buttons">
          {hintButtons.map((hintButton) => (
            <button
              className="hint-btn ui-button ui-button--ghost"
              type="button"
              key={hintButton.mode}
              onClick={() => onHintClick(hintButton.mode)}
              disabled={actionsDisabled}
            >
              {hintButton.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-thread-list" role="log" aria-label="AI conversation" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className="ai-thread-item">
            {renderThreadMessage(message, onReviewFeedback)}
          </div>
        ))}

        {loadingState ? (
          <div className="ai-thread-item ai-thread-item--loading">
            <div className="ai-thread-loading ui-card" role="status" aria-live="polite">
              <div className="ai-thread-loading-label">
                {loadingState.kind === "review"
                  ? "Review"
                  : loadingState.kind === "hint"
                    ? "Hint"
                    : "AI action"}{" "}
                in progress
              </div>
              <div className="ai-thread-loading-copy">{loadingState.label}</div>
            </div>
          </div>
        ) : null}

        <div ref={endRef} aria-hidden="true" />
      </div>

      <div className="ai-input-area">
        <textarea
          className="ai-input ui-input"
          placeholder="Ask the interviewer anything..."
          rows={2}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          disabled={actionsDisabled}
        />
        <button
          className="ai-send-btn ui-button ui-button--primary"
          type="button"
          aria-label="Send message"
          onClick={onSendMessage}
          disabled={!canSendMessage}
        >
          →
        </button>
      </div>
    </aside>
  );
}

export default AIThreadPanel;
