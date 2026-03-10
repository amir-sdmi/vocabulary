"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { buildEditDraft, buildVocabStats } from "@/app/features/vocabulary/helpers";
import {
  EditDraft,
  ImportJob,
  SavedFilter,
  SortMode,
  VocabEntry,
} from "@/app/features/vocabulary/types";

export function useVocabularyWorkspace() {
  const [items, setItems] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [meaning, setMeaning] = useState("");
  const [mistakeType, setMistakeType] = useState("");
  const [entryType, setEntryType] = useState("");
  const [collocation, setCollocation] = useState("");
  const [due, setDue] = useState("");
  const [sort, setSort] = useState<SortMode>("updated_desc");
  const [savedFilterId, setSavedFilterId] = useState("");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [newFilterName, setNewFilterName] = useState("");

  const [term, setTerm] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [newTags, setNewTags] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [importSource, setImportSource] = useState<"csv" | "anki" | "google_sheets">("csv");
  const [importContent, setImportContent] = useState("");
  const [importPreview, setImportPreview] = useState<ImportJob | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchSavedFilters = useCallback(async () => {
    const response = await fetch("/api/filters");
    if (!response.ok) return;
    const data = (await response.json()) as SavedFilter[];
    setSavedFilters(data);
  }, []);

  const fetchVocab = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (tag.trim()) params.set("tag", tag.trim().toLowerCase());
    if (meaning.trim()) params.set("meaning", meaning.trim());
    if (mistakeType) params.set("mistakeType", mistakeType);
    if (entryType) params.set("entryType", entryType);
    if (collocation.trim()) params.set("collocation", collocation.trim());
    if (due) params.set("due", due);
    if (savedFilterId) params.set("savedFilterId", savedFilterId);
    try {
      const response = await fetch(`/api/vocab?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load vocabularies");
      const data = (await response.json()) as VocabEntry[];
      setItems(sortItems(data, sort));
    } catch {
      setError("Could not load vocabularies.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [q, status, tag, meaning, mistakeType, entryType, collocation, due, savedFilterId, sort]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchVocab();
      void fetchSavedFilters();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchSavedFilters, fetchVocab]);

  const stats = useMemo(() => buildVocabStats(items), [items]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: term.trim(),
          meaning: meaningInput.trim(),
          sentence: sentence.trim(),
          tags: newTags.trim(),
        }),
      });
      if (!response.ok) throw new Error("Create failed");
      setTerm("");
      setMeaningInput("");
      setSentence("");
      setNewTags("");
      await fetchVocab();
    } catch {
      setError("Failed to create vocabulary.");
    } finally {
      setCreating(false);
    }
  }

  async function saveCurrentFilter() {
    if (!newFilterName.trim()) return;
    const response = await fetch("/api/filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newFilterName.trim(),
        sort,
        filters: { q, status, tag, meaning, mistakeType, entryType, collocation, due },
      }),
    });
    if (!response.ok) {
      setError("Failed to save filter.");
      return;
    }
    setNewFilterName("");
    await fetchSavedFilters();
  }

  async function removeFilter(id: string) {
    const response = await fetch(`/api/filters?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete filter.");
      return;
    }
    if (savedFilterId === id) setSavedFilterId("");
    await fetchSavedFilters();
    await fetchVocab();
  }

  function applyFilter(id: string) {
    setSavedFilterId(id);
  }

  function startEdit(item: VocabEntry) {
    setEditingId(item.id);
    setDraft(buildEditDraft(item));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function onSave(id: string) {
    if (!draft) return;
    setSavingId(id);
    setError("");
    try {
      const response = await fetch(`/api/vocab/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: draft.term,
          entryType: draft.entryType,
          pos: draft.pos,
          definitionEasyEn: draft.definitionEasyEn,
          meaningFa: draft.meaningFa,
          userExample: draft.userExample,
          status: draft.status,
          tags: draft.tags,
          collocations: draft.collocations,
          synonyms: draft.synonyms,
          antonyms: draft.antonyms,
          wordFamily: {
            noun: draft.wordFamilyNoun,
            verb: draft.wordFamilyVerb,
            adjective: draft.wordFamilyAdjective,
            adverb: draft.wordFamilyAdverb,
          },
          aiExamples: draft.aiExamples
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      cancelEdit();
      await fetchVocab();
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(id: string) {
    const shouldDelete = window.confirm("Delete this vocabulary card?");
    if (!shouldDelete) return;

    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`/api/vocab/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      if (editingId === id) cancelEdit();
      await fetchVocab();
    } catch {
      setError("Failed to delete vocabulary.");
    } finally {
      setDeletingId(null);
    }
  }

  async function previewImportContent() {
    if (!importContent.trim()) return;
    setImporting(true);
    try {
      const response = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          source: importSource,
          content: importContent,
        }),
      });
      if (!response.ok) throw new Error("Import preview failed");
      const data = (await response.json()) as ImportJob;
      setImportPreview(data);
    } catch {
      setError("Failed to preview import.");
    } finally {
      setImporting(false);
    }
  }

  async function executeImportContent() {
    if (!importContent.trim()) return;
    setImporting(true);
    try {
      const response = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          source: importSource,
          content: importContent,
        }),
      });
      if (!response.ok) throw new Error("Import execute failed");
      const data = (await response.json()) as ImportJob;
      setImportPreview(data);
      await fetchVocab();
    } catch {
      setError("Failed to execute import.");
    } finally {
      setImporting(false);
    }
  }

  return {
    items,
    loading,
    error,
    q,
    status,
    tag,
    meaning,
    mistakeType,
    entryType,
    collocation,
    due,
    sort,
    savedFilterId,
    savedFilters,
    newFilterName,
    term,
    meaningInput,
    sentence,
    newTags,
    creating,
    editingId,
    draft,
    savingId,
    deletingId,
    stats,
    importSource,
    importContent,
    importPreview,
    importing,
    setQ,
    setStatus,
    setTag,
    setMeaning,
    setMistakeType,
    setEntryType,
    setCollocation,
    setDue,
    setSort,
    setSavedFilterId,
    setNewFilterName,
    setTerm,
    setMeaningInput,
    setSentence,
    setNewTags,
    setDraft,
    setImportSource,
    setImportContent,
    onCreate,
    startEdit,
    cancelEdit,
    onSave,
    onDelete,
    saveCurrentFilter,
    removeFilter,
    applyFilter,
    previewImportContent,
    executeImportContent,
    clearFilters: () => {
      setQ("");
      setStatus("");
      setTag("");
      setMeaning("");
      setMistakeType("");
      setEntryType("");
      setCollocation("");
      setDue("");
      setSavedFilterId("");
      setSort("updated_desc");
    },
  };
}

function sortItems(items: VocabEntry[], mode: SortMode): VocabEntry[] {
  const copy = [...items];
  switch (mode) {
    case "updated_asc":
      return copy.sort((a, b) => a.updatedAt - b.updatedAt);
    case "term_asc":
      return copy.sort((a, b) => a.term.localeCompare(b.term));
    case "term_desc":
      return copy.sort((a, b) => b.term.localeCompare(a.term));
    case "updated_desc":
    default:
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
