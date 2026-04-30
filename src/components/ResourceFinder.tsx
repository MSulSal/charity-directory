"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { CharityCard } from "@/components/CharityCard";
import {
  resolveLocationQuery,
  toRelativeMarkerPosition,
  withDistanceFrom,
} from "@/lib/geo";
import type {
  Category,
  CharityOrganization,
  ServiceScale,
  WayToHelp,
} from "@/types/charity";

interface ResourceFinderProps {
  charities: CharityOrganization[];
  categories: Category[];
  title?: string;
  description?: string;
  initialQuery?: string;
  initialLocation?: string;
  initialRadiusMiles?: number;
  initialSubcategory?: string;
  initialWayToHelp?: WayToHelp | "";
  initialVerifiedOnly?: boolean;
  initialServiceScale?: ServiceScale | "";
  initialPopulationServed?: string;
  showOpenPageLink?: boolean;
}

const radiusOptions = [5, 10, 25, 50, 100, 250, 500];

function isVetted(charity: CharityOrganization) {
  return charity.verificationBadges.some(
    (badge) => badge.status === "verified" || badge.status === "listed",
  );
}

function uniq(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export function ResourceFinder({
  charities,
  categories,
  title = "Resource Finder",
  description = "Find charities near an entered location with radius-based search and filters.",
  initialQuery = "",
  initialLocation = "",
  initialRadiusMiles = 50,
  initialSubcategory = "",
  initialWayToHelp = "",
  initialVerifiedOnly = false,
  initialServiceScale = "",
  initialPopulationServed = "",
  showOpenPageLink = false,
}: ResourceFinderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [radiusMiles, setRadiusMiles] = useState(initialRadiusMiles);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [wayToHelp, setWayToHelp] = useState<WayToHelp | "">(initialWayToHelp);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [serviceScale, setServiceScale] = useState<ServiceScale | "">(initialServiceScale);
  const [populationServed, setPopulationServed] = useState(initialPopulationServed);

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [category.slug, category.name] as const),
      ),
    [categories],
  );

  const subcategories = useMemo(
    () => uniq(charities.flatMap((charity) => charity.subcategories)),
    [charities],
  );

  const populations = useMemo(
    () => uniq(charities.flatMap((charity) => charity.populationServed)),
    [charities],
  );

  const waysToHelp = useMemo(
    () => uniq(charities.flatMap((charity) => charity.waysToHelp)) as WayToHelp[],
    [charities],
  );

  const locationCenter = useMemo(
    () => resolveLocationQuery(location, charities),
    [location, charities],
  );

  const withDistance = useMemo(
    () => withDistanceFrom(charities, locationCenter),
    [charities, locationCenter],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const hasLocationText = location.trim().length > 0;

    const results = withDistance.filter(({ charity, distanceMiles }) => {
      if (normalizedQuery) {
        const searchable = [
          charity.name,
          charity.mission,
          charity.serviceArea,
          charity.subcategories.join(" "),
          charity.populationServed.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(normalizedQuery)) {
          return false;
        }
      }

      if (hasLocationText) {
        if (!locationCenter || distanceMiles === null || distanceMiles > radiusMiles) {
          return false;
        }
      }

      if (subcategory && !charity.subcategories.includes(subcategory)) {
        return false;
      }

      if (wayToHelp && !charity.waysToHelp.includes(wayToHelp)) {
        return false;
      }

      if (serviceScale && charity.serviceScale !== serviceScale) {
        return false;
      }

      if (populationServed && !charity.populationServed.includes(populationServed)) {
        return false;
      }

      if (verifiedOnly && !isVetted(charity)) {
        return false;
      }

      return true;
    });

    return results.sort((left, right) => {
      if (left.distanceMiles !== null && right.distanceMiles !== null) {
        return left.distanceMiles - right.distanceMiles;
      }

      if (left.distanceMiles !== null) {
        return -1;
      }

      if (right.distanceMiles !== null) {
        return 1;
      }

      return left.charity.name.localeCompare(right.charity.name);
    });
  }, [
    location,
    locationCenter,
    populationServed,
    query,
    radiusMiles,
    serviceScale,
    subcategory,
    verifiedOnly,
    wayToHelp,
    withDistance,
  ]);

  const markers = useMemo(() => {
    if (!locationCenter) {
      return [] as Array<{ id: string; x: number; y: number; name: string; distance: number }>;
    }

    return filtered
      .filter(({ charity, distanceMiles }) => {
        return (
          charity.contact.latitude !== undefined &&
          charity.contact.longitude !== undefined &&
          distanceMiles !== null
        );
      })
      .slice(0, 40)
      .map(({ charity, distanceMiles }) => {
        const position = toRelativeMarkerPosition(
          locationCenter,
          {
            latitude: charity.contact.latitude as number,
            longitude: charity.contact.longitude as number,
            label: charity.name,
          },
          radiusMiles,
        );

        return {
          id: charity.id,
          x: position.x,
          y: position.y,
          name: charity.name,
          distance: distanceMiles as number,
        };
      });
  }, [filtered, locationCenter, radiusMiles]);

  function resetFilters() {
    setQuery(initialQuery);
    setLocation(initialLocation);
    setRadiusMiles(initialRadiusMiles);
    setSubcategory(initialSubcategory);
    setWayToHelp(initialWayToHelp);
    setVerifiedOnly(initialVerifiedOnly);
    setServiceScale(initialServiceScale);
    setPopulationServed(initialPopulationServed);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
      <header className="space-y-3">
        <h2 className="text-3xl font-semibold leading-tight text-[var(--color-text-strong)] sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-4xl text-sm leading-7 text-[var(--color-text-muted)]">
          {description}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="dark-panel space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, state or lat,lng"
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
              />
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Radius</span>
              <select
                value={radiusMiles}
                onChange={(event) => setRadiusMiles(Number(event.target.value))}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                {radiusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} miles
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Keyword</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="food bank, legal aid, youth"
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
              />
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Subcategory</span>
              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All subcategories</option>
                {subcategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Ways to help</span>
              <select
                value={wayToHelp}
                onChange={(event) => setWayToHelp(event.target.value as WayToHelp | "")}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All ways</option>
                {waysToHelp.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)]">
              <span className="mb-2 block uppercase tracking-wide">Service scope</span>
              <select
                value={serviceScale}
                onChange={(event) =>
                  setServiceScale(event.target.value as ServiceScale | "")
                }
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All scopes</option>
                <option value="Local">Local</option>
                <option value="National">National</option>
                <option value="International">International</option>
              </select>
            </label>

            <label className="text-xs text-[var(--color-text-muted)] sm:col-span-2 lg:col-span-1">
              <span className="mb-2 block uppercase tracking-wide">Population served</span>
              <select
                value={populationServed}
                onChange={(event) => setPopulationServed(event.target.value)}
                className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/75%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
              >
                <option value="">All populations</option>
                {populations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-soft)] pt-3">
            <label className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="h-4 w-4 border-[var(--color-border)] bg-[rgb(13_10_18/75%)]"
              />
              Verified/listed only
            </label>

            <div className="flex items-center gap-3">
              <p className="text-xs text-[var(--color-text-faint)]">
                {filtered.length} results
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-text-strong)]"
              >
                Reset
              </button>
            </div>
          </div>

          {showOpenPageLink ? (
            <div>
              <Link
                href="/resource-finder"
                className="text-xs tracking-wide text-[var(--color-text-muted)] uppercase underline underline-offset-4 decoration-[var(--color-border)] hover:text-[var(--color-soft-amethyst)]"
              >
                Open full resource finder page
              </Link>
            </div>
          ) : null}
        </div>

        <div className="dark-panel space-y-3 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">Map results</h3>
            <p className="text-xs text-[var(--color-text-faint)]">
              {locationCenter
                ? `${locationCenter.label} • ${radiusMiles} mi radius`
                : location.trim()
                  ? "Location not recognized"
                  : "Enter a location to activate radius search"}
            </p>
          </div>

          <div className="relative h-64 overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(180deg,#171125_0%,#100c19_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_28%,rgba(140,107,196,0.2)_0%,rgba(140,107,196,0)_58%)]" />
            <div className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border-soft)]" />
            <div className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border-soft)]" />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-saffron)]" />

            {locationCenter
              ? markers.map((marker) => (
                  <div
                    key={marker.id}
                    title={`${marker.name} (${marker.distance.toFixed(1)} mi)`}
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-text-strong)] bg-[var(--color-soft-amethyst)]"
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  />
                ))
              : null}

            {!locationCenter ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--color-text-faint)]">
                {location.trim()
                  ? "No coordinate match found for this location. Try 'City, ST' or lat,lng."
                  : "Set a location to see nearby charities plotted on the map."}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {filtered.map(({ charity, distanceMiles }) => (
          <div key={charity.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs text-[var(--color-text-faint)]">
                {distanceMiles === null
                  ? "Distance unavailable"
                  : `${distanceMiles.toFixed(1)} miles away`}
              </p>
              <p className="text-xs text-[var(--color-text-faint)]">
                {categoryMap.get(charity.categorySlug) ?? "Uncategorized"}
              </p>
            </div>
            <CharityCard
              charity={charity}
              categoryName={categoryMap.get(charity.categorySlug) ?? "Uncategorized"}
            />
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="dark-panel col-span-full p-8 text-sm text-[var(--color-text-muted)]">
            No resources found with the current location, radius, and filter settings.
          </div>
        ) : null}
      </div>
    </section>
  );
}
