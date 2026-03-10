import { get, put } from "@vercel/blob";

function normalizeUserId(userId: string): string {
  return userId.trim().toLowerCase().replaceAll(/[^a-z0-9._-]/g, "_");
}

export function buildUserPath(prefix: string, userId: string, filename = "data.json"): string {
  return `${prefix}/${normalizeUserId(userId)}/${filename}`;
}

export async function readJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return fallback;
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}
