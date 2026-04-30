"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  actionPath?: string;
  defaultQuery?: string;
  defaultLocation?: string;
  className?: string;
}

export function SearchBar({
  actionPath = "/charities",
  defaultQuery = "",
  defaultLocation = "",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const router = useRouter();

  const formClassName = useMemo(
    () =>
      [
        "grid gap-3 border p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const search = params.toString();
    router.push(search ? `${actionPath}?${search}` : actionPath);
  }

  return (
    <form className={formClassName} onSubmit={handleSubmit} role="search">
      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text-muted)]">
        Charity, cause, or need
        <input
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. food bank, mental health, legal aid"
          className="h-12 border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none transition placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text-muted)]">
        Location
        <input
          name="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City, state, or ZIP"
          className="h-12 border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none transition placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
        />
      </label>

      <button
        type="submit"
        className="h-12 w-full border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-6 text-sm font-semibold text-[var(--color-obsidian)] transition hover:brightness-95 sm:w-auto"
      >
        Search Directory
      </button>
    </form>
  );
}
