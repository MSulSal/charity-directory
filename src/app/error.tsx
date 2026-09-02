"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-5 px-6 py-20 text-center sm:px-8">
      <p className="text-xs tracking-[0.15em] text-[var(--color-text-faint)] uppercase">Something went wrong</p>
      <h1 className="text-4xl font-semibold text-[var(--color-text-strong)]">Please try again</h1>
      <p className="text-sm leading-7 text-[var(--color-text-muted)]">The page could not be completed. Try again or return to the directory.</p>
      <button type="button" onClick={reset} className="border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-5 py-3 text-sm font-semibold text-[var(--color-obsidian)]">Try again</button>
    </section>
  );
}
