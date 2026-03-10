import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import { VocabularyWorkspace } from "./components/VocabularyWorkspace";

const featureGuides = [
  {
    title: "Context Memory Graph Canvas",
    what: "Visualizes semantic links between terms, collocations, tags, and repeated mistakes.",
    how: "Open Context Memory Graph panel, inspect clusters, and run recommended drills for linked terms.",
    icon: "/globe.svg",
    tone: "emerald",
  },
  {
    title: "AI Sentence Lab",
    what: "Scores grammar and naturalness, then rewrites your sentence in casual and formal styles.",
    how: "Open Sentence Lab, enter a sentence with optional target term, and apply feedback instantly.",
    icon: "/file.svg",
    tone: "sky",
  },
  {
    title: "7-Day Auto Study Plan",
    what: "Generates a day-by-day plan from weak areas, due cards, and graph recommendations.",
    how: "Open Study Plan panel, check today’s task, and start the suggested review mode.",
    icon: "/window.svg",
    tone: "amber",
  },
  {
    title: "Smart Notifications",
    what: "Suggests best review windows and streak-rescue reminders from your usage patterns.",
    how: "Open Smart Notifications panel and enable browser reminders for your top time window.",
    icon: "/window.svg",
    tone: "emerald",
  },
  {
    title: "Mastery Levels",
    what: "Tracks each card from seen to practiced to stable to fluent with progress indicators.",
    how: "Review cards regularly and monitor mastery badges on each vocabulary item.",
    icon: "/file.svg",
    tone: "emerald",
  },
  {
    title: "Topic Missions",
    what: "Creates weekly mission goals for your most-used tags like work, travel, or meetings.",
    how: "Add tagged words, open Missions panel, and complete suggested terms until target is reached.",
    icon: "/globe.svg",
    tone: "amber",
  },
  {
    title: "Shadowing + Pronunciation",
    what: "Lets you listen, repeat, and compare spoken output against target phrases.",
    how: "Use Pronunciation panel, play TTS, record repeat, and iterate until match improves.",
    icon: "/window.svg",
    tone: "sky",
  },
  {
    title: "Telegram Coach Mode",
    what: "After saving a term, bot asks a follow-up sentence to force active production.",
    how: "Send any word/phrase, then reply with a sentence using the prompted term.",
    icon: "/globe.svg",
    tone: "emerald",
  },
  {
    title: "Deck Export Profiles",
    what: "Exports tailored Anki decks for clean review, exam prep, and speaking practice.",
    how: "Use toolbar export buttons: Anki Clean, Exam Deck, or Speaking Deck.",
    icon: "/file.svg",
    tone: "amber",
  },
  {
    title: "Learning Analytics Dashboard",
    what: "Shows retention, mastery distribution, improving terms, and struggling terms.",
    how: "Open Analytics panel and use the insights to adjust your next week focus.",
    icon: "/window.svg",
    tone: "sky",
  },
  {
    title: "Import from CSV, Anki, Google Sheets",
    what: "Migrates your old vocabulary into one clean workspace with preview before writing.",
    how: "Open Import panel, paste content or Sheets CSV URL, run preview, then execute import.",
    icon: "/file.svg",
    tone: "amber",
  },
  {
    title: "Advanced Search + Saved Filters",
    what: "Searches by meaning, status, due, collocation, and error type with reusable filter presets.",
    how: "Set filters in toolbar, save as named filter, and reuse it as a one-click study lens.",
    icon: "/window.svg",
    tone: "emerald",
  },
] as const;

const workflowSteps = [
  {
    title: "1. Capture",
    text: "Add from web form, import files, or Telegram messages. Do not wait for perfect formatting.",
  },
  {
    title: "2. Organize",
    text: "Clean cards with meaning, tags, collocations, and lexical relations. Save filters by study goal.",
  },
  {
    title: "3. Practice",
    text: "Run skill-specific sessions, weak-area drills, and use-today queue to force real output.",
  },
  {
    title: "4. Improve",
    text: "Use daily goal and weekly report to spot bottlenecks and decide what to train next.",
  },
] as const;

const solutionTracks = [
  {
    title: "I forget words quickly",
    solution:
      "Use Memory Graph + Weak Area mode + Study Plan to revisit connected terms in context instead of isolated repetition.",
  },
  {
    title: "I know words but cannot use them",
    solution:
      "Run Active Usage and Sentence Lab daily, then close loop with Telegram Coach sentence follow-up.",
  },
  {
    title: "My vocabulary is messy",
    solution:
      "Import old lists, normalize cards, add lexical links, and manage with saved filters and missions.",
  },
  {
    title: "I lose consistency",
    solution:
      "Follow daily goal + smart notification windows + weekly report recommendations to keep momentum.",
  },
] as const;

export default async function Home() {
  const session = await auth();
  const userEmail = session?.user?.email;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff8ea_0%,#f8fbf9_45%,#fff8ea_100%)]">
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-950">
            LexiCoach
          </Link>
          <nav className="hidden gap-5 text-sm font-medium text-emerald-900/90 sm:flex">
            <Link href="#overview" className="hover:text-emerald-700">
              Overview
            </Link>
            <Link href="#workflow" className="hover:text-emerald-700">
              Workflow
            </Link>
            <Link href="#solutions" className="hover:text-emerald-700">
              Solutions
            </Link>
            <Link href="#features" className="hover:text-emerald-700">
              Features
            </Link>
            <Link href="#telegram" className="hover:text-emerald-700">
              Telegram
            </Link>
            <Link href="/guide" className="hover:text-emerald-700">
              Guide
            </Link>
            {userEmail ? <SignOutButton /> : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section
          id="overview"
          className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-sm sm:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="pointer-events-none absolute right-24 top-16 h-16 w-16 rounded-2xl border border-sky-200/70 bg-sky-50/60" />

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Personal Vocabulary OS
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
                A real learning system, not just a word list
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-emerald-900/80 sm:text-base">
                LexiCoach helps you capture words quickly, organize them with context, practice by
                skill, and track meaningful progress with goals and reports.
              </p>

              {userEmail ? (
                <p className="mt-4 text-xs text-emerald-900/70">Signed in as {userEmail}</p>
              ) : (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <SignInButton />
                  <span className="text-xs text-emerald-900/70">
                    Google sign-in. Private multi-user workspace.
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <HeroMetric
                icon="/globe.svg"
                label="Smart intake"
                text="Send one word or full messy text. Bot still extracts a usable entry."
              />
              <HeroMetric
                icon="/window.svg"
                label="Focused practice"
                text="Recall, writing, collocation, weak-area and use-today review modes."
              />
              <HeroMetric
                icon="/file.svg"
                label="Measurable progress"
                text="Daily production goals, streaks, and weekly recommendations."
              />
            </div>
          </div>
        </section>

        <section id="workflow" className="mt-16 scroll-mt-24">
          <SectionHeader
            eyebrow="How It Works"
            title="From raw input to active language in four steps"
            subtitle="This is the exact flow most learners follow each day."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-emerald-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="solutions" className="mt-16 scroll-mt-24">
          <SectionHeader
            eyebrow="Problem to Solution"
            title="Pick your blocker and follow the matching path"
            subtitle="Each track combines specific features that solve one practical learning problem."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {solutionTracks.map((track) => (
              <SolutionCard key={track.title} title={track.title} solution={track.solution} />
            ))}
          </div>
        </section>

        <section id="features" className="mt-16 scroll-mt-24">
          <SectionHeader
            eyebrow="Feature Playbook"
            title="Every feature explained with practical usage"
            subtitle="Use this as your operating guide for the app."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featureGuides.map((feature) => (
              <FeatureGuideCard
                key={feature.title}
                title={feature.title}
                what={feature.what}
                how={feature.how}
                icon={feature.icon}
                tone={feature.tone}
              />
            ))}
          </div>
          <article className="mt-6 relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/90 p-5 shadow-sm sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-200/35 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-950">
                  Need step-by-step instructions for every feature?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900/80">
                  Open the complete guide with exact actions, sample workflows, and best practices.
                </p>
              </div>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Open Full Guide
              </Link>
            </div>
          </article>
        </section>

        <section id="telegram" className="mt-16 scroll-mt-24">
          <SectionHeader
            eyebrow="Telegram UX"
            title="Message naturally, bot handles the structure"
            subtitle="You do not need perfect prompts. The parser and AI extraction handle most formats."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-emerald-900/10 bg-white/90 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-950">Example messages you can send</h3>
              <div className="mt-3 space-y-2 text-sm">
                <MessageBubble tone="in">take over</MessageBubble>
                <MessageBubble tone="in">heavy rain</MessageBubble>
                <MessageBubble tone="in">procrastinate - delay tasks until too late</MessageBubble>
                <MessageBubble tone="in">
                  add: take over | manage control of something | work, project | I took over the team.
                </MessageBubble>
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-900/10 bg-white/90 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-950">What the bot does automatically</h3>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900/85">
                <li>Detects term or phrase even from incomplete messages.</li>
                <li>Extracts meaning, sentence, tags, and lexical hints when present.</li>
                <li>Creates new entry or updates existing one to avoid noisy duplicates.</li>
                <li>Returns clean confirmation with saved fields and parser confidence.</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="start" className="mt-16 scroll-mt-24 rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <SectionHeader
            eyebrow="Quick Start"
            title="Start in under five minutes"
            subtitle="A practical onboarding path for first-time users."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickStep
              num="01"
              text="Sign in with Google, then open your personal workspace."
            />
            <QuickStep
              num="02"
              text="Import old vocabulary or add your first 20 useful words."
            />
            <QuickStep
              num="03"
              text="Create one saved filter such as 'work + trouble + due'."
            />
            <QuickStep
              num="04"
              text="Run a writing or active-usage session and hit your daily goal."
            />
          </div>
        </section>

        {userEmail ? (
          <section className="mt-12">
            <VocabularyWorkspace />
          </section>
        ) : null}
      </main>

      <footer className="border-t border-emerald-900/10 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-emerald-900/70 sm:px-6">
          <p>LexiCoach • Personal vocabulary system</p>
          <p>Import, practice, track, improve</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({
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

function HeroMetric({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <article className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-white to-emerald-50/60 p-4 shadow-sm">
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

function FeatureGuideCard({
  title,
  what,
  how,
  icon,
  tone,
}: {
  title: string;
  what: string;
  how: string;
  icon: string;
  tone: "emerald" | "amber" | "sky";
}) {
  const tones = {
    emerald: "from-emerald-50/80 to-white border-emerald-900/10",
    amber: "from-amber-50/80 to-white border-amber-900/10",
    sky: "from-sky-50/80 to-white border-sky-900/10",
  };

  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-white/90 bg-white p-2 shadow-sm">
          <Image src={icon} alt="" width={18} height={18} />
        </span>
        <div>
          <h3 className="text-base font-semibold text-emerald-950">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/85">
            <span className="font-semibold text-emerald-950">What it does: </span>
            {what}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/85">
            <span className="font-semibold text-emerald-950">How to use: </span>
            {how}
          </p>
        </div>
      </div>
    </article>
  );
}

function SolutionCard({ title, solution }: { title: string; solution: string }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/90 p-5 shadow-sm">
      <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/35 blur-2xl" />
      <div className="pointer-events-none absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-sky-200/25 blur-2xl" />
      <div className="relative z-10">
        <h3 className="text-base font-semibold text-emerald-950">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/85">{solution}</p>
      </div>
    </article>
  );
}

function QuickStep({ num, text }: { num: string; text: string }) {
  return (
    <article className="rounded-2xl border border-emerald-900/10 bg-emerald-50/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/60">{num}</p>
      <p className="mt-1 text-sm leading-relaxed text-emerald-900/85">{text}</p>
    </article>
  );
}

function MessageBubble({ tone, children }: { tone: "in" | "out"; children: React.ReactNode }) {
  const styles =
    tone === "in"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
      : "border-sky-200 bg-sky-50/80 text-sky-950";
  return (
    <div className={`max-w-[90%] rounded-2xl border px-3 py-2 ${styles}`}>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
