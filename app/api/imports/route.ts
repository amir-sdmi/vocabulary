import { NextRequest, NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { badRequest, parseJsonBody } from "@/app/lib/server/http";
import { executeImport, previewImport } from "@/app/lib/vocabulary";

export async function POST(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const parsed = await parseJsonBody<{
      action?: "preview" | "execute";
      source?: "csv" | "anki" | "google_sheets";
      content?: string;
    }>(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    if (!body?.action || !body.source || !body.content) {
      return badRequest("Missing fields");
    }

    let content = body.content;
    if (body.source === "google_sheets" && /^https?:\/\//i.test(body.content.trim())) {
      const fetched = await fetch(body.content.trim())
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null);
      if (!fetched) {
        return badRequest("Failed to fetch Google Sheets URL");
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
      const executed = await executeImport({
        userId,
        source: body.source,
        content,
      });
      return NextResponse.json(executed);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Import failed");
    }
  });
}
