export function parseVocabularyMessage(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s*[|,]\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 0) return parts;
  return [trimmed];
}
