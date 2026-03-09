"use client";

import { formatDate } from "@/app/features/vocabulary/helpers";
import { EditDraft, LEARNING_STATUS, LearningStatus, VocabEntry } from "@/app/features/vocabulary/types";

type Props = {
  item: VocabEntry;
  isEditing: boolean;
  draft: EditDraft | null;
  deleting: boolean;
  saving: boolean;
  onStartEdit: (item: VocabEntry) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onSave: (id: string) => Promise<void>;
  setDraft: (updater: (current: EditDraft | null) => EditDraft | null) => void;
};

export function VocabularyItemCard(props: Props) {
  const { item, isEditing, draft } = props;
  const statusStyles: Record<LearningStatus, string> = {
    new: "bg-sky-100 text-sky-800",
    learning: "bg-amber-100 text-amber-800",
    known: "bg-emerald-100 text-emerald-800",
    trouble: "bg-rose-100 text-rose-800",
  };

  return (
    <article className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm transition hover:shadow-md sm:p-5">
      {!isEditing || !draft ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950">{item.term}</h3>
              <p className="text-sm text-emerald-900/75">
                {item.pos} • updated {formatDate(item.updatedAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
              <button
                onClick={() => props.onStartEdit(item)}
                className="rounded-lg border border-emerald-900/20 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900 hover:bg-emerald-100"
              >
                Edit
              </button>
              <button
                onClick={() => void props.onDelete(item.id)}
                disabled={props.deleting}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {props.deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-emerald-900/90 sm:grid-cols-2">
            <p>
              <span className="font-medium">EN:</span> {item.definitionEasyEn || "No definition yet"}
            </p>
            <p>
              <span className="font-medium">FA:</span> {item.meaningFa || "—"}
            </p>
          </div>
          {item.userExample ? (
            <p className="mt-2 text-sm text-emerald-900/90">
              <span className="font-medium">Example:</span> {item.userExample}
            </p>
          ) : null}
          {item.tags.length > 0 ? (
            <p className="mt-2 text-xs text-emerald-800/80">#{item.tags.join(" #")}</p>
          ) : null}
        </>
      ) : (
        <div className="grid gap-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={draft.term}
              onChange={(event) => props.setDraft((current) => (current ? { ...current, term: event.target.value } : current))}
              className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
            />
            <input
              value={draft.pos}
              onChange={(event) => props.setDraft((current) => (current ? { ...current, pos: event.target.value } : current))}
              className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
            />
            <select
              value={draft.status}
              onChange={(event) =>
                props.setDraft((current) =>
                  current ? { ...current, status: event.target.value as LearningStatus } : current,
                )
              }
              className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
            >
              {LEARNING_STATUS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={draft.definitionEasyEn}
            onChange={(event) =>
              props.setDraft((current) => (current ? { ...current, definitionEasyEn: event.target.value } : current))
            }
            placeholder="Simple English definition"
            className="min-h-16 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={draft.meaningFa}
            onChange={(event) => props.setDraft((current) => (current ? { ...current, meaningFa: event.target.value } : current))}
            placeholder="Persian meaning"
            className="min-h-16 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={draft.userExample}
            onChange={(event) =>
              props.setDraft((current) => (current ? { ...current, userExample: event.target.value } : current))
            }
            placeholder="User example"
            className="min-h-16 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          />
          <input
            value={draft.tags}
            onChange={(event) => props.setDraft((current) => (current ? { ...current, tags: event.target.value } : current))}
            placeholder="tags, comma, separated"
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          />
          <input
            value={draft.collocations}
            onChange={(event) =>
              props.setDraft((current) => (current ? { ...current, collocations: event.target.value } : current))
            }
            placeholder="collocations, comma, separated"
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={draft.aiExamples}
            onChange={(event) =>
              props.setDraft((current) => (current ? { ...current, aiExamples: event.target.value } : current))
            }
            placeholder="AI examples (one line each)"
            className="min-h-20 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={() => void props.onSave(item.id)}
              disabled={props.saving}
              className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {props.saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={props.onCancelEdit}
              className="rounded-lg border border-emerald-900/20 bg-white px-4 py-2 text-sm text-emerald-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
