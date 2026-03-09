import { NextRequest, NextResponse } from "next/server";
import { createVocabulary, getVocabularies } from "@/app/lib/vocabulary";
import { filterVocabularies, parseCsvList } from "@/app/features/vocabulary/helpers";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";

export async function GET(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const { searchParams } = new URL(request.url);
  const list = await getVocabularies(userId);
  const filtered = filterVocabularies(list, {
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "",
    tag: searchParams.get("tag") ?? "",
  });

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    term?: string;
    sentence?: string;
    tags?: string;
  };

  if (!payload.term || !payload.term.trim()) {
    return NextResponse.json({ error: "`term` is required" }, { status: 400 });
  }

  const created = await createVocabulary(userId, {
    term: payload.term,
    sentence: payload.sentence,
    tags: parseCsvList(payload.tags ?? ""),
    source: "web",
  });

  return NextResponse.json(created, { status: 201 });
}
