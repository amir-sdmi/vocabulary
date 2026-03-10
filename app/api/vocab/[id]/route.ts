import { NextRequest, NextResponse } from "next/server";
import { deleteVocabulary, updateVocabulary } from "@/app/lib/vocabulary";
import { isEntryType, isLearningStatus, parseUnknownList } from "@/app/features/vocabulary/helpers";
import { EntryType, LearningStatus } from "@/app/features/vocabulary/types";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { badRequest, notFound, parseJsonBody } from "@/app/lib/server/http";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuthorizedUser(async (userId) => {
    const { id } = await params;
    const parsed = await parseJsonBody<Record<string, unknown>>(request);
    if (!parsed.ok) return parsed.response;
    const payload = parsed.data;
    const status = payload.status;
    const entryType = payload.entryType;
    if (status !== undefined && !isLearningStatus(status)) {
      return badRequest("Invalid status value");
    }
    if (entryType !== undefined && !isEntryType(entryType)) {
      return badRequest("Invalid entryType value");
    }

    const updated = await updateVocabulary(userId, id, {
      term: typeof payload.term === "string" ? payload.term : undefined,
      entryType: entryType as EntryType | undefined,
      lemma: typeof payload.lemma === "string" ? payload.lemma : undefined,
      pos: typeof payload.pos === "string" ? payload.pos : undefined,
      definitionEasyEn:
        typeof payload.definitionEasyEn === "string" ? payload.definitionEasyEn : undefined,
      meaningFa: typeof payload.meaningFa === "string" ? payload.meaningFa : undefined,
      userExample: typeof payload.userExample === "string" ? payload.userExample : undefined,
      status: status as LearningStatus | undefined,
      tags: parseUnknownList(payload.tags),
      collocations: parseUnknownList(payload.collocations),
      synonyms: parseUnknownList(payload.synonyms),
      antonyms: parseUnknownList(payload.antonyms),
      wordFamily:
        typeof payload.wordFamily === "object" && payload.wordFamily !== null
          ? {
              noun:
                typeof (payload.wordFamily as Record<string, unknown>).noun === "string"
                  ? String((payload.wordFamily as Record<string, unknown>).noun)
                  : undefined,
              verb:
                typeof (payload.wordFamily as Record<string, unknown>).verb === "string"
                  ? String((payload.wordFamily as Record<string, unknown>).verb)
                  : undefined,
              adjective:
                typeof (payload.wordFamily as Record<string, unknown>).adjective === "string"
                  ? String((payload.wordFamily as Record<string, unknown>).adjective)
                  : undefined,
              adverb:
                typeof (payload.wordFamily as Record<string, unknown>).adverb === "string"
                  ? String((payload.wordFamily as Record<string, unknown>).adverb)
                  : undefined,
            }
          : undefined,
      aiExamples: parseUnknownList(payload.aiExamples),
    });

    if (!updated) {
      return notFound();
    }

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuthorizedUser(async (userId) => {
    const { id } = await params;
    const removed = await deleteVocabulary(userId, id);
    if (!removed) {
      return notFound();
    }
    return NextResponse.json({ ok: true });
  });
}
