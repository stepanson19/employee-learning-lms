import { NextResponse } from "next/server";
import { lmsStateStore } from "@/lib/server-state";
import { createStorageStatus } from "@/lib/storage-status";

export const runtime = "nodejs";

export async function GET() {
  const state = await lmsStateStore.read();
  const status = createStorageStatus({
    databaseUrl: process.env.DATABASE_URL,
    state,
    storeKind: lmsStateStore.kind
  });

  return NextResponse.json({ ok: true, data: status });
}
