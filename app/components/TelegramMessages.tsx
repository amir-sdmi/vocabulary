"use client";

import { useEffect, useState } from "react";

type Message = { id: string; text: string; at: number };

export function TelegramMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = () => {
      fetch("/api/messages")
        .then((res) => res.ok ? res.json() : [])
        .then(setMessages)
        .catch(() => setMessages([]));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  if (messages.length === 0) {
    return (
      <p className="text-amber-700/70 dark:text-amber-300/70 text-sm mt-2">
        No messages yet. Send something to your Telegram bot to see it here.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className="rounded-lg border border-amber-200/80 dark:border-amber-800/60 bg-white/80 dark:bg-stone-900/80 px-4 py-3 text-amber-900 dark:text-amber-100"
        >
          <p className="whitespace-pre-wrap">{msg.text}</p>
          <time className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
            {new Date(msg.at).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
