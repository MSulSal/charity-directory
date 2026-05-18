import type { Metadata } from "next";

import { ApplyRecommendForm } from "@/components/forms/ApplyRecommendForm";
import { categories } from "@/data";

export const metadata: Metadata = {
  title: "Apply or Recommend a Charity",
  description:
    "Submit a recommendation for a charity listing or apply to claim and update an organization profile.",
};

export default function SubmitCharityPage() {
  const categoryOptions = categories.map((category) => category.name);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.16em] text-[var(--color-soft-amethyst)] uppercase">
          Directory Intake
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-[var(--color-text-strong)] sm:text-5xl">
          Apply or Recommend a Charity
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">
          Help us expand reliable listings by recommending new organizations or requesting profile
          updates for your nonprofit.
        </p>
      </header>

      <ApplyRecommendForm categoryOptions={categoryOptions} />
    </section>
  );
}
