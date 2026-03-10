import { NextResponse } from "next/server";
import { withAuthorizedUser } from "@/app/lib/server/api-auth";
import { buildMemoryGraph } from "@/app/lib/memory-graph";

export async function GET() {
  return withAuthorizedUser(async (userId) => {
    const graph = await buildMemoryGraph(userId);
    return NextResponse.json(graph);
  });
}
