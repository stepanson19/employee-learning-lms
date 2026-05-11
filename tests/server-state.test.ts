import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { courses, progressRecords, users } from "@/data/lms";
import { createInitialAppState } from "@/lib/state";
import { createFileStateStore, normalizeAppState } from "@/lib/server-state";

const tempDirs: string[] = [];

async function tempFile() {
  const dir = await mkdtemp(join(tmpdir(), "learnhub-state-"));
  tempDirs.push(dir);
  return join(dir, "nested", "state.json");
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

describe("server LMS state storage", () => {
  it("normalizes partial state from older storage versions", () => {
    const normalized = normalizeAppState({
      users,
      courses,
      progressRecords
    });

    expect(normalized.users).toHaveLength(users.length);
    expect(normalized.courseAssignments.length).toBeGreaterThan(0);
    expect(normalized.xpTransactions.length).toBeGreaterThan(0);
    expect(normalized.quizQuestions.length).toBeGreaterThan(0);
  });

  it("persists state to a json file and reads it back", async () => {
    const filePath = await tempFile();
    const store = createFileStateStore(filePath);
    const initial = await store.read();
    const nextState = {
      ...initial,
      users: initial.users.map((user) => (user.id === "u-employee" ? { ...user, xp: 1234 } : user))
    };

    await store.write(nextState);

    const restored = await store.read();
    const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;

    expect(restored.users.find((user) => user.id === "u-employee")?.xp).toBe(1234);
    expect(raw).toMatchObject({ schemaVersion: 1, state: expect.objectContaining({ users: expect.any(Array) }) });
  });

  it("resets storage back to the initial app state", async () => {
    const filePath = await tempFile();
    const store = createFileStateStore(filePath);
    const changedState = {
      ...createInitialAppState(),
      users: createInitialAppState().users.map((user) => (user.id === "u-employee" ? { ...user, xp: 1 } : user))
    };

    await store.write(changedState);
    await store.reset();

    const restored = await store.read();

    expect(restored.users.find((user) => user.id === "u-employee")?.xp).toBe(760);
  });
});
