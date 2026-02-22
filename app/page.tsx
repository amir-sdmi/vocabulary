import Link from "next/link";

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

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-amber-950 dark:text-amber-50 sm:text-5xl">
            Build your vocabulary, one word at a time
          </h1>
          <p className="mt-4 text-lg text-amber-800/80 dark:text-amber-200/80 max-w-2xl mx-auto">
            A simple place to collect words, definitions, and examples. Perfect for learners and readers.
          </p>
          <Link
            href="#start"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 transition-colors"
          >
            Start your notebook
          </Link>
        </section>

        <section id="about" className="mt-24 scroll-mt-24">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
            About
          </h2>
          <p className="mt-3 text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
            Vocabulary Notebook helps you keep all your new words in one place. Add words as you read or study, with definitions and example sentences, so you can review and remember them later.
          </p>
        </section>

        <section id="start" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
            Get started
          </h2>
          <p className="mt-3 text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
            Sign up or log in to create your first notebook and start adding words today.
          </p>
        </section>
      </main>
    </div>
  );
}
