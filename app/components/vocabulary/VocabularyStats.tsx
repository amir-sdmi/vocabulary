import { VocabStats } from "@/app/features/vocabulary/types";

export function VocabularyStats({ stats }: { stats: VocabStats }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
      <StatChip label="Total" value={stats.total} />
      <StatChip label="New" value={stats.new} />
      <StatChip label="Learning" value={stats.learning} />
      <StatChip label="Known" value={stats.known} />
      <StatChip label="Trouble" value={stats.trouble} />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-emerald-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-emerald-900/70">{label}</p>
      <p className="text-lg font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
