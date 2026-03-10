import { NextRequest, NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { deleteFilter, listSavedFilters, saveFilter } from "@/app/lib/saved-filters";
import { SortMode, VocabularyFilters } from "@/app/features/vocabulary/types";

export async function GET() {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  const filters = await listSavedFilters(userId);
  return NextResponse.json(filters);
}

export async function POST(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as
    | {
        id?: string;
        name?: string;
        filters?: VocabularyFilters;
        sort?: SortMode;
      }
    | null;
  if (!body?.name || !body.filters || !body.sort) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const saved = await saveFilter({
    userId,
    id: body.id,
    name: body.name,
    filters: body.filters,
    sort: body.sort,
  });
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const removed = await deleteFilter(userId, id);
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
