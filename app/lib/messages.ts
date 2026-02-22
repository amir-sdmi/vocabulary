import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export type StoredMessage = {
  id: string;
  text: string;
  at: number;
};

const FILE_PATH = join(process.cwd(), "data", "messages.json");
const memory: StoredMessage[] = [];

async function readFileSafe(): Promise<StoredMessage[]> {
  try {
    const raw = await readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as StoredMessage[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeFileSafe(messages: StoredMessage[]): Promise<boolean> {
  try {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
    await writeFile(FILE_PATH, JSON.stringify(messages, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

export async function addMessage(text: string): Promise<StoredMessage> {
  const msg: StoredMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    at: Date.now(),
  };
  memory.push(msg);
  const fromFile = await readFileSafe();
  const combined = [...fromFile, ...memory];
  const written = await writeFileSafe(combined);
  if (!written) {
    return msg;
  }
  memory.length = 0;
  return msg;
}

export async function getMessages(): Promise<StoredMessage[]> {
  const fromFile = await readFileSafe();
  const all = [...fromFile, ...memory];
  return [...all].reverse();
}
