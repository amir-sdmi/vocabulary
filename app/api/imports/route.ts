import { NextRequest, NextResponse } from "next/server";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { executeImport, previewImport } from "@/app/lib/vocabulary";

export async function POST(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();
  const body = (await request.json().catch(() => null)) as
    | {
        action?: "preview" | "execute";
        source?: "csv" | "anki" | "google_sheets";
        content?: string;
      }
    | null;
  if (!body?.action || !body.source || !body.content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let content = body.content;
  if (body.source === "google_sheets" && /^https?:\/\//i.test(body.content.trim())) {
    const fetched = await fetch(body.content.trim()).then((r) => (r.ok ? r.text() : null)).catch(() => null);
    if (!fetched) {
      return NextResponse.json({ error: "Failed to fetch Google Sheets URL" }, { status: 400 });
    }
    content = fetched;
  }

  try {
    if (body.action === "preview") {
      const result = await previewImport({
        userId,
        source: body.source,
        content,
      });
      return NextResponse.json(result);
    }
    const result = await executeImport({
      userId,
      source: body.source,
      content,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 400 },
    );
  }
}
