import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function ensureApp() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is unset");
    const credentials = JSON.parse(raw);
    initializeApp({ credential: cert(credentials) });
  }
}

export async function saveVocabularyEntry(parts: string[]): Promise<void> {
  ensureApp();
  const word = parts[0] ?? "";
  const definition = parts.slice(1).join(" ").trim() || undefined;
  const db = getFirestore();
  // Collection "vocabulary" is created automatically on first .add()
  await db.collection("vocabulary").add({
    word,
    ...(definition !== undefined && { definition }),
    createdAt: FieldValue.serverTimestamp(),
  });
}
