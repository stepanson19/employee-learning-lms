"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoAccounts } from "@/data/lms";
import type { AppState, Feedback, Session } from "@/types/lms";
import { authenticateUser } from "@/lib/auth";
import {
  addDiscussionMessage as addDiscussionMessageToState,
  completeLesson as completeLessonInState,
  createInitialAppState,
  redeemReward as redeemRewardInState,
  submitQuizAttempt as submitQuizAttemptToState,
  addQuizQuestion as addQuizQuestionToState,
  submitFeedback as submitFeedbackToState
} from "@/lib/state";
import type { QuizOption } from "@/types/lms";

type LoginResult = { ok: true } | { ok: false; message: string };

type FeedbackInput = Pick<Feedback, "courseId" | "rating" | "comment">;

interface LmsContextValue {
  hydrated: boolean;
  session: Session | null;
  currentUser: AppState["users"][number] | null;
  state: AppState;
  login: (email: string, passcode: string) => LoginResult;
  logout: () => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  submitFeedback: (input: FeedbackInput) => void;
  addDiscussionMessage: (courseId: string, text: string) => void;
  redeemReward: (rewardId: string) => void;
  submitQuizAttempt: (courseId: string, lessonId: string, answers: Record<string, string>) => void;
  addQuizQuestion: (input: {
    courseId: string;
    lessonId: string;
    prompt: string;
    options: QuizOption[];
    correctOptionId: string;
    explanation: string;
  }) => void;
  resetDemo: () => void;
}

const storageKeys = {
  state: "learnhub.full.state",
  session: "learnhub.full.session"
};

const LmsContext = createContext<LmsContextValue | null>(null);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStoredState(): AppState {
  const initialState = createInitialAppState();

  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const rawState = window.localStorage.getItem(storageKeys.state);
    const parsedState = rawState ? (JSON.parse(rawState) as Partial<AppState>) : null;

    return parsedState
      ? {
          ...initialState,
          ...parsedState,
          quizQuestions: parsedState.quizQuestions ?? initialState.quizQuestions,
          quizAttempts: parsedState.quizAttempts ?? initialState.quizAttempts,
          rewardRedemptions: parsedState.rewardRedemptions ?? initialState.rewardRedemptions
        }
      : initialState;
  } catch {
    return initialState;
  }
}

function loadStoredSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(storageKeys.session);
    return rawSession ? (JSON.parse(rawSession) as Session) : null;
  } catch {
    return null;
  }
}

export function LmsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<AppState>(() => createInitialAppState());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setState(loadStoredState());
    setSession(loadStoredSession());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKeys.state, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (session) {
      window.localStorage.setItem(storageKeys.session, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(storageKeys.session);
    }
  }, [hydrated, session]);

  const currentUser = useMemo(() => {
    if (!session) {
      return null;
    }

    return state.users.find((user) => user.id === session.userId) ?? null;
  }, [session, state.users]);

  const value = useMemo<LmsContextValue>(
    () => ({
      hydrated,
      session,
      currentUser,
      state,
      login(email, passcode) {
        const result = authenticateUser(demoAccounts, email, passcode, state.users);

        if (!result.ok) {
          return { ok: false, message: result.message };
        }

        setSession(result.session);
        return { ok: true };
      },
      logout() {
        setSession(null);
      },
      completeLesson(courseId, lessonId) {
        if (!session) {
          return;
        }

        setState((current) => completeLessonInState(current, session.userId, courseId, lessonId, today()));
      },
      submitFeedback(input) {
        if (!session) {
          return;
        }

        setState((current) =>
          submitFeedbackToState(current, {
            ...input,
            userId: session.userId,
            createdAt: today()
          })
        );
      },
      addDiscussionMessage(courseId, text) {
        if (!session || text.trim().length === 0) {
          return;
        }

        setState((current) =>
          addDiscussionMessageToState(current, {
            courseId,
            authorId: session.userId,
            text: text.trim(),
            createdAt: today()
          })
        );
      },
      redeemReward(rewardId) {
        if (!session) {
          return;
        }

        setState((current) => redeemRewardInState(current, session.userId, rewardId, today()));
      },
      submitQuizAttempt(courseId, lessonId, answers) {
        if (!session) {
          return;
        }

        setState((current) => submitQuizAttemptToState(current, session.userId, courseId, lessonId, answers, today()));
      },
      addQuizQuestion(input) {
        if (!session || session.role !== "author") {
          return;
        }

        setState((current) => addQuizQuestionToState(current, input));
      },
      resetDemo() {
        const nextState = createInitialAppState();
        setState(nextState);
        setSession(null);
        window.localStorage.removeItem(storageKeys.state);
        window.localStorage.removeItem(storageKeys.session);
      }
    }),
    [currentUser, hydrated, session, state]
  );

  return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLms() {
  const value = useContext(LmsContext);

  if (!value) {
    throw new Error("useLms must be used inside LmsProvider");
  }

  return value;
}
