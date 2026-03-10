import { NextResponse } from "next/server";
import { getVocabularies } from "@/app/lib/vocabulary";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const messages = await getVocabularies(userId);
    return NextResponse.json(messages);
  });
}
