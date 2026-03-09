"use client";

import { LEARNING_STATUS } from "@/app/features/vocabulary/types";

type SortOption = "updated_desc" | "updated_asc" | "term_asc" | "term_desc";

type Props = {
  q: string;
  status: string;
  tag: string;
  sort: SortOption;
  total: number;
  error: string;
  onQChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onClearFilters: () => void;
};

export function VocabularyToolbar(props: Props) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={props.q}
          onChange={(event) => props.onQChange(event.target.value)}
          placeholder="Search term, definition, tags..."
          className="min-w-60 flex-1 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
        <select
          value={props.status}
          onChange={(event) => props.onStatusChange(event.target.value)}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {LEARNING_STATUS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          value={props.tag}
          onChange={(event) => props.onTagChange(event.target.value)}
          placeholder="Tag"
          className="w-36 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
        <select
          value={props.sort}
          onChange={(event) => props.onSortChange(event.target.value as SortOption)}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="updated_desc">Newest first</option>
          <option value="updated_asc">Oldest first</option>
          <option value="term_asc">A → Z</option>
          <option value="term_desc">Z → A</option>
        </select>
        <button
          onClick={props.onClearFilters}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          Reset
        </button>
        <a
          href="/api/vocab/export?format=csv"
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Export CSV
        </a>
        <a
          href="/api/vocab/export?format=json"
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Export JSON
        </a>
        <a
          href="/api/vocab/export?format=anki"
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Export Anki
        </a>
        <a
          href="/api/vocab/export?format=weekly"
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Weekly Report
        </a>
      </div>

      <p className="mt-2 text-xs text-emerald-900/70">{props.total} words found</p>
      {props.error ? <p className="mt-3 text-sm text-red-700">{props.error}</p> : null}
    </div>
  );
}
