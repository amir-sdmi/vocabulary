import { NextResponse } from "next/server";
import { getMessages } from "@/app/lib/messages";

export async function GET() {
  const messages = getMessages();
  return NextResponse.json(messages);
}
