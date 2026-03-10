import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { getLearningInsights } from "@/app/lib/review";

const TIPS: Record<string, string> = {
  grammar: "Keep tense and punctuation consistent. Read your sentence aloud before submitting.",
  word_choice: "Use simpler synonyms first, then expand to more advanced collocations.",
  collocation: "Practice common word partnerships (verb+noun, adjective+noun) for natural phrasing.",
  meaning_mismatch: "Ensure the target word appears with the intended meaning from your context.",
  fluency: "Aim for 8-14 words with a complete idea and clear connector.",
};

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const insights = await getLearningInsights(userId);
    const notebook = insights.topErrors.map((item) => ({
      type: item.type,
      count: item.count,
      tip: TIPS[item.type] ?? "Practice this pattern with 3 fresh examples.",
    }));
    return NextResponse.json({
      notebook,
    });
  });
}
