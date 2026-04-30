import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Placeholder contact page for Charity Directory.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-6 py-14 sm:px-8 lg:py-18">
      <h1 className="font-semibold text-4xl text-zinc-900">Contact</h1>
      <p className="text-sm leading-7 text-zinc-700">
        Contact workflows will be added in a future release. This page is a placeholder for product iteration.
      </p>
    </section>
  );
}
