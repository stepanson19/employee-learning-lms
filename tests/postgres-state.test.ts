import { describe, expect, it } from "vitest";
import { createInitialAppState } from "@/lib/state";
import { createPostgresStateStore, postgresStateSchemaSql } from "@/lib/postgres-state";
import { createStateStore } from "@/lib/server-state";

type QueryCall = {
  sql: string;
  params: unknown[];
};

function createFakeQueryable(rows: Array<Record<string, unknown>> = []) {
  const calls: QueryCall[] = [];

  return {
    calls,
    query: async (sql: string, params: unknown[] = []) => {
      calls.push({ sql, params });
      const selectedRows = /select/i.test(sql) ? rows : [];

      return { rows: selectedRows, rowCount: selectedRows.length };
    }
  };
}

describe("postgres LMS state storage", () => {
  it("creates the state table and reads a normalized snapshot", async () => {
    const state = createInitialAppState();
    const queryable = createFakeQueryable([{ state: { ...state, xpTransactions: undefined } }]);
    const store = createPostgresStateStore({ queryable });

    const restored = await store.read();

    expect(queryable.calls[0].sql).toContain(postgresStateSchemaSql);
    expect(queryable.calls.some((call) => /select state/i.test(call.sql))).toBe(true);
    expect(restored.users).toHaveLength(state.users.length);
    expect(restored.xpTransactions.length).toBeGreaterThan(0);
  });

  it("upserts the normalized state snapshot", async () => {
    const state = createInitialAppState();
    const queryable = createFakeQueryable();
    const store = createPostgresStateStore({ queryable });

    await store.write(state);

    const upsert = queryable.calls.find((call) => /insert into lms_state_snapshots/i.test(call.sql));

    expect(upsert).toBeDefined();
    expect(upsert?.params[0]).toBe("default");
    expect(upsert?.params[1]).toBe(1);
    expect(JSON.parse(String(upsert?.params[2]))).toMatchObject({ users: expect.any(Array), courses: expect.any(Array) });
  });

  it("resets postgres storage to the initial state", async () => {
    const queryable = createFakeQueryable();
    const store = createPostgresStateStore({ queryable });

    await store.reset();

    const upsert = queryable.calls.find((call) => /insert into lms_state_snapshots/i.test(call.sql));

    expect(JSON.parse(String(upsert?.params[2])).users.find((user: { id: string }) => user.id === "u-employee").xp).toBe(760);
  });

  it("selects postgres when DATABASE_URL is configured", () => {
    const store = createStateStore({ databaseUrl: "postgres://learnhub:test@localhost:5432/learnhub" });

    expect(store.kind).toBe("postgres");
  });
});
