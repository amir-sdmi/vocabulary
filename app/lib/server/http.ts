import { NextRequest, NextResponse } from "next/server";

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function parseJsonBody<T>(request: NextRequest): Promise<ParseResult<T>> {
  try {
    const body = (await request.json()) as T;
    return { ok: true, data: body };
  } catch {
    return { ok: false, response: badRequest("Invalid JSON") };
  }
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
