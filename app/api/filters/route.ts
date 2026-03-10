import { NextRequest, NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { deleteFilter, listSavedFilters, saveFilter } from "@/app/lib/saved-filters";
import { SortMode, VocabularyFilters } from "@/app/features/vocabulary/types";
import { badRequest, notFound, parseJsonBody } from "@/app/lib/server/http";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const filters = await listSavedFilters(userId);
    return NextResponse.json(filters);
  });
}

export async function POST(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const parsed = await parseJsonBody<{
      id?: string;
      name?: string;
      filters?: VocabularyFilters;
      sort?: SortMode;
    }>(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    if (!body?.name || !body.filters || !body.sort) {
      return badRequest("Missing fields");
    }

    const saved = await saveFilter({
      userId,
      id: body.id,
      name: body.name,
      filters: body.filters,
      sort: body.sort,
    });
    return NextResponse.json(saved, { status: 201 });
  });
}

export async function DELETE(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return badRequest("Missing id");
    const removed = await deleteFilter(userId, id);
    if (!removed) return notFound();
    return NextResponse.json({ ok: true });
  });
}
