create table if not exists lms_state_snapshots (
  id text primary key,
  schema_version integer not null,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
