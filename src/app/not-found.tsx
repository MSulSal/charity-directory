import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-20 text-center sm:px-8">
      <p className="text-xs tracking-[0.15em] text-[var(--color-text-faint)] uppercase">404</p>
      <h1 className="font-semibold text-4xl text-[var(--color-text-strong)]">Page not found</h1>
      <p className="text-sm leading-7 text-[var(--color-text-muted)]">
        The requested page could not be found. You can continue browsing categories or return to the homepage.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="border border-[var(--color-text-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text-strong)]"
        >
          Home
        </Link>
        <Link
          href="/categories"
          className="border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-2 text-sm text-[var(--color-text-strong)]"
        >
          Categories
        </Link>
      </div>
    </section>
  );
}
