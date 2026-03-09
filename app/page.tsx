import Link from "next/link";
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
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-emerald-950"
          >
            LexiCoach
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-emerald-900/90">
            <Link href="#about" className="hover:text-emerald-700">
              About
            </Link>
            <Link href="#start" className="hover:text-emerald-700">
              Get started
            </Link>
            {userEmail ? <SignOutButton /> : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
          <p className="inline-flex rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
            Your Personal Language Coach
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
            Personal Vocabulary Dictionary
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-900/75 sm:text-base">
            A real-world vocabulary workspace: collect words, keep entries clean, edit quickly,
            and export your full dictionary whenever you need.
          </p>
          {userEmail ? (
            <>
              <p className="mt-2 text-xs text-emerald-900/65">Signed in as {userEmail}</p>
              <div className="mt-6">
                <VocabularyWorkspace />
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-emerald-900/15 bg-white/90 p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-emerald-950">Sign in to continue</h2>
              <p className="mt-2 text-sm text-emerald-900/75">
                Multi-user mode is enabled. Each account sees only its own vocabulary list.
              </p>
              <div className="mt-5 flex justify-center">
                <SignInButton />
              </div>
            </div>
          )}
        </section>

        <section id="about" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-950">About</h2>
          <p className="mt-3 leading-relaxed text-emerald-900/80">
            This app is built for active language learning. You can keep vocabulary cards updated,
            mark trouble words, and use exports for backup or moving to other tools.
          </p>
        </section>

        <section id="start" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-950">Get started</h2>
          <p className="mt-3 leading-relaxed text-emerald-900/80">
            Send Telegram messages like <code>add: take over | I took over the project.</code>
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
