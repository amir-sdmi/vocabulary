import { get, put } from "@vercel/blob";
import {
  getVocabulariesForExactUser,
  saveVocabulariesForExactUser,
} from "@/app/lib/vocabulary";
import { VocabEntry } from "@/app/features/vocabulary/types";

const LINKS_BLOB_PATH = "vocabulary-links-v1";

type LinkState = {
  pendingCodes: Record<string, { webUserId: string; expiresAt: number }>;
  telegramToWeb: Record<string, string>;
};

const EMPTY_LINK_STATE: LinkState = {
  pendingCodes: {},
  telegramToWeb: {},
};

async function readLinkState(): Promise<LinkState> {
  try {
    const result = await get(LINKS_BLOB_PATH, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return EMPTY_LINK_STATE;
    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as Partial<LinkState>;
    return {
      pendingCodes: parsed.pendingCodes ?? {},
      telegramToWeb: parsed.telegramToWeb ?? {},
    };
  } catch {
    return EMPTY_LINK_STATE;
  }
}

async function saveLinkState(state: LinkState): Promise<void> {
  await put(LINKS_BLOB_PATH, JSON.stringify(state), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createLinkCode(webUserId: string): Promise<{ code: string; expiresAt: number }> {
  const state = await readLinkState();
  const code = generateCode();
  const expiresAt = Date.now() + 1000 * 60 * 20;
  state.pendingCodes[code] = { webUserId, expiresAt };
  await saveLinkState(state);
  return { code, expiresAt };
}

function mergeVocabLists(target: VocabEntry[], incoming: VocabEntry[]): VocabEntry[] {
  const existing = new Set(target.map((item) => `${item.lemma}:${item.userExample}`));
  const merged = [...target];
  for (const item of incoming) {
    const key = `${item.lemma}:${item.userExample}`;
    if (existing.has(key)) continue;
    merged.push({
      ...item,
      id: `merged-${item.id}-${Math.random().toString(36).slice(2, 6)}`,
      updatedAt: Date.now(),
    });
  }
  return merged.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function resolveTelegramOwnerUserId(telegramUserId: string): Promise<string> {
  const state = await readLinkState();
  return state.telegramToWeb[telegramUserId] ?? telegramUserId;
}

export async function consumeLinkCode(
  telegramUserId: string,
  code: string,
): Promise<{ ok: boolean; message: string; webUserId?: string }> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { ok: false, message: "Missing link code." };
  }

  const state = await readLinkState();
  const pending = state.pendingCodes[normalizedCode];
  if (!pending) {
    return { ok: false, message: "Invalid or expired link code." };
  }
  if (pending.expiresAt < Date.now()) {
    delete state.pendingCodes[normalizedCode];
    await saveLinkState(state);
    return { ok: false, message: "Link code expired. Generate a new one in the web app." };
  }

  const webUserId = pending.webUserId;
  state.telegramToWeb[telegramUserId] = webUserId;
  delete state.pendingCodes[normalizedCode];
  await saveLinkState(state);

  const telegramVocab = await getVocabulariesForExactUser(telegramUserId);
  if (telegramVocab.length > 0) {
    const webVocab = await getVocabulariesForExactUser(webUserId);
    const merged = mergeVocabLists(webVocab, telegramVocab);
    await saveVocabulariesForExactUser(webUserId, merged);
    await saveVocabulariesForExactUser(telegramUserId, []);
  }

  return {
    ok: true,
    message: "Telegram account linked successfully.",
    webUserId,
  };
}
