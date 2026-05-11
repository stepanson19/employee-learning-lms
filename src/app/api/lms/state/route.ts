import { NextResponse } from "next/server";
import type { AppState } from "@/types/lms";
import { lmsStateStore, normalizeAppState } from "@/lib/server-state";

export const runtime = "nodejs";

type StateRequestBody = {
  state?: Partial<AppState>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function GET() {
  const state = await lmsStateStore.read();

  return NextResponse.json({ ok: true, data: state });
}

export async function PUT(request: Request) {
  let body: StateRequestBody;

  if (!isSameOriginRequest(request)) {
    return jsonError("same-origin request is required", 403);
  }

  try {
    body = (await request.json()) as StateRequestBody;
  } catch {
    return jsonError("invalid json body", 400);
  }

  if (!body || typeof body !== "object" || !body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
    return jsonError("state payload is required", 400);
  }

  const state = await lmsStateStore.write(normalizeAppState(body.state));

  return NextResponse.json({ ok: true, data: state });
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonError("same-origin request is required", 403);
  }

  const state = await lmsStateStore.reset();

  return NextResponse.json({ ok: true, data: state });
}
