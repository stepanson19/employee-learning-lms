import { describe, expect, it } from "vitest";
import { createInitialAppState } from "@/lib/state";
import { createStorageStatus } from "@/lib/storage-status";

describe("storage status", () => {
  it("summarizes json fallback storage", () => {
    const status = createStorageStatus({
      databaseUrl: undefined,
      state: createInitialAppState(),
      storeKind: "file"
    });

    expect(status).toMatchObject({
      databaseConfigured: false,
      storageLabel: "JSON fallback",
      storageMode: "file"
    });
    expect(status.counts).toMatchObject({
      users: 4,
      courses: 5,
      progressRecords: 6
    });
  });

  it("summarizes postgres storage when DATABASE_URL is configured", () => {
    const status = createStorageStatus({
      databaseUrl: "postgres://learnhub:test@localhost:5432/learnhub",
      state: createInitialAppState(),
      storeKind: "postgres"
    });

    expect(status).toMatchObject({
      databaseConfigured: true,
      storageLabel: "PostgreSQL",
      storageMode: "postgres"
    });
  });
});
