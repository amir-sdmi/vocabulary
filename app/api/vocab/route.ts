import { NextRequest, NextResponse } from "next/server";
import { createVocabulary, getVocabularies } from "@/app/lib/vocabulary";
import { filterVocabularies, parseCsvList } from "@/app/features/vocabulary/helpers";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { listSavedFilters } from "@/app/lib/saved-filters";
import { badRequest, parseJsonBody } from "@/app/lib/server/http";

export async function GET(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const { searchParams } = new URL(request.url);
    const list = await getVocabularies(userId);
    const savedFilterId = searchParams.get("savedFilterId") ?? "";
    let saved = undefined;
    if (savedFilterId) {
      const filters = await listSavedFilters(userId);
      saved = filters.find((x) => x.id === savedFilterId);
    }
    const filtered = filterVocabularies(list, {
      q: searchParams.get("q") ?? saved?.filters.q ?? "",
      status: searchParams.get("status") ?? saved?.filters.status ?? "",
      tag: searchParams.get("tag") ?? saved?.filters.tag ?? "",
      meaning: searchParams.get("meaning") ?? saved?.filters.meaning ?? "",
      mistakeType: (searchParams.get("mistakeType") ?? saved?.filters.mistakeType ?? "") as
        | "grammar"
        | "word_choice"
        | "collocation"
        | "meaning_mismatch"
        | "fluency"
        | "",
      entryType: (searchParams.get("entryType") ?? saved?.filters.entryType ?? "") as
        | "word"
        | "phrase"
        | "",
      collocation: searchParams.get("collocation") ?? saved?.filters.collocation ?? "",
      due: (searchParams.get("due") ?? saved?.filters.due ?? "") as "all" | "due" | "overdue" | "",
    });

    return NextResponse.json(filtered);
  });
}

export async function POST(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const parsed = await parseJsonBody<{
      term?: string;
      meaning?: string;
      sentence?: string;
      tags?: string;
    }>(request);
    if (!parsed.ok) return parsed.response;
    const payload = parsed.data;

    if (!payload.term || !payload.term.trim()) {
      return badRequest("`term` is required");
    }

    const created = await createVocabulary(userId, {
      term: payload.term,
      meaning: payload.meaning,
      sentence: payload.sentence,
      tags: parseCsvList(payload.tags ?? ""),
      source: "web",
    });

    return NextResponse.json(created, { status: 201 });
  });
}
