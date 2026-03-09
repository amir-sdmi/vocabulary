"use client";

import { AddVocabularyForm } from "@/app/components/vocabulary/AddVocabularyForm";
import { CoachPanel } from "@/app/components/vocabulary/CoachPanel";
import { InsightsPanel } from "@/app/components/vocabulary/InsightsPanel";
import { VocabularyItemCard } from "@/app/components/vocabulary/VocabularyItemCard";
import { VocabularyStats } from "@/app/components/vocabulary/VocabularyStats";
import { VocabularyToolbar } from "@/app/components/vocabulary/VocabularyToolbar";
import { useVocabularyWorkspace } from "@/app/components/vocabulary/useVocabularyWorkspace";

export function VocabularyWorkspace() {
  const vm = useVocabularyWorkspace();

  return (
    <div className="space-y-6">
      <CoachPanel />
      <InsightsPanel />

      <AddVocabularyForm
        term={vm.term}
        sentence={vm.sentence}
        newTags={vm.newTags}
        creating={vm.creating}
        onTermChange={vm.setTerm}
        onSentenceChange={vm.setSentence}
        onNewTagsChange={vm.setNewTags}
        onSubmit={vm.onCreate}
      />

      <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
        <VocabularyToolbar
          q={vm.q}
          status={vm.status}
          tag={vm.tag}
          sort={vm.sort}
          total={vm.items.length}
          error={vm.error}
          onQChange={vm.setQ}
          onStatusChange={vm.setStatus}
          onTagChange={vm.setTag}
          onSortChange={vm.setSort}
          onClearFilters={vm.clearFilters}
        />
        <VocabularyStats stats={vm.stats} />
      </section>

      <section className="space-y-3">
        {vm.loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
          </>
        ) : null}

        {!vm.loading && vm.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-900/20 bg-white/80 p-8 text-center">
            <p className="text-base font-medium text-emerald-900">No vocabularies found</p>
            <p className="mt-1 text-sm text-emerald-900/70">
              Try different filters or add your first word above.
            </p>
          </div>
        ) : null}

        {!vm.loading &&
          vm.items.map((item) => (
            <VocabularyItemCard
              key={item.id}
              item={item}
              isEditing={vm.editingId === item.id}
              draft={vm.editingId === item.id ? vm.draft : null}
              deleting={vm.deletingId === item.id}
              saving={vm.savingId === item.id}
              onStartEdit={vm.startEdit}
              onCancelEdit={vm.cancelEdit}
              onDelete={vm.onDelete}
              onSave={vm.onSave}
              setDraft={vm.setDraft}
            />
          ))}
      </section>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-emerald-900/10 bg-white/90 p-5">
      <div className="h-5 w-40 rounded bg-emerald-100" />
      <div className="mt-2 h-4 w-56 rounded bg-emerald-50" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="h-4 rounded bg-emerald-50" />
        <div className="h-4 rounded bg-emerald-50" />
      </div>
    </div>
  );
}
