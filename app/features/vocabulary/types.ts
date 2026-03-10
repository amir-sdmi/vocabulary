export const LEARNING_STATUS = ["new", "learning", "known", "trouble"] as const;
export const ENTRY_TYPE = ["word", "phrase"] as const;

export type LearningStatus = (typeof LEARNING_STATUS)[number];
export type EntryType = (typeof ENTRY_TYPE)[number];

export type VocabSource = "telegram" | "web";
export type ReviewMode =
  | "daily"
  | "trouble"
  | "quick"
  | "tag"
  | "recall"
  | "writing"
  | "collocation"
  | "error_correction"
  | "active_usage"
  | "weak_area"
  | "use_today";

export type ReviewTaskType =
  | "fill_gap"
  | "rewrite"
  | "free_sentence"
  | "recall"
  | "collocation"
  | "error_correction"
  | "active_usage";

export type WordFamily = {
  noun?: string;
  verb?: string;
  adjective?: string;
  adverb?: string;
};

export type VocabEntry = {
  id: string;
  term: string;
  lemma: string;
  entryType: EntryType;
  pos: string;
  definitionEasyEn: string;
  meaningFa: string;
  userExample: string;
  aiExamples: string[];
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  wordFamily: WordFamily;
  tags: string[];
  status: LearningStatus;
  source: VocabSource;
  createdAt: number;
  updatedAt: number;
  dueAt: number;
  ease: number;
  intervalDays: number;
  lapses: number;
  streak: number;
  lastScore: number | null;
  lastReviewedAt: number | null;
  useCount: number;
  difficultyScore: number | null;
  lastUsedAt: number | null;
  errorBuckets: Record<ReviewErrorType, number>;
};

export type ReviewErrorType =
  | "grammar"
  | "word_choice"
  | "collocation"
  | "meaning_mismatch"
  | "fluency";

export type PracticeAttempt = {
  id: string;
  userId: string;
  vocabId: string;
  createdAt: number;
  mode: ReviewMode;
  taskType: ReviewTaskType;
  prompt: string;
  answer: string;
  score: number;
  pass: boolean;
  feedback: string;
  fixedAnswer: string;
  errors: ReviewErrorType[];
};

export type ReviewTask = {
  type: ReviewTaskType;
  prompt: string;
};

export type ReviewQueueItem = {
  vocab: VocabEntry;
  tasks: ReviewTask[];
};

export type VocabularyFilters = {
  q?: string;
  status?: string;
  tag?: string;
  meaning?: string;
  mistakeType?: ReviewErrorType | "";
  entryType?: EntryType | "";
  collocation?: string;
  due?: "all" | "due" | "overdue" | "";
};

export type EditDraft = {
  term: string;
  entryType: EntryType;
  pos: string;
  definitionEasyEn: string;
  meaningFa: string;
  userExample: string;
  status: LearningStatus;
  tags: string;
  collocations: string;
  synonyms: string;
  antonyms: string;
  wordFamilyNoun: string;
  wordFamilyVerb: string;
  wordFamilyAdjective: string;
  wordFamilyAdverb: string;
  aiExamples: string;
};

export type VocabStats = {
  total: number;
  new: number;
  learning: number;
  known: number;
  trouble: number;
};

export type SortMode = "updated_desc" | "updated_asc" | "term_asc" | "term_desc";

export type SavedFilter = {
  id: string;
  userId: string;
  name: string;
  filters: VocabularyFilters;
  sort: SortMode;
  createdAt: number;
  updatedAt: number;
};

export type DailyGoal = {
  id: string;
  userId: string;
  targetCorrectProduction: number;
  createdAt: number;
  updatedAt: number;
};

export type DailyGoalProgress = {
  id: string;
  userId: string;
  date: string;
  correctProductionCount: number;
  target: number;
  met: boolean;
};

export type GoalSnapshot = {
  today: DailyGoalProgress;
  streak: number;
  lastMetDate: string | null;
};

export type WeeklyReportSnapshot = {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: number;
  totalWords: number;
  retainedWords: number;
  forgottenWords: number;
  usableWords: number;
  reviews7d: number;
  avgScore7d: number;
  topErrors: Array<{ type: ReviewErrorType; count: number }>;
  weakWords: Array<{ id: string; term: string; lapses: number; lastScore: number | null }>;
  recommendation: string;
};

export type ImportSource = "csv" | "anki" | "google_sheets";
export type ImportStatus = "previewed" | "completed" | "failed";
export type ImportDedupeAction = "create" | "update" | "skip";

export type ImportPreviewRow = {
  row: number;
  raw: Record<string, string>;
  parsed: Partial<VocabEntry>;
  errors: string[];
  dedupeAction: ImportDedupeAction;
  duplicateOf?: string;
};

export type ImportJob = {
  id: string;
  userId: string;
  source: ImportSource;
  status: ImportStatus;
  createdAt: number;
  updatedAt: number;
  fieldMapping: Record<string, string>;
  rowsTotal: number;
  rowsValid: number;
  rowsCreated: number;
  rowsUpdated: number;
  rowsSkipped: number;
  errors: Array<{ row: number; message: string }>;
  previewRows: ImportPreviewRow[];
};
