"use client";

import { useMemo, useState } from "react";

import { CharityCard } from "@/components/CharityCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { defaultCharityFilters, filterCharities } from "@/lib/filters";
import type {
  CharityFilters,
  CharityOrganization,
  Category,
  WayToHelp,
} from "@/types/charity";

interface CharityCatalogProps {
  charities: CharityOrganization[];
  categories: Category[];
  initialFilters?: CharityFilters;
  title: string;
  description?: string;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export function CharityCatalog({
  charities,
  categories,
  initialFilters,
  title,
  description,
}: CharityCatalogProps) {
  const [filters, setFilters] = useState<CharityFilters>({
    ...defaultCharityFilters,
    ...initialFilters,
  });

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [category.slug, category.name] as const),
      ),
    [categories],
  );

  const subcategories = useMemo(
    () => uniqueValues(charities.flatMap((charity) => charity.subcategories)),
    [charities],
  );

  const populations = useMemo(
    () => uniqueValues(charities.flatMap((charity) => charity.populationServed)),
    [charities],
  );

  const waysToHelp = useMemo(
    () =>
      uniqueValues(charities.flatMap((charity) => charity.waysToHelp)) as WayToHelp[],
    [charities],
  );

  const filteredCharities = useMemo(
    () => filterCharities(charities, filters),
    [charities, filters],
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <header className="space-y-4">
        <h1 className="font-semibold text-4xl leading-tight text-[var(--color-text-strong)]">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-muted)]">{description}</p> : null}

        <div className="dark-panel grid gap-3 p-4 sm:grid-cols-[1fr_240px]">
          <label className="text-sm text-[var(--color-text-muted)]">
            <span className="mb-2 block font-medium">Search charity, need, or mission</span>
            <input
              type="text"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="e.g. food bank, scholarships, legal aid"
              className="h-11 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
            />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            <span className="mb-2 block font-medium">Result count</span>
            <div className="flex h-11 items-center border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)]">
              {filteredCharities.length} matches
            </div>
          </label>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          filters={filters}
          subcategories={subcategories}
          populations={populations}
          waysToHelp={waysToHelp}
          onChange={setFilters}
          onReset={() => setFilters({ ...defaultCharityFilters })}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {filteredCharities.map((charity) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              categoryName={categoryMap.get(charity.categorySlug) ?? "Uncategorized"}
            />
          ))}

          {filteredCharities.length === 0 ? (
            <div className="dark-panel col-span-full p-8 text-sm text-[var(--color-text-muted)]">
              No charities matched this filter set. Try widening your location, subcategory, or ways-to-help selection.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
