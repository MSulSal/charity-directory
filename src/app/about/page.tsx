import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Charity Directory and the product direction for trusted nonprofit discovery.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-6 py-14 sm:px-8 lg:py-18">
      <h1 className="font-semibold text-4xl text-[var(--color-text-strong)]">About Charity Directory</h1>
      <p className="text-sm leading-7 text-[var(--color-text-muted)]">
        Charity Directory makes nonprofit discovery clear, source-linked, and action-oriented. We publish a focused collection of organization profiles and make it easier to find official giving, volunteering, and contact information.
      </p>
    </section>
  );
}
