"use client";

import { LEARNING_STATUS, SavedFilter, SortMode } from "@/app/features/vocabulary/types";

type Props = {
  q: string;
  status: string;
  tag: string;
  meaning: string;
  mistakeType: string;
  entryType: string;
  collocation: string;
  due: string;
  sort: SortMode;
  total: number;
  error: string;
  savedFilterId: string;
  savedFilters: SavedFilter[];
  newFilterName: string;
  onQChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onMeaningChange: (value: string) => void;
  onMistakeTypeChange: (value: string) => void;
  onEntryTypeChange: (value: string) => void;
  onCollocationChange: (value: string) => void;
  onDueChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onSavedFilterIdChange: (value: string) => void;
  onNewFilterNameChange: (value: string) => void;
  onSaveFilter: () => Promise<void>;
  onDeleteFilter: (id: string) => Promise<void>;
  onClearFilters: () => void;
};

export function VocabularyToolbar(props: Props) {
  function openExport(format: "csv" | "json" | "anki" | "weekly") {
    window.location.assign(`/api/vocab/export?format=${format}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={props.q}
          onChange={(event) => props.onQChange(event.target.value)}
          placeholder="Search term, definition, tags..."
          className="min-w-56 flex-1 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
        <input
          value={props.meaning}
          onChange={(event) => props.onMeaningChange(event.target.value)}
          placeholder="Meaning"
          className="w-40 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
        <input
          value={props.tag}
          onChange={(event) => props.onTagChange(event.target.value)}
          placeholder="Tag"
          className="w-32 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
        <input
          value={props.collocation}
          onChange={(event) => props.onCollocationChange(event.target.value)}
          placeholder="Collocation"
          className="w-36 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <select
          value={props.entryType}
          onChange={(event) => props.onEntryTypeChange(event.target.value)}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">All entry types</option>
          <option value="word">word</option>
          <option value="phrase">phrase</option>
        </select>
        <select
          value={props.mistakeType}
          onChange={(event) => props.onMistakeTypeChange(event.target.value)}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">All mistake types</option>
          <option value="grammar">grammar</option>
          <option value="word_choice">word choice</option>
          <option value="collocation">collocation</option>
          <option value="meaning_mismatch">meaning mismatch</option>
          <option value="fluency">fluency</option>
        </select>
        <select
          value={props.due}
          onChange={(event) => props.onDueChange(event.target.value)}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">All due states</option>
          <option value="due">Due now</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={props.sort}
          onChange={(event) => props.onSortChange(event.target.value as SortMode)}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="updated_desc">Newest first</option>
          <option value="updated_asc">Oldest first</option>
          <option value="term_asc">A to Z</option>
          <option value="term_desc">Z to A</option>
        </select>
        <button
          onClick={props.onClearFilters}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={props.savedFilterId}
          onChange={(event) => props.onSavedFilterIdChange(event.target.value)}
          className="min-w-52 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        >
          <option value="">Saved filters</option>
          {props.savedFilters.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <input
          value={props.newFilterName}
          onChange={(event) => props.onNewFilterNameChange(event.target.value)}
          placeholder="Name current filter"
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void props.onSaveFilter()}
          className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          Save filter
        </button>
        <button
          type="button"
          onClick={() => props.savedFilterId && void props.onDeleteFilter(props.savedFilterId)}
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete selected
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openExport("csv")}
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => openExport("json")}
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => openExport("anki")}
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Export Anki
        </button>
        <button
          type="button"
          onClick={() => openExport("weekly")}
          className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Weekly report
        </button>
      </div>

      <p className="text-xs text-emerald-900/70">{props.total} words found</p>
      {props.error ? <p className="text-sm text-red-700">{props.error}</p> : null}
    </div>
  );
}
