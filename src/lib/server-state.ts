import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { AppState } from "@/types/lms";
import { createInitialAppState } from "@/lib/state";
import { createPostgresStateStore } from "@/lib/postgres-state";
import { normalizeAppState, type StateStore } from "@/lib/state-normalize";

export { normalizeAppState } from "@/lib/state-normalize";

const schemaVersion = 1;

type StoredStateEnvelope = {
  schemaVersion: number;
  state: Partial<AppState>;
};

export type LmsStateStore = StateStore & {
  kind: "file" | "postgres";
};

export function getDefaultStateFilePath(): string {
  if (process.env.LEARNHUB_STATE_FILE) {
    return process.env.LEARNHUB_STATE_FILE;
  }

  if (process.env.VERCEL) {
    return join(tmpdir(), "learnhub-lms-state.json");
  }

  return join(process.cwd(), ".learnhub", "state.json");
}

export function createFileStateStore(filePath = getDefaultStateFilePath()): LmsStateStore {
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
    kind: "file",
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

export function createStateStore({ databaseUrl = process.env.DATABASE_URL }: { databaseUrl?: string } = {}): LmsStateStore {
  if (databaseUrl) {
    return {
      ...createPostgresStateStore({ connectionString: databaseUrl }),
      kind: "postgres"
    };
  }

  return createFileStateStore();
}

export const lmsStateStore = createStateStore();
