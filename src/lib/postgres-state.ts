import { Pool } from "pg";
import type { AppState } from "@/types/lms";
import { createInitialAppState } from "@/lib/state";
import { normalizeAppState, type StateStore } from "@/lib/state-normalize";

const snapshotId = "default";
const schemaVersion = 1;

export const postgresStateSchemaSql = `
create table if not exists lms_state_snapshots (
  id text primary key,
  schema_version integer not null,
  state jsonb not null,
  updated_at timestamptz not null default now()
)
`;

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>>; rowCount?: number | null }>;
};

type PostgresStateStoreOptions = {
  connectionString?: string;
  queryable?: Queryable;
};

export function createPostgresStateStore(options: PostgresStateStoreOptions = {}): StateStore {
  const queryable = options.queryable ?? new Pool({ connectionString: options.connectionString ?? process.env.DATABASE_URL });
  let schemaReady = false;

  async function ensureSchema() {
    if (schemaReady) {
      return;
    }

    await queryable.query(postgresStateSchemaSql);
    schemaReady = true;
  }

  async function persist(state: AppState): Promise<AppState> {
    await ensureSchema();

    const normalizedState = normalizeAppState(state);
    await queryable.query(
      `
      insert into lms_state_snapshots (id, schema_version, state, updated_at)
      values ($1, $2, $3::jsonb, now())
      on conflict (id) do update
      set schema_version = excluded.schema_version,
          state = excluded.state,
          updated_at = now()
      `,
      [snapshotId, schemaVersion, JSON.stringify(normalizedState)]
    );

    return normalizedState;
  }

  return {
    async read() {
      await ensureSchema();

      const result = await queryable.query("select state from lms_state_snapshots where id = $1 limit 1", [snapshotId]);
      const storedState = result.rows[0]?.state;

      return storedState ? normalizeAppState(storedState) : createInitialAppState();
    },
    write(state) {
      return persist(state);
    },
    reset() {
      return persist(createInitialAppState());
    }
  };
}
