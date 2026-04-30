"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  geocodeLocationQuery,
  resolveLocationQuery,
  withDistanceFrom,
} from "@/lib/geo";
import type { GeoPoint } from "@/lib/geo";
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

function buildMapUrl(charity: CharityOrganization) {
  if (
    charity.contact.latitude !== undefined &&
    charity.contact.longitude !== undefined
  ) {
    const lat = charity.contact.latitude;
    const lon = charity.contact.longitude;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
  }

  const address = [
    charity.contact.addressLine1,
    charity.contact.city,
    charity.contact.state,
    charity.contact.postalCode,
    charity.contact.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (!address) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
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
  const hasInitialSearch = initialLocation.trim().length > 0;
  const initialResolvedCenter = hasInitialSearch
    ? resolveLocationQuery(initialLocation, charities)
    : null;

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [radiusMiles, setRadiusMiles] = useState(initialRadiusMiles);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [wayToHelp, setWayToHelp] = useState<WayToHelp | "">(initialWayToHelp);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [serviceScale, setServiceScale] = useState<ServiceScale | "">(
    initialServiceScale,
  );
  const [populationServed, setPopulationServed] = useState(initialPopulationServed);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [activeRadiusMiles, setActiveRadiusMiles] = useState(initialRadiusMiles);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [activeWayToHelp, setActiveWayToHelp] = useState<WayToHelp | "">(initialWayToHelp);
  const [activeVerifiedOnly, setActiveVerifiedOnly] = useState(initialVerifiedOnly);
  const [activeServiceScale, setActiveServiceScale] = useState<ServiceScale | "">(
    initialServiceScale,
  );
  const [activePopulationServed, setActivePopulationServed] = useState(
    initialPopulationServed,
  );
  const [geocodedCenter, setGeocodedCenter] = useState<GeoPoint | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(
    hasInitialSearch && !initialResolvedCenter,
  );
  const [hasSearched, setHasSearched] = useState(hasInitialSearch);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const geocodeCacheRef = useRef<Map<string, GeoPoint | null>>(new Map());

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

  const datasetLocationCenter = useMemo(
    () => (hasSearched ? resolveLocationQuery(activeLocation, charities) : null),
    [activeLocation, charities, hasSearched],
  );

  const locationCenter = useMemo(
    () => datasetLocationCenter ?? geocodedCenter,
    [datasetLocationCenter, geocodedCenter],
  );

  const withDistance = useMemo(
    () => withDistanceFrom(charities, locationCenter),
    [charities, locationCenter],
  );

  const filtered = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    const normalizedQuery = activeQuery.trim().toLowerCase();
    const hasLocationText = activeLocation.trim().length > 0;

    if (!hasLocationText) {
      return [];
    }

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
        if (
          !locationCenter ||
          distanceMiles === null ||
          distanceMiles > activeRadiusMiles
        ) {
          return false;
        }
      }

      if (activeSubcategory && !charity.subcategories.includes(activeSubcategory)) {
        return false;
      }

      if (activeWayToHelp && !charity.waysToHelp.includes(activeWayToHelp)) {
        return false;
      }

      if (activeServiceScale && charity.serviceScale !== activeServiceScale) {
        return false;
      }

      if (
        activePopulationServed &&
        !charity.populationServed.includes(activePopulationServed)
      ) {
        return false;
      }

      if (activeVerifiedOnly && !isVetted(charity)) {
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
    activeLocation,
    activePopulationServed,
    activeQuery,
    activeRadiusMiles,
    activeServiceScale,
    activeSubcategory,
    activeVerifiedOnly,
    activeWayToHelp,
    hasSearched,
    locationCenter,
    withDistance,
  ]);

  const mappableResults = useMemo(
    () =>
      filtered.filter(({ charity, distanceMiles }) => {
        return (
          charity.contact.latitude !== undefined &&
          charity.contact.longitude !== undefined &&
          distanceMiles !== null
        );
      }),
    [filtered],
  );

  useEffect(() => {
    if (!hasSearched) {
      return;
    }

    const trimmedLocation = activeLocation.trim();

    if (!trimmedLocation) {
      return;
    }

    if (datasetLocationCenter) {
      return;
    }

    const cacheKey = trimmedLocation.toLowerCase();
    if (geocodeCacheRef.current.has(cacheKey)) {
      const cachedCenter = geocodeCacheRef.current.get(cacheKey) ?? null;
      Promise.resolve().then(() => {
        setGeocodedCenter(cachedCenter);
        setIsGeocoding(false);
      });
      return;
    }

    const controller = new AbortController();

    geocodeLocationQuery(trimmedLocation, controller.signal)
      .then((point) => {
        geocodeCacheRef.current.set(cacheKey, point);
        setGeocodedCenter(point);
        setIsGeocoding(false);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }

        geocodeCacheRef.current.set(cacheKey, null);
        setGeocodedCenter(null);
        setIsGeocoding(false);
      });

    return () => {
      controller.abort();
    };
  }, [
    activeLocation,
    datasetLocationCenter,
    hasSearched,
  ]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    import("leaflet")
      .then((L) => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        leafletRef.current = L;
        setMapError(null);

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        map.setView([39.5, -98.35], 4);

        mapRef.current = map;
        markerLayerRef.current = L.layerGroup().addTo(map);
      })
      .catch(() => {
        if (!cancelled) {
          setMapError("Leaflet map failed to load. Refresh and try again.");
        }
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!L || !map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();

    if (!hasSearched || !locationCenter) {
      map.setView([39.5, -98.35], 4);
      return;
    }

    const centerLatLng = L.latLng(locationCenter.latitude, locationCenter.longitude);
    const radiusCircle = L.circle(centerLatLng, {
      radius: activeRadiusMiles * 1609.344,
      color: "#8C6BC4",
      weight: 1,
      fillColor: "#8C6BC4",
      fillOpacity: 0.12,
    }).addTo(markerLayer);

    const bounds = radiusCircle.getBounds();

    L.circleMarker(centerLatLng, {
      radius: 7,
      color: "#0D0A12",
      weight: 1,
      fillColor: "#E8BE4B",
      fillOpacity: 1,
    })
      .addTo(markerLayer)
      .bindTooltip(`Search center: ${locationCenter.label}`);

    mappableResults.slice(0, 80).forEach(({ charity, distanceMiles }) => {
      const markerLatLng = L.latLng(
        charity.contact.latitude as number,
        charity.contact.longitude as number,
      );

      bounds.extend(markerLatLng);

      const distanceText =
        distanceMiles === null
          ? "Distance unavailable"
          : `${distanceMiles.toFixed(1)} miles away`;

      const categoryLabel = categoryMap.get(charity.categorySlug) ?? "Uncategorized";

      L.circleMarker(markerLatLng, {
        radius: 6,
        color: "#E7E0D8",
        weight: 1,
        fillColor: "#8C6BC4",
        fillOpacity: 0.95,
      })
        .addTo(markerLayer)
        .bindTooltip(`${charity.name} • ${distanceText} • ${categoryLabel}`);
    });

    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [
    activeRadiusMiles,
    categoryMap,
    hasSearched,
    locationCenter,
    mappableResults,
  ]);

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!location.trim()) {
      setHasSearched(false);
      setGeocodedCenter(null);
      setIsGeocoding(false);
      setSearchError("Enter a city, state, or ZIP to search nearby resources.");
      return;
    }

    const localDatasetCenter = resolveLocationQuery(location.trim(), charities);

    setSearchError(null);
    setGeocodedCenter(null);
    setIsGeocoding(!localDatasetCenter);
    setActiveQuery(query.trim());
    setActiveLocation(location.trim());
    setActiveRadiusMiles(radiusMiles);
    setActiveSubcategory(subcategory);
    setActiveWayToHelp(wayToHelp);
    setActiveVerifiedOnly(verifiedOnly);
    setActiveServiceScale(serviceScale);
    setActivePopulationServed(populationServed);
    setHasSearched(true);
  }

  function resetFilters() {
    setQuery(initialQuery);
    setLocation(initialLocation);
    setRadiusMiles(initialRadiusMiles);
    setSubcategory(initialSubcategory);
    setWayToHelp(initialWayToHelp);
    setVerifiedOnly(initialVerifiedOnly);
    setServiceScale(initialServiceScale);
    setPopulationServed(initialPopulationServed);
    setActiveQuery(initialQuery);
    setActiveLocation(initialLocation);
    setActiveRadiusMiles(initialRadiusMiles);
    setActiveSubcategory(initialSubcategory);
    setActiveWayToHelp(initialWayToHelp);
    setActiveVerifiedOnly(initialVerifiedOnly);
    setActiveServiceScale(initialServiceScale);
    setActivePopulationServed(initialPopulationServed);
    setGeocodedCenter(null);
    setIsGeocoding(false);
    setHasSearched(hasInitialSearch);
    setSearchError(null);
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

      <div className="dark-panel overflow-hidden p-0">
        <div className="relative h-[34rem] sm:h-[40rem] lg:h-[44rem]">
          <div className="absolute inset-0 z-0 bg-[var(--color-surface-2)]">
            <div ref={mapContainerRef} className="h-full w-full" />
          </div>

          <div className="pointer-events-none absolute inset-0 z-[900] bg-[linear-gradient(180deg,rgba(7,5,11,0.82)_0%,rgba(7,5,11,0.38)_28%,rgba(7,5,11,0.18)_52%,rgba(7,5,11,0.78)_100%)]" />

          <div className="pointer-events-none absolute inset-0 z-[1100] flex flex-col justify-between">
            <form
              className="pointer-events-auto border-b border-[var(--color-border)] bg-[rgb(7_5_11/78%)] p-4 backdrop-blur-sm sm:p-5"
              onSubmit={applySearch}
            >
              <div className="grid gap-3 lg:grid-cols-[1.3fr_170px_1fr_auto]">
                <label className="text-xs text-[var(--color-text-muted)]">
                  <span className="mb-2 block uppercase tracking-wide">Location or ZIP</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Enter city, state, or ZIP"
                    className="h-11 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
                  />
                </label>

                <label className="text-xs text-[var(--color-text-muted)]">
                  <span className="mb-2 block uppercase tracking-wide">Radius</span>
                  <select
                    value={radiusMiles}
                    onChange={(event) => setRadiusMiles(Number(event.target.value))}
                    className="h-11 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
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
                    placeholder="food bank, legal aid, youth programs"
                    className="h-11 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
                  />
                </label>

                <button
                  type="submit"
                  className="h-11 self-end border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-5 text-sm font-semibold text-[var(--color-obsidian)] transition hover:brightness-95"
                >
                  Find Resources
                </button>
              </div>

              {searchError ? (
                <p className="mt-2 text-xs text-[var(--color-rose)]">{searchError}</p>
              ) : null}

              <p className="mt-3 text-xs text-[var(--color-text-faint)]">
                {!hasSearched
                  ? "Enter a location and run a search to activate map pins and nearby results."
                  : locationCenter
                    ? `${locationCenter.label} • ${activeRadiusMiles} mi radius`
                    : isGeocoding
                      ? "Looking up location..."
                      : "Location not recognized. Try a nearby city, state, or ZIP."}
              </p>
            </form>

            <div className="pointer-events-auto space-y-3 border-t border-[var(--color-border)] bg-[rgb(7_5_11/80%)] p-4 backdrop-blur-sm sm:p-5">
              <details className="border border-[var(--color-border)] bg-[rgb(13_10_18/65%)] p-3">
                <summary className="cursor-pointer text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
                  More filters
                </summary>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <label className="text-xs text-[var(--color-text-muted)]">
                    <span className="mb-2 block uppercase tracking-wide">Subcategory</span>
                    <select
                      value={subcategory}
                      onChange={(event) => setSubcategory(event.target.value)}
                      className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
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
                      className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
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
                      className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
                    >
                      <option value="">All scopes</option>
                      <option value="Local">Local</option>
                      <option value="National">National</option>
                      <option value="International">International</option>
                    </select>
                  </label>

                  <label className="text-xs text-[var(--color-text-muted)]">
                    <span className="mb-2 block uppercase tracking-wide">Population served</span>
                    <select
                      value={populationServed}
                      onChange={(event) => setPopulationServed(event.target.value)}
                      className="h-10 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-2 text-sm text-[var(--color-text-strong)] outline-none focus:border-[var(--color-soft-amethyst)]"
                    >
                      <option value="">All populations</option>
                      {populations.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(event) => setVerifiedOnly(event.target.checked)}
                      className="h-4 w-4 border-[var(--color-border)] bg-[rgb(13_10_18/88%)]"
                    />
                    Verified/listed only
                  </label>
                </div>
              </details>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[var(--color-text-faint)]">
                  {hasSearched ? `${filtered.length} results` : "Search to see results"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {showOpenPageLink ? (
                    <Link
                      href="/resource-finder"
                      className="text-xs tracking-wide text-[var(--color-text-muted)] uppercase underline underline-offset-4 decoration-[var(--color-border)] hover:text-[var(--color-soft-amethyst)]"
                    >
                      Open full resource finder page
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-text-strong)]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!hasSearched ? (
            <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
              <p className="max-w-md border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                Enter a city, state, or ZIP and press Find Resources.
              </p>
            </div>
          ) : null}

          {hasSearched && !locationCenter && !isGeocoding ? (
            <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
              <p className="max-w-md border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                No location match found. Try a nearby city, state, or ZIP.
              </p>
            </div>
          ) : null}

          {hasSearched && !locationCenter && isGeocoding ? (
            <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
              <p className="max-w-md border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                Looking up location...
              </p>
            </div>
          ) : null}

          {mapError ? (
            <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
              <p className="max-w-lg border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                {mapError}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="dark-panel space-y-4 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">
            Matching organizations
          </h3>
          <p className="text-xs text-[var(--color-text-faint)]">
            {hasSearched
              ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`
              : "No search yet"}
          </p>
        </div>

        {!hasSearched ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Enter a location and press Find Resources to load matching organizations.
          </p>
        ) : isGeocoding ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Looking up location...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No resources found with the current location, radius, and filter settings.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border-soft)] border border-[var(--color-border)]">
            {filtered.slice(0, 80).map(({ charity, distanceMiles }) => {
              const mapUrl = buildMapUrl(charity);

              return (
                <li key={charity.id} className="space-y-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      href={`/charities/${charity.slug}`}
                      className="text-sm font-semibold text-[var(--color-text-strong)] transition hover:text-[var(--color-soft-amethyst)]"
                    >
                      {charity.name}
                    </Link>
                    <p className="text-xs text-[var(--color-text-faint)]">
                      {distanceMiles === null
                        ? "Distance unavailable"
                        : `${distanceMiles.toFixed(1)} miles away`}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    {categoryMap.get(charity.categorySlug) ?? "Uncategorized"} •{" "}
                    {[charity.contact.city, charity.contact.state].filter(Boolean).join(", ")} •{" "}
                    {charity.waysToHelp.join(", ")}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                    <Link
                      href={`/charities/${charity.slug}`}
                      className="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                    >
                      View profile
                    </Link>
                    {charity.links.website ? (
                      <a
                        href={charity.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                      >
                        Website
                      </a>
                    ) : null}
                    {mapUrl ? (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                      >
                        View on Google Maps
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
