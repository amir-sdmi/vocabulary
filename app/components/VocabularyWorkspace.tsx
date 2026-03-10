"use client";

import { AddVocabularyForm } from "@/app/components/vocabulary/AddVocabularyForm";
import { AnalyticsPanel } from "@/app/components/vocabulary/AnalyticsPanel";
import { CoachPanel } from "@/app/components/vocabulary/CoachPanel";
import { InsightsPanel } from "@/app/components/vocabulary/InsightsPanel";
import { MemoryGraphPanel } from "@/app/components/vocabulary/MemoryGraphPanel";
import { MissionsPanel } from "@/app/components/vocabulary/MissionsPanel";
import { NotificationsPanel } from "@/app/components/vocabulary/NotificationsPanel";
import { PronunciationPanel } from "@/app/components/vocabulary/PronunciationPanel";
import { SentenceLabPanel } from "@/app/components/vocabulary/SentenceLabPanel";
import { StudyPlanPanel } from "@/app/components/vocabulary/StudyPlanPanel";
import { VocabularyItemCard } from "@/app/components/vocabulary/VocabularyItemCard";
import { VocabularyStats } from "@/app/components/vocabulary/VocabularyStats";
import { VocabularyToolbar } from "@/app/components/vocabulary/VocabularyToolbar";
import { useVocabularyWorkspace } from "@/app/components/vocabulary/useVocabularyWorkspace";
import { TelegramMessages } from "@/app/components/TelegramMessages";

export function VocabularyWorkspace() {
  const vm = useVocabularyWorkspace();

  return (
    <div className="space-y-6">
      <CoachPanel />
      <InsightsPanel />
      <MemoryGraphPanel />
      <StudyPlanPanel />
      <NotificationsPanel />
      <MissionsPanel />
      <SentenceLabPanel />
      <PronunciationPanel />
      <AnalyticsPanel />

      <AddVocabularyForm
        term={vm.term}
        meaning={vm.meaningInput}
        sentence={vm.sentence}
        newTags={vm.newTags}
        creating={vm.creating}
        onTermChange={vm.setTerm}
        onMeaningChange={vm.setMeaningInput}
        onSentenceChange={vm.setSentence}
        onNewTagsChange={vm.setNewTags}
        onSubmit={vm.onCreate}
      />

      <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
        <VocabularyToolbar
          q={vm.q}
          status={vm.status}
          tag={vm.tag}
          meaning={vm.meaning}
          mistakeType={vm.mistakeType}
          entryType={vm.entryType}
          collocation={vm.collocation}
          due={vm.due}
          sort={vm.sort}
          total={vm.items.length}
          error={vm.error}
          savedFilterId={vm.savedFilterId}
          savedFilters={vm.savedFilters}
          newFilterName={vm.newFilterName}
          onQChange={vm.setQ}
          onStatusChange={vm.setStatus}
          onTagChange={vm.setTag}
          onMeaningChange={vm.setMeaning}
          onMistakeTypeChange={vm.setMistakeType}
          onEntryTypeChange={vm.setEntryType}
          onCollocationChange={vm.setCollocation}
          onDueChange={vm.setDue}
          onSortChange={vm.setSort}
          onSavedFilterIdChange={vm.applyFilter}
          onNewFilterNameChange={vm.setNewFilterName}
          onSaveFilter={vm.saveCurrentFilter}
          onDeleteFilter={vm.removeFilter}
          onClearFilters={vm.clearFilters}
        />
        <VocabularyStats stats={vm.stats} />
      </section>

      <section className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-emerald-950">Import (CSV / Anki / Google Sheets CSV)</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={vm.importSource}
            onChange={(event) => vm.setImportSource(event.target.value as "csv" | "anki" | "google_sheets")}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="anki">Anki CSV</option>
            <option value="google_sheets">Google Sheets CSV</option>
          </select>
          <button
            type="button"
            onClick={() => void vm.previewImportContent()}
            disabled={vm.importing}
            className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm font-medium text-emerald-900"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => void vm.executeImportContent()}
            disabled={vm.importing}
            className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
          >
            Execute Import
          </button>
        </div>
        <textarea
          value={vm.importContent}
          onChange={(event) => vm.setImportContent(event.target.value)}
          placeholder="Paste CSV content here (for Google Sheets use File -> Download -> CSV)"
          className="mt-3 min-h-36 w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-xs"
        />
        {vm.importPreview ? (
          <div className="mt-3 rounded-lg border border-emerald-900/10 bg-emerald-50/40 p-3 text-xs text-emerald-900">
            <p>
              Rows total: {vm.importPreview.rowsTotal} | valid: {vm.importPreview.rowsValid} | create:{" "}
              {vm.importPreview.rowsCreated} | update: {vm.importPreview.rowsUpdated} | skip:{" "}
              {vm.importPreview.rowsSkipped}
            </p>
          </div>
        ) : null}
      </section>

      <TelegramMessages />

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
