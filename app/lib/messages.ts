export type StoredMessage = {
  id: string;
  text: string;
  at: number;
};

const messages: StoredMessage[] = [];

export function addMessage(text: string): StoredMessage {
  const msg: StoredMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    at: Date.now(),
  };
  messages.push(msg);
  return msg;
}

export function getMessages(): StoredMessage[] {
  return [...messages].reverse();
}
