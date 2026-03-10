import { NextRequest, NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { badRequest, parseJsonBody } from "@/app/lib/server/http";
import { evaluateSentenceLab } from "@/app/lib/sentence-lab";

export async function POST(request: NextRequest) {
  return withAuthorizedUser(async () => {
    const parsed = await parseJsonBody<{ sentence?: string; targetTerm?: string }>(request);
    if (!parsed.ok) return parsed.response;
    const sentence = parsed.data.sentence?.trim();
    if (!sentence) return badRequest("`sentence` is required");
    const result = await evaluateSentenceLab({
      sentence,
      targetTerm: parsed.data.targetTerm?.trim(),
    });
    return NextResponse.json(result);
  });
}
