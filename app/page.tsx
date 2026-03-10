import Link from "next/link";
import Image from "next/image";
import { VocabularyWorkspace } from "./components/VocabularyWorkspace";
import { auth } from "@/auth";
import { SignInButton, SignOutButton } from "./components/AuthButtons";

export default async function Home() {
  const session = await auth();
  const userEmail = session?.user?.email;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff8ea_0%,#f8fbf9_45%,#fff8ea_100%)]">
      <header className="sticky top-0 z-10 border-b border-emerald-900/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-950">
            LexiCoach
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-emerald-900/90">
            <Link href="#about" className="hover:text-emerald-700">
              About
            </Link>
            <Link href="#features" className="hover:text-emerald-700">
              Features
            </Link>
            <Link href="#start" className="hover:text-emerald-700">
              Get started
            </Link>
            {userEmail ? <SignOutButton /> : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/85 p-6 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 top-20 h-32 w-32 rounded-full bg-sky-200/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                Your Personal Language Coach
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
                Build a vocabulary you can actually use
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-900/75 sm:text-base">
                Import old word lists, train by skill, fix weak patterns, and track meaningful
                daily output. LexiCoach turns collected words into active language.
              </p>
              {userEmail ? (
                <p className="mt-3 text-xs text-emerald-900/65">Signed in as {userEmail}</p>
              ) : (
                <div className="mt-6 flex items-center gap-3">
                  <SignInButton />
                  <span className="text-xs text-emerald-900/70">
                    Google sign-in. Private per-user workspace.
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-10 h-14 w-14 rounded-2xl border border-emerald-400/30 bg-emerald-100/80 backdrop-blur-sm" />
              <div className="absolute -right-4 bottom-8 h-12 w-12 rounded-full border border-amber-300/50 bg-amber-100/70" />
              <div className="grid gap-3">
                <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-white to-emerald-50/80 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl border border-emerald-200 bg-white p-2">
                      <Image src="/globe.svg" alt="Smart learning" width={20} height={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/60">
                        Skill review
                      </p>
                      <p className="text-sm font-medium text-emerald-950">
                        Recall, writing, collocation, active usage
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-white to-amber-50/70 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl border border-amber-200 bg-white p-2">
                      <Image src="/file.svg" alt="Imports and reports" width={20} height={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/60">
                        Import and report
                      </p>
                      <p className="text-sm font-medium text-emerald-950">
                        CSV, Anki, Google Sheets plus weekly insights
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-white to-sky-50/70 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl border border-sky-200 bg-white p-2">
                      <Image src="/window.svg" alt="Workflow automation" width={20} height={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/60">
                        Guided workflow
                      </p>
                      <p className="text-sm font-medium text-emerald-950">
                        Saved filters, weak-area drills, use-it-today queue
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {userEmail ? (
          <section className="mt-8">
            <VocabularyWorkspace />
          </section>
        ) : null}

        <section id="about" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-950">About</h2>
          <p className="mt-3 leading-relaxed text-emerald-900/80">
            This app is built for active language learning. You can keep vocabulary cards updated,
            mark trouble words, and use exports for backup or moving to other tools.
          </p>
        </section>

        <section id="features" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-950">What you can do</h2>
          <p className="mt-3 leading-relaxed text-emerald-900/80">
            Everything is designed around one goal: helping you actually use new words in real life, not just collect
            them.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Import your old lists"
              description="Bring in your existing vocabulary from CSV, Anki CSV, or Google Sheets CSV so you can start quickly without retyping everything."
              icon="/file.svg"
              tone="amber"
            />
            <FeatureCard
              title="Find words fast with smart filters"
              description="Search by meaning, tag, status, mistake type, entry type, and collocations. Save your favorite filter sets for one-click study views."
              icon="/window.svg"
              tone="sky"
            />
            <FeatureCard
              title="Learn words as a network"
              description="Store synonyms, antonyms, collocations, and word families (noun/verb/adjective/adverb) so each word has context."
              icon="/globe.svg"
              tone="emerald"
            />
            <FeatureCard
              title="Track real daily progress"
              description='Daily goal uses meaningful output: by default, "10 correct production answers per day," plus streak tracking based on completed goals.'
              icon="/file.svg"
              tone="emerald"
            />
            <FeatureCard
              title="Practice by skill"
              description="Use focused review modes like recall, writing, collocation, error correction, and active usage."
              icon="/globe.svg"
              tone="sky"
            />
            <FeatureCard
              title="Train your weak areas"
              description="Weak-area drills prioritize your repeated mistakes, such as grammar or collocation problems, so your practice time is targeted."
              icon="/window.svg"
              tone="amber"
            />
            <FeatureCard
              title="Use-it-today queue"
              description="Get prompts for words you learned but have not actively used recently, to push vocabulary into real communication."
              icon="/window.svg"
              tone="emerald"
            />
            <FeatureCard
              title="Weekly learning reports"
              description="See retained vs forgotten words, usable vocabulary, top error patterns, and practical next-step recommendations."
              icon="/file.svg"
              tone="sky"
            />
            <FeatureCard
              title="Add words from Telegram"
              description='Use structured commands like "add: term | meaning | tags | sentence" or simple natural text. The bot replies with cleaned confirmation.'
              icon="/globe.svg"
              tone="amber"
            />
            <FeatureCard
              title="Ready for voice and image intake"
              description="The ingestion pipeline is prepared for future voice-note and image-based word capture without redesigning your data."
              icon="/file.svg"
              tone="emerald"
            />
          </div>
        </section>

        <section id="start" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-950">Get started</h2>
          <p className="mt-3 leading-relaxed text-emerald-900/80">
            Send Telegram messages like <code>add: take over | manage | work | I took over the project.</code>
            and the word card is created automatically in your dictionary.
          </p>
        </section>
      </main>

      <footer className="border-t border-emerald-900/10 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-emerald-900/70 sm:px-6">
          <p>LexiCoach • Personal vocabulary system</p>
          <p>Multi-user secure workspace with Google sign-in</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  tone,
}: {
  title: string;
  description: string;
  icon: string;
  tone: "emerald" | "amber" | "sky";
}) {
  const tones = {
    emerald: "from-emerald-50/80 to-white border-emerald-900/10",
    amber: "from-amber-50/80 to-white border-amber-900/10",
    sky: "from-sky-50/80 to-white border-sky-900/10",
  };

  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-white/80 bg-white p-2 shadow-sm">
          <Image src={icon} alt="" width={18} height={18} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-emerald-950">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900/80">{description}</p>
        </div>
      </div>
    </article>
  );
}
