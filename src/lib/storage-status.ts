import type { AppState } from "@/types/lms";
import type { LmsStateStore } from "@/lib/server-state";

export type StorageStatus = {
  storageMode: LmsStateStore["kind"];
  storageLabel: "JSON fallback" | "PostgreSQL";
  databaseConfigured: boolean;
  generatedAt: string;
  counts: {
    users: number;
    courses: number;
    progressRecords: number;
    quizQuestions: number;
    quizAttempts: number;
    assignments: number;
    feedback: number;
    xpTransactions: number;
  };
};

export function createStorageStatus({
  databaseUrl = process.env.DATABASE_URL,
  generatedAt = new Date().toISOString(),
  state,
  storeKind
}: {
  databaseUrl?: string;
  generatedAt?: string;
  state: AppState;
  storeKind: LmsStateStore["kind"];
}): StorageStatus {
  return {
    storageMode: storeKind,
    storageLabel: storeKind === "postgres" ? "PostgreSQL" : "JSON fallback",
    databaseConfigured: Boolean(databaseUrl),
    generatedAt,
    counts: {
      users: state.users.length,
      courses: state.courses.length,
      progressRecords: state.progressRecords.length,
      quizQuestions: state.quizQuestions.length,
      quizAttempts: state.quizAttempts.length,
      assignments: state.courseAssignments.length,
      feedback: state.feedbackItems.length,
      xpTransactions: state.xpTransactions.length
    }
  };
}
