import { NextResponse } from "next/server";
import { getMessages } from "@/app/lib/messages";

export async function GET() {
  const messages = await getMessages();
  return NextResponse.json(messages);
}
