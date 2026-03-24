import type { ChatResponse } from "./chat";
import type { HintMode, HintResponse } from "./hint";
import type { ReviewResponse } from "./review";

export type { HintMode } from "./hint";
export type AIThreadMessageKind = "system" | "review" | "hint" | "user-chat" | "ai-chat";
export type AIThreadLoadingKind = "review" | "hint" | "chat";

export interface AIThreadLoadingState {
  kind: AIThreadLoadingKind;
  label: string;
}

interface AIThreadMessageBase {
  id: string;
  kind: AIThreadMessageKind;
  timestamp: number;
}

export interface AIThreadSystemMessage extends AIThreadMessageBase {
  kind: "system";
  tone: "default" | "error";
  content: string;
}

export interface AIThreadReviewMessage extends AIThreadMessageBase {
  kind: "review";
  review: ReviewResponse;
  usefulnessFeedback: "up" | "down" | null;
}

export interface AIThreadHintMessage extends AIThreadMessageBase {
  kind: "hint";
  hint: HintResponse;
}

export interface AIThreadUserChatMessage extends AIThreadMessageBase {
  kind: "user-chat";
  content: string;
}

export interface AIThreadAssistantChatMessage extends AIThreadMessageBase {
  kind: "ai-chat";
  content: string;
  focus?: string;
  nextStep?: string;
}

export type AIThreadMessage =
  | AIThreadSystemMessage
  | AIThreadReviewMessage
  | AIThreadHintMessage
  | AIThreadUserChatMessage
  | AIThreadAssistantChatMessage;

function createThreadMessageId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createThreadMessageBase(kind: AIThreadMessageKind): AIThreadMessageBase {
  return {
    id: createThreadMessageId(kind),
    kind,
    timestamp: Date.now(),
  };
}

export function createSystemThreadMessage(content: string, tone: AIThreadSystemMessage["tone"] = "default"): AIThreadSystemMessage {
  return {
    ...createThreadMessageBase("system"),
    kind: "system",
    tone,
    content,
  };
}

export function createReviewThreadMessage(review: ReviewResponse): AIThreadReviewMessage {
  return {
    ...createThreadMessageBase("review"),
    kind: "review",
    review,
    usefulnessFeedback: null,
  };
}

export function createHintThreadMessage(hint: HintResponse): AIThreadHintMessage {
  return {
    ...createThreadMessageBase("hint"),
    kind: "hint",
    hint,
  };
}

export function createUserChatThreadMessage(content: string): AIThreadUserChatMessage {
  return {
    ...createThreadMessageBase("user-chat"),
    kind: "user-chat",
    content,
  };
}

export function createAssistantChatThreadMessage(content: string): AIThreadAssistantChatMessage;
export function createAssistantChatThreadMessage(response: ChatResponse): AIThreadAssistantChatMessage;
export function createAssistantChatThreadMessage(contentOrResponse: string | ChatResponse): AIThreadAssistantChatMessage {
  if (typeof contentOrResponse === "string") {
    return {
      ...createThreadMessageBase("ai-chat"),
      kind: "ai-chat",
      content: contentOrResponse,
    };
  }

  return {
    ...createThreadMessageBase("ai-chat"),
    kind: "ai-chat",
    content: contentOrResponse.reply,
    focus: contentOrResponse.focus,
    nextStep: contentOrResponse.nextStep,
  };
}


export function createSeedThreadMessages(): AIThreadMessage[] {
  return [
    createSystemThreadMessage("AI interviewer is ready. Select a problem and start the loop."),
    createAssistantChatThreadMessage(
      "Reviews, hints, and follow-up questions will appear here. Keep this thread visible while you work.",
    ),
  ];
}
