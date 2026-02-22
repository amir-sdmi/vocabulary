import { get, put } from "@vercel/blob";

export type StoredMessage = {
  id: string;
  text: string;
  at: number;
};

const BLOB_PATHNAME = "vocabulary";

async function readFromBlob(): Promise<StoredMessage[]> {
  try {
    const result = await get(BLOB_PATHNAME, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const raw = await new Response(result.stream).text();
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as StoredMessage[]) : [];
  } catch {
    return [];
  }
}

export async function addMessage(text: string): Promise<StoredMessage> {
  const msg: StoredMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    at: Date.now(),
  };
  const list = await readFromBlob();
  const updated = [...list, msg];
  const body = JSON.stringify(updated);
  await put(BLOB_PATHNAME, body, {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
  return msg;
}

export async function getMessages(): Promise<StoredMessage[]> {
  const list = await readFromBlob();
  return [...list].reverse();
}
