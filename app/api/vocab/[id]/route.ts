import { NextRequest, NextResponse } from "next/server";
import { deleteVocabulary, updateVocabulary } from "@/app/lib/vocabulary";
import { isLearningStatus, parseUnknownList } from "@/app/features/vocabulary/helpers";
import { LearningStatus } from "@/app/features/vocabulary/types";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const status = payload.status;
  if (status !== undefined && !isLearningStatus(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const updated = await updateVocabulary(userId, id, {
    term: typeof payload.term === "string" ? payload.term : undefined,
    lemma: typeof payload.lemma === "string" ? payload.lemma : undefined,
    pos: typeof payload.pos === "string" ? payload.pos : undefined,
    definitionEasyEn:
      typeof payload.definitionEasyEn === "string" ? payload.definitionEasyEn : undefined,
    meaningFa: typeof payload.meaningFa === "string" ? payload.meaningFa : undefined,
    userExample: typeof payload.userExample === "string" ? payload.userExample : undefined,
    status: status as LearningStatus | undefined,
    tags: parseUnknownList(payload.tags),
    collocations: parseUnknownList(payload.collocations),
    aiExamples: parseUnknownList(payload.aiExamples),
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const { id } = await params;
  const removed = await deleteVocabulary(userId, id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
