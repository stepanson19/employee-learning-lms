import type { AppState } from "@/types/lms";
import { createInitialAppState } from "@/lib/state";

export interface StateStore {
  read: () => Promise<AppState>;
  write: (state: AppState) => Promise<AppState>;
  reset: () => Promise<AppState>;
}

function useArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function normalizeAppState(value: unknown): AppState {
  const initialState = createInitialAppState();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return initialState;
  }

  const state = value as Partial<AppState>;

  return createInitialAppState({
    users: useArray(state.users, initialState.users),
    courses: useArray(state.courses, initialState.courses),
    progressRecords: useArray(state.progressRecords, initialState.progressRecords),
    discussionMessages: useArray(state.discussionMessages, initialState.discussionMessages),
    feedbackItems: useArray(state.feedbackItems, initialState.feedbackItems),
    rewardRedemptions: useArray(state.rewardRedemptions, initialState.rewardRedemptions),
    quizQuestions: useArray(state.quizQuestions, initialState.quizQuestions),
    quizAttempts: useArray(state.quizAttempts, initialState.quizAttempts),
    courseAssignments: useArray(state.courseAssignments, initialState.courseAssignments),
    xpTransactions: useArray(state.xpTransactions, initialState.xpTransactions)
  });
}
