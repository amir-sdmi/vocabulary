export const LEARNING_STATUS = ["new", "learning", "known", "trouble"] as const;

export type LearningStatus = (typeof LEARNING_STATUS)[number];

export type VocabSource = "telegram" | "web";

export type VocabEntry = {
  id: string;
  term: string;
  lemma: string;
  pos: string;
  definitionEasyEn: string;
  meaningFa: string;
  userExample: string;
  aiExamples: string[];
  collocations: string[];
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
  mode: "daily" | "trouble" | "quick" | "tag";
  taskType: "fill_gap" | "rewrite" | "free_sentence";
  prompt: string;
  answer: string;
  score: number;
  pass: boolean;
  feedback: string;
  fixedAnswer: string;
  errors: ReviewErrorType[];
};

export type ReviewTask = {
  type: "fill_gap" | "rewrite" | "free_sentence";
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
};

export type EditDraft = {
  term: string;
  pos: string;
  definitionEasyEn: string;
  meaningFa: string;
  userExample: string;
  status: LearningStatus;
  tags: string;
  collocations: string;
  aiExamples: string;
};

export type VocabStats = {
  total: number;
  new: number;
  learning: number;
  known: number;
  trouble: number;
};
