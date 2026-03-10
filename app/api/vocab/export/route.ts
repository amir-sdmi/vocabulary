import { NextRequest, NextResponse } from "next/server";
import { getVocabularies, toCsv } from "@/app/lib/vocabulary";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { generateWeeklyReport, reportToText } from "@/app/lib/reports";

export async function GET(request: NextRequest) {
  return withAuthorizedUser(async (userId) => {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format")?.toLowerCase() ?? "csv";
    const profile = searchParams.get("profile")?.toLowerCase() ?? "";
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
      const selected =
        profile === "exam"
          ? list.map((item) => ({
              headers: ["term", "meaning", "synonyms", "antonyms"],
              row: [
                item.term,
                item.definitionEasyEn || item.meaningFa || "",
                item.synonyms.join("|"),
                item.antonyms.join("|"),
              ],
            }))
          : profile === "speaking"
            ? list.map((item) => ({
                headers: ["term", "collocations", "example", "register"],
                row: [
                  item.term,
                  item.collocations.join("|"),
                  item.userExample || "",
                  item.entryType === "phrase" ? "natural_phrase" : "word",
                ],
              }))
            : list.map((item) => ({
                headers: ["term", "meaning", "example", "tags"],
                row: [
                  item.term,
                  item.definitionEasyEn || item.meaningFa || "",
                  item.userExample || "",
                  item.tags.join(" "),
                ],
              }));
      const headers = selected[0]?.headers ?? ["term", "meaning", "example", "tags"];
      const lines = selected.map((item) =>
        item.row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      );
      const content = [headers.join(","), ...lines].join("\n");
      const fileSuffix =
        profile === "exam" ? "exam" : profile === "speaking" ? "speaking" : "clean";
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="vocabulary-anki-${fileSuffix}.csv"`,
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
  });
}
