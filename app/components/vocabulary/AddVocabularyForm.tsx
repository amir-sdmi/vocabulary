"use client";

import { FormEvent } from "react";

type Props = {
  term: string;
  sentence: string;
  newTags: string;
  creating: boolean;
  onTermChange: (value: string) => void;
  onSentenceChange: (value: string) => void;
  onNewTagsChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function AddVocabularyForm(props: Props) {
  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-emerald-950">Add vocabulary</h2>
      <form onSubmit={props.onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={props.term}
          onChange={(event) => props.onTermChange(event.target.value)}
          placeholder="Term or phrase"
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
          required
        />
        <input
          value={props.newTags}
          onChange={(event) => props.onNewTagsChange(event.target.value)}
          placeholder="Tags (work, travel, daily)"
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
        <textarea
          value={props.sentence}
          onChange={(event) => props.onSentenceChange(event.target.value)}
          placeholder="Context sentence"
          className="min-h-20 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring sm:col-span-2"
        />
        <div className="flex items-center justify-between sm:col-span-2">
          <div className="text-xs text-emerald-900/70">
            Tip: Telegram format also works: <code>add: term | sentence</code>
          </div>
          <button
            type="submit"
            disabled={props.creating}
            className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {props.creating ? "Saving..." : "Save word"}
          </button>
        </div>
      </form>
    </section>
  );
}
