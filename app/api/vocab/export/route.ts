import { NextRequest, NextResponse } from "next/server";
import { getVocabularies, toCsv } from "@/app/lib/vocabulary";
import { getRequiredUserId, unauthorizedJson } from "@/app/lib/server/api-auth";
import { generateWeeklyReport, reportToText } from "@/app/lib/reports";

export async function GET(request: NextRequest) {
  const userId = await getRequiredUserId();
  if (!userId) return unauthorizedJson();

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() ?? "csv";
  const list = await getVocabularies(userId);

  if (format === "json") {
    return new NextResponse(JSON.stringify(list, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="vocabulary-export.json"',
      },
    });
  }

  if (format === "anki") {
    const lines = list.map((item) =>
      [
        item.term,
        item.definitionEasyEn || item.meaningFa || "",
        item.userExample || "",
        item.tags.join(" "),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const content = ["term,meaning,example,tags", ...lines].join("\n");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="vocabulary-anki.csv"',
      },
    });
  }

  if (format === "weekly") {
    const report = reportToText(await generateWeeklyReport(userId));
    return new NextResponse(report, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="vocabulary-weekly-report.txt"',
      },
    });
  }

  const csv = toCsv(list);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vocabulary-export.csv"',
    },
  });
}
