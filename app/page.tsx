import Link from "next/link";
import { TelegramMessages } from "./components/TelegramMessages";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50/80 dark:bg-stone-950">
      <header className="border-b border-amber-200/60 dark:border-amber-900/40 bg-white/70 dark:bg-stone-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-amber-900 dark:text-amber-100"
          >
            Vocabulary Notebook
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-amber-800/90 dark:text-amber-200/90">
            <Link href="#about" className="hover:text-amber-700 dark:hover:text-amber-100">
              About
            </Link>
            <Link href="#start" className="hover:text-amber-700 dark:hover:text-amber-100">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <section>
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 sm:text-3xl">
            Your vocabularies
          </h1>
          <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">
            All messages saved in the notebook (from Telegram). Refreshes every 5 seconds.
          </p>
          <TelegramMessages />
        </section>

        <section id="about" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
            About
          </h2>
          <p className="mt-3 text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
            Vocabulary Notebook helps you keep all your new words in one place. Send words to your Telegram bot and they appear here, stored in Vercel Blob.
          </p>
        </section>

        <section id="start" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
            Get started
          </h2>
          <p className="mt-3 text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
            Set the Telegram webhook to your deployed URL and send messages to your bot; they will show up above.
          </p>
        </section>
      </main>
    </div>
  );
}
