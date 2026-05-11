import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { AppState } from "@/types/lms";
import { createInitialAppState } from "@/lib/state";

const schemaVersion = 1;

type StoredStateEnvelope = {
  schemaVersion: number;
  state: Partial<AppState>;
};

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

export function getDefaultStateFilePath(): string {
  if (process.env.LEARNHUB_STATE_FILE) {
    return process.env.LEARNHUB_STATE_FILE;
  }

  if (process.env.VERCEL) {
    return join(tmpdir(), "learnhub-lms-state.json");
  }

  return join(process.cwd(), ".learnhub", "state.json");
}

export function createFileStateStore(filePath = getDefaultStateFilePath()): StateStore {
  async function persist(state: AppState): Promise<AppState> {
    const normalizedState = normalizeAppState(state);
    const envelope: StoredStateEnvelope = {
      schemaVersion,
      state: normalizedState
    };

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");

    return normalizedState;
  }

  return {
    async read() {
      try {
        const rawState = await readFile(filePath, "utf8");
        const parsed = JSON.parse(rawState) as Partial<StoredStateEnvelope> | Partial<AppState>;
        const storedState = "state" in parsed ? parsed.state : parsed;

        return normalizeAppState(storedState);
      } catch {
        return createInitialAppState();
      }
    },
    write(state) {
      return persist(state);
    },
    reset() {
      return persist(createInitialAppState());
    }
  };
}

export const lmsStateStore = createFileStateStore();
