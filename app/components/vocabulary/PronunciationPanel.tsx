"use client";

import { useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};

export function PronunciationPanel() {
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);

  function speak() {
    if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = rate;
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (typeof window === "undefined") return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const first = event.results?.[0]?.[0]?.transcript ?? "";
      setHeard(first);
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    setListening(true);
    recognition.start();
  }

  const similarity =
    text.trim() && heard.trim()
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (heard
                .trim()
                .toLowerCase()
                .split(/\s+/)
                .filter((w) => text.toLowerCase().includes(w)).length /
                Math.max(1, text.trim().split(/\s+/).length)) *
                100,
            ),
          ),
        )
      : 0;

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-emerald-950">Shadowing + Pronunciation</h3>
      <p className="mt-1 text-xs text-emerald-900/75">
        Listen, repeat, and compare your spoken output against target phrase text.
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder='Example: "I took over the project and delivered ahead of schedule."'
        className="mt-3 min-h-20 w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="text-xs text-emerald-900/80">
          Speed: {rate.toFixed(1)}x
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.1}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="ml-2 align-middle"
          />
        </label>
        <button
          type="button"
          onClick={speak}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm text-emerald-900"
        >
          Play TTS
        </button>
        <button
          type="button"
          onClick={startListening}
          className="rounded-lg bg-emerald-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          {listening ? "Listening..." : "Record repeat"}
        </button>
      </div>
      {heard ? (
        <div className="mt-3 rounded-lg border border-emerald-900/10 bg-emerald-50/40 p-3 text-sm text-emerald-900">
          <p>
            <strong>You said:</strong> {heard}
          </p>
          <p className="mt-1">
            <strong>Match:</strong> {similarity}%
          </p>
        </div>
      ) : null}
    </section>
  );
}
