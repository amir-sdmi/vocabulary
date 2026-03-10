import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import { VocabularyWorkspace } from "./components/VocabularyWorkspace";

const featureGuides = [
  {
    title: "Import from CSV, Anki, Google Sheets",
    what: "Migrate existing vocabulary in minutes instead of rebuilding manually.",
    how: "Open Import panel, choose source, paste CSV content (or Sheets CSV URL), run Preview, then Execute Import.",
    icon: "/file.svg",
    tone: "amber",
  },
  {
    title: "Advanced search + saved filters",
    what: "Find words by meaning, tag, status, mistake type, entry type, collocation, and due state.",
    how: "Set your filters in toolbar, name the setup, click Save filter, and reuse it for one-click study sessions.",
    icon: "/window.svg",
    tone: "sky",
  },
  {
    title: "Word families + lexical links",
    what: "Store noun/verb/adjective/adverb variants with synonyms, antonyms, and collocations.",
    how: "Edit a card, fill lexical fields, then use those links to build stronger phrase-level memory.",
    icon: "/globe.svg",
    tone: "emerald",
  },
  {
    title: "Skill-based review modes",
    what: "Train recall, writing, collocation, error correction, active usage, weak area, and use-today drills.",
    how: "Open Daily Coach and start the mode that matches your current weakness.",
    icon: "/globe.svg",
    tone: "sky",
  },
  {
    title: "Daily goal + meaningful streak",
    what: "Track true progress with a target of 10 correct production answers per day.",
    how: "Complete production tasks in coach mode and watch your streak update automatically in Insights.",
    icon: "/file.svg",
    tone: "emerald",
  },
  {
    title: "Weekly report with recommendations",
    what: "See retained, forgotten, usable words, top errors, weak words, and next-week focus.",
    how: "Open Insights for live summary or export weekly report text from the toolbar.",
    icon: "/window.svg",
    tone: "amber",
  },
  {
    title: "Telegram smart intake",
    what: "Send any messy text, word, phrase, or sentence and the bot extracts a clean vocabulary record.",
    how: "Message your bot naturally or use structured format: add: term | meaning | tags | sentence.",
    icon: "/window.svg",
    tone: "emerald",
  },
  {
    title: "Future-ready media pipeline",
    what: "Architecture is prepared for voice-note and image ingestion without redesigning your data.",
    how: "Current release handles text-first capture; media adapters can be plugged into the same intake flow.",
    icon: "/file.svg",
    tone: "sky",
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
            <Link href="#features" className="hover:text-emerald-700">
              Features
            </Link>
            <Link href="#telegram" className="hover:text-emerald-700">
              Telegram
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
