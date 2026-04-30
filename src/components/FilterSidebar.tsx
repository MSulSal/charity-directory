"use client";

import type { CharityFilters, ServiceScale, WayToHelp } from "@/types/charity";

interface FilterSidebarProps {
  filters: CharityFilters;
  subcategories: string[];
  populations: string[];
  waysToHelp: WayToHelp[];
  onChange: (nextFilters: CharityFilters) => void;
  onReset: () => void;
}

const serviceScaleOptions: ServiceScale[] = ["Local", "National", "International"];

export function FilterSidebar({
  filters,
  subcategories,
  populations,
  waysToHelp,
  onChange,
  onReset,
}: FilterSidebarProps) {
  function update<K extends keyof CharityFilters>(key: K, value: CharityFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="dark-panel space-y-5 p-5" aria-label="Filters">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">Filter charities</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[var(--color-text-faint)] underline-offset-2 hover:text-[var(--color-text-strong)] hover:underline"
        >
          Reset
        </button>
      </div>

      <label className="block text-sm text-[var(--color-text-muted)]">
        <span className="mb-2 block font-medium">Subcategory</span>
        <select
          value={filters.subcategory}
          onChange={(event) => update("subcategory", event.target.value)}
          className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
        >
          <option value="">All subcategories</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-[var(--color-text-muted)]">
        <span className="mb-2 block font-medium">Location</span>
        <input
          type="text"
          value={filters.location}
          onChange={(event) => update("location", event.target.value)}
          placeholder="City, state, or region"
          className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
        />
      </label>

      <label className="block text-sm text-[var(--color-text-muted)]">
        <span className="mb-2 block font-medium">Ways to help</span>
        <select
          value={filters.wayToHelp}
          onChange={(event) => update("wayToHelp", event.target.value as WayToHelp | "")}
          className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
        >
          <option value="">All ways to help</option>
          {waysToHelp.map((way) => (
            <option key={way} value={way}>
              {way}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-[var(--color-text-muted)]">
        <span className="mb-2 block font-medium">Vetted status</span>
        <select
          value={filters.verifiedOnly ? "yes" : "all"}
          onChange={(event) => update("verifiedOnly", event.target.value === "yes")}
          className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
        >
          <option value="all">All profiles</option>
          <option value="yes">Verified or listed only</option>
        </select>
      </label>

      <label className="block text-sm text-[var(--color-text-muted)]">
        <span className="mb-2 block font-medium">Local / national / international</span>
        <select
          value={filters.serviceScale}
          onChange={(event) =>
            update("serviceScale", event.target.value as ServiceScale | "")
          }
          className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
        >
          <option value="">All scopes</option>
          {serviceScaleOptions.map((scale) => (
            <option key={scale} value={scale}>
              {scale}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-[var(--color-text-muted)]">
        <span className="mb-2 block font-medium">Population served</span>
        <select
          value={filters.populationServed}
          onChange={(event) => update("populationServed", event.target.value)}
          className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
        >
          <option value="">All populations</option>
          {populations.map((population) => (
            <option key={population} value={population}>
              {population}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
