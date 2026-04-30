import type { Metadata } from "next";
import Link from "next/link";

import { CategoryDropdownExplorer } from "@/components/CategoryDropdownExplorer";
import { FeaturedCharities } from "@/components/FeaturedCharities";
import { Hero } from "@/components/Hero";
import { categories, charities } from "@/data";

export const metadata: Metadata = {
  title: {
    absolute: "Charity Directory - Find Trusted Charities by Cause and Location",
  },
  description:
    "Find trusted charities, nonprofits, donation links, volunteer opportunities, and local help by cause, location, and ways to give.",
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <CategoryDropdownExplorer
        categories={categories}
        charities={charities}
        title="Browse by Major Charity Category"
        description="Explore five core sectors, then narrow by subcategory, place, population served, and ways to help."
      />

      <FeaturedCharities charities={charities.slice(0, 4)} categories={categories} />

      <section className="dark-panel mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <h2 className="font-semibold text-3xl leading-tight text-[var(--color-text-strong)]">
              Built for donors, volunteers, companies, and people seeking support
            </h2>
            <p className="text-sm leading-7 text-[var(--color-text-muted)]">
              Charity Directory is structured so users can move quickly from intent to action: find a need, check trust signals, compare options, and connect through clear donation, volunteer, and contact pathways.
            </p>
            <p className="text-sm leading-7 text-[var(--color-text-muted)]">
              Trust fields are intentionally modeled for future integrations with sources such as Charity Navigator, Candid / GuideStar, IRS nonprofit status, and BBB Wise Giving Alliance.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/categories"
              className="border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text-strong)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
            >
              Explore all categories
            </Link>
            <Link
              href="/charities"
              className="border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:brightness-95"
            >
              Browse sample charities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
