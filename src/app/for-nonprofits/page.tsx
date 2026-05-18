import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Nonprofits",
  description:
    "Information for nonprofits that want to claim a profile or submit listing updates in Charity Directory.",
};

export default function ForNonprofitsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-12 sm:px-8 lg:py-16">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-[var(--color-text-strong)] sm:text-5xl">
          For Nonprofits
        </h1>
        <p className="text-sm leading-7 text-[var(--color-text-muted)]">
          Nonprofits can use our intake flow to request profile creation, claim an existing listing, and submit updated details for review.
        </p>
      </header>

      <div className="dark-panel space-y-4 p-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
          Start an Intake Submission
        </h2>
        <p className="text-sm leading-7 text-[var(--color-text-muted)]">
          Share your organization details, service area, and reference links so we can review and publish updates in the directory.
        </p>
        <Link
          href="/submit-a-charity"
          className="inline-flex h-11 items-center border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-5 text-sm font-semibold text-[var(--color-obsidian)] transition hover:brightness-95"
        >
          Open Apply / Recommend Form
        </Link>
      </div>
    </section>
  );
}
