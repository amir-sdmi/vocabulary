import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";

const journeyPhases = [
  {
    title: "Phase 1: Capture Fast",
    text: "Add words from web, Telegram, CSV/Anki/Sheets imports, or short notes. Speed first, cleanup later.",
  },
  {
    title: "Phase 2: Structure",
    text: "Attach meaning, tags, entry type, collocations, synonyms, antonyms, and word family links.",
  },
  {
    title: "Phase 3: Train by Skill",
    text: "Run targeted sessions for recall, writing, collocation, error correction, active usage, and weak areas.",
  },
  {
    title: "Phase 4: Improve Weekly",
    text: "Track daily production goals and review weekly reports to close recurring mistakes.",
  },
] as const;

const featureLessons = [
  {
    title: "1) Smart Intake (Web + Telegram)",
    icon: "/globe.svg",
    purpose: "Capture vocabulary even from incomplete messages.",
    steps: [
      "Send a single word, phrase, or rough sentence in Telegram.",
      "If needed, use structured format: add: term | meaning | tags | example.",
      "Confirm the parsed result and continue; edits can happen later.",
    ],
    outcome: "Entry is stored with normalized term, meaning, tags, and optional example.",
  },
  {
    title: "2) CSV / Anki / Google Sheets Import",
    icon: "/file.svg",
    purpose: "Migrate existing vocabulary quickly.",
    steps: [
      "Open import flow and choose source type.",
      "Run preview to map columns and inspect duplicates.",
      "Execute with dedupe strategy (create, update, or skip).",
    ],
    outcome: "Bulk import completes with row-level summary and error report.",
  },
  {
    title: "3) Advanced Search + Saved Filters",
    icon: "/window.svg",
    purpose: "Find exactly what to study without noise.",
    steps: [
      "Filter by meaning, tag, status, mistake type, entry type, due, or collocation.",
      "Save frequent combinations as named filters.",
      "Reuse filters as one-click study lenses.",
    ],
    outcome: "Daily study starts faster and stays focused on your current goal.",
  },
  {
    title: "4) Lexical Network (Word Family + Relations)",
    icon: "/globe.svg",
    purpose: "Learn words as a system instead of isolated cards.",
    steps: [
      "For each entry, add noun/verb/adjective/adverb variants where possible.",
      "Attach synonyms, antonyms, and high-value collocations.",
      "Use these links during sentence practice and reviews.",
    ],
    outcome: "Faster transfer from recognition to active usage.",
  },
  {
    title: "5) Phrase and Collocation Learning",
    icon: "/file.svg",
    purpose: "Train natural language chunks, not just single words.",
    steps: [
      "Create entries as word or phrase.",
      "Mark key collocations and attach examples.",
      "Practice collocation mode to reinforce natural combinations.",
    ],
    outcome: "More fluent speaking and writing with fewer awkward combinations.",
  },
  {
    title: "6) Skill-Based Review Modes",
    icon: "/window.svg",
    purpose: "Practice the exact ability you need.",
    steps: [
      "Use recall mode for memory retrieval.",
      "Use writing, error-correction, and active-usage for production quality.",
      "Rotate modes through the week to avoid one-dimensional progress.",
    ],
    outcome: "Balanced growth across memory, accuracy, and fluency.",
  },
  {
    title: "7) Weak Area Drills",
    icon: "/globe.svg",
    purpose: "Turn mistakes into targeted sessions.",
    steps: [
      "Let the app bucket your errors (grammar, collocation, spelling, usage).",
      "Start weak-area mode to train the highest-impact bucket first.",
      "Review progress in analytics and repeat until error rate drops.",
    ],
    outcome: "Measurable reduction in repeated mistake patterns.",
  },
  {
    title: "8) Use-It-Today Queue",
    icon: "/window.svg",
    purpose: "Force real-world sentence production from recent terms.",
    steps: [
      "Open use-today mode after adding new words.",
      "Write practical sentences from your context (work, meetings, travel).",
      "Save strong examples back into each card.",
    ],
    outcome: "Words move from passive memory into active daily language.",
  },
  {
    title: "9) Daily Goal + Meaningful Streak",
    icon: "/file.svg",
    purpose: "Build consistency around output, not app opens.",
    steps: [
      "Target is 10 correct production answers/day.",
      "Complete goal with writing, active-usage, or correction tasks.",
      "Keep streak by meeting target each day, not just logging in.",
    ],
    outcome: "High-signal habit tracking tied to real performance.",
  },
  {
    title: "10) Weekly Progress Report",
    icon: "/window.svg",
    purpose: "Review retention, weak terms, and next best actions.",
    steps: [
      "Read weekly trend summary on progress and forgotten items.",
      "Inspect top error categories and weak words.",
      "Use recommended drill plan for the next week.",
    ],
    outcome: "Clear feedback loop that drives smarter study decisions.",
  },
  {
    title: "11) Study Plan + Missions",
    icon: "/globe.svg",
    purpose: "Convert goals into day-by-day execution.",
    steps: [
      "Generate a 7-day plan from due items and weak areas.",
      "Pick one mission theme (for example: meetings or travel).",
      "Complete daily mission tasks and track closure rate.",
    ],
    outcome: "Less decision fatigue and higher completion consistency.",
  },
  {
    title: "12) Sentence Lab + Pronunciation",
    icon: "/file.svg",
    purpose: "Improve sentence naturalness and spoken confidence.",
    steps: [
      "Write or paste sentence drafts in Sentence Lab for scoring.",
      "Apply corrected version and compare alternatives.",
      "Use pronunciation panel for repeat-and-refine speaking rounds.",
    ],
    outcome: "Better accuracy, natural phrasing, and speaking confidence.",
  },
] as const;

const telegramExamples = [
  "take over",
  "heavy rain",
  "procrastinate - delay tasks until too late",
  "add: take over | manage control of something | work,project | I took over the team",
] as const;

export default async function GuidePage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e7f9f1_0%,#f8fbf9_45%,#fff8ef_100%)]">
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-950">
            LexiCoach
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-emerald-900/90">
            <Link href="/" className="hover:text-emerald-700">
              Home
            </Link>
            <Link href="#phases" className="hidden hover:text-emerald-700 sm:block">
              Phases
            </Link>
            <Link href="#lessons" className="hidden hover:text-emerald-700 sm:block">
              Lessons
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-44 w-44 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-12 top-12 h-16 w-16 rotate-6 rounded-2xl border border-amber-200/60 bg-amber-50/70" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Step-by-step guide
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
                Learn every feature with a practical flow
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-emerald-900/80 sm:text-base">
                This page teaches exactly how to use each capability from intake to weekly
                reporting so you can run LexiCoach as a full learning system.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#lessons"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Start lessons
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-900/20 bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Open workspace
                </Link>
              </div>
              {userEmail ? (
                <p className="mt-4 text-xs text-emerald-900/70">Signed in as {userEmail}</p>
              ) : null}
            </div>

            <div className="grid gap-3">
              <GuideSignal
                icon="/globe.svg"
                label="Input tolerance"
                text="Single words, phrases, rough notes, and structured commands all work."
              />
              <GuideSignal
                icon="/window.svg"
                label="Skill training"
                text="Run targeted modes for memory, correctness, collocations, and active use."
              />
              <GuideSignal
                icon="/file.svg"
                label="Outcome metrics"
                text="Daily production goals and weekly reports keep learning accountable."
              />
            </div>
          </div>
        </section>

        <section id="phases" className="mt-16 scroll-mt-24">
          <GuideHeader
            eyebrow="Execution Path"
            title="Follow this sequence for best results"
            subtitle="Treat learning as a pipeline: capture, structure, train, and optimize."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {journeyPhases.map((phase) => (
              <article
                key={phase.title}
                className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-emerald-950">{phase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">{phase.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="lessons" className="mt-16 scroll-mt-24">
          <GuideHeader
            eyebrow="Feature Lessons"
            title="One-by-one tutorial"
            subtitle="Each card tells you why the feature matters, how to run it, and what result to expect."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {featureLessons.map((lesson, idx) => (
              <article
                key={lesson.title}
                className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/95 p-5 shadow-sm"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/25 blur-2xl" />
                <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-sky-200/20 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl border border-white/80 bg-white p-2 shadow-sm">
                      <Image src={lesson.icon} alt="" width={18} height={18} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/60">
                        Lesson {idx + 1}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-emerald-950">{lesson.title}</h3>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-emerald-900/85">
                    <span className="font-semibold text-emerald-950">Purpose: </span>
                    {lesson.purpose}
                  </p>
                  <ol className="mt-3 space-y-2 text-sm text-emerald-900/85">
                    {lesson.steps.map((step) => (
                      <li key={step} className="rounded-xl border border-emerald-900/10 bg-emerald-50/45 px-3 py-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-900/85">
                    <span className="font-semibold text-emerald-950">Expected result: </span>
                    {lesson.outcome}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <GuideHeader
            eyebrow="Telegram Examples"
            title="You can send imperfect messages"
            subtitle="The parser and AI extraction normalize your input into a clean vocabulary entry."
          />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-emerald-900/10 bg-emerald-50/35 p-4">
              <p className="text-sm font-semibold text-emerald-950">Inputs you can send</p>
              <div className="mt-3 space-y-2 text-sm">
                {telegramExamples.map((message) => (
                  <div
                    key={message}
                    className="max-w-[95%] rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-emerald-950"
                  >
                    {message}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-900/10 bg-sky-50/35 p-4">
              <p className="text-sm font-semibold text-emerald-950">System response behavior</p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/85">
                <li>Detects term and entry type (word or phrase).</li>
                <li>Extracts meaning, tags, and example if available.</li>
                <li>Cleans duplicates by updating existing records when needed.</li>
                <li>Returns a short confirmation with normalized fields.</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

function GuideHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-900/60">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-emerald-900/80 sm:text-base">{subtitle}</p>
    </header>
  );
}

function GuideSignal({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <article className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-white to-emerald-50/55 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-white/80 bg-white p-2 shadow-sm">
          <Image src={icon} alt="" width={18} height={18} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/65">{label}</p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900/85">{text}</p>
        </div>
      </div>
    </article>
  );
}
