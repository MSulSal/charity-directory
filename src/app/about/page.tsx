import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Charity Directory and the product direction for trusted nonprofit discovery.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-6 py-14 sm:px-8 lg:py-18">
      <h1 className="font-semibold text-4xl text-zinc-900">About Charity Directory</h1>
      <p className="text-sm leading-7 text-zinc-700">
        Charity Directory is designed to make nonprofit discovery feel clear, trusted, and action-oriented. This initial version uses sample data while the trust and verification pipeline is being built.
      </p>
    </section>
  );
}
