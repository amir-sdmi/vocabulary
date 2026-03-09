import { Session } from "next-auth";

export function getUserIdFromSession(session: Session | null): string | null {
  const email = session?.user?.email?.trim().toLowerCase();
  if (email) return `web:${email}`;
  return null;
}

export function getTelegramUserId(update: {
  message?: { from?: { id?: number | string } };
}): string | null {
  const id = update?.message?.from?.id;
  if (id === undefined || id === null) return null;
  return `telegram:${String(id)}`;
}
