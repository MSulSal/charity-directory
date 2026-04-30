"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { MapLinkOptions } from "@/components/MapLinkOptions";
import {
  geocodeLocationQuery,
  resolveLocationQuery,
  withDistanceFrom,
} from "@/lib/geo";
import type { GeoPoint } from "@/lib/geo";
import { buildMapLinks } from "@/lib/mapLinks";
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
  const hasInitialSearch = initialLocation.trim().length > 0;
  const initialResolvedCenter = hasInitialSearch
    ? resolveLocationQuery(initialLocation, charities)
    : null;

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [startPoint, setStartPoint] = useState("");
  const [radiusMiles, setRadiusMiles] = useState(initialRadiusMiles);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [wayToHelp, setWayToHelp] = useState<WayToHelp | "">(initialWayToHelp);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [showRoutes, setShowRoutes] = useState(true);
  const [serviceScale, setServiceScale] = useState<ServiceScale | "">(
    initialServiceScale,
  );
  const [populationServed, setPopulationServed] = useState(initialPopulationServed);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [activeStartPoint, setActiveStartPoint] = useState("");
  const [activeRadiusMiles, setActiveRadiusMiles] = useState(initialRadiusMiles);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [activeWayToHelp, setActiveWayToHelp] = useState<WayToHelp | "">(initialWayToHelp);
  const [activeVerifiedOnly, setActiveVerifiedOnly] = useState(initialVerifiedOnly);
  const [activeShowRoutes, setActiveShowRoutes] = useState(true);
  const [activeServiceScale, setActiveServiceScale] = useState<ServiceScale | "">(
    initialServiceScale,
  );
  const [activePopulationServed, setActivePopulationServed] = useState(
    initialPopulationServed,
  );
  const [geocodedCenter, setGeocodedCenter] = useState<GeoPoint | null>(null);
  const [geocodedStartCenter, setGeocodedStartCenter] = useState<GeoPoint | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(
    hasInitialSearch && !initialResolvedCenter,
  );
  const [isGeocodingStart, setIsGeocodingStart] = useState(false);
  const [hasSearched, setHasSearched] = useState(hasInitialSearch);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mobileResultsView, setMobileResultsView] = useState<"map" | "list">("map");

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

  const datasetStartCenter = useMemo(() => {
    if (!hasSearched || !activeStartPoint.trim()) {
      return null;
    }

    return resolveLocationQuery(activeStartPoint, charities);
  }, [activeStartPoint, charities, hasSearched]);

  const hasActiveStartPoint = activeStartPoint.trim().length > 0;

  const startPointCenter = useMemo(() => {
    if (!hasActiveStartPoint) {
      return null;
    }

    return datasetStartCenter ?? geocodedStartCenter;
  }, [datasetStartCenter, geocodedStartCenter, hasActiveStartPoint]);

  const withDistance = useMemo(
    () => withDistanceFrom(charities, locationCenter),
    [charities, locationCenter],
  );

  const withDistanceFromStart = useMemo(
    () => withDistanceFrom(charities, startPointCenter),
    [charities, startPointCenter],
  );

  const startDistanceByCharityId = useMemo(
    () =>
      new Map(
        withDistanceFromStart.map(({ charity, distanceMiles }) => [charity.id, distanceMiles]),
      ),
    [withDistanceFromStart],
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
    if (!hasSearched) {
      return;
    }

    const trimmedStart = activeStartPoint.trim();

    if (!trimmedStart) {
      return;
    }

    if (datasetStartCenter) {
      return;
    }

    const cacheKey = trimmedStart.toLowerCase();
    if (geocodeCacheRef.current.has(cacheKey)) {
      const cachedCenter = geocodeCacheRef.current.get(cacheKey) ?? null;
      Promise.resolve().then(() => {
        setGeocodedStartCenter(cachedCenter);
        setIsGeocodingStart(false);
      });
      return;
    }

    const controller = new AbortController();

    geocodeLocationQuery(trimmedStart, controller.signal)
      .then((point) => {
        geocodeCacheRef.current.set(cacheKey, point);
        setGeocodedStartCenter(point);
        setIsGeocodingStart(false);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }

        geocodeCacheRef.current.set(cacheKey, null);
        setGeocodedStartCenter(null);
        setIsGeocodingStart(false);
      });

    return () => {
      controller.abort();
    };
  }, [activeStartPoint, datasetStartCenter, hasSearched]);

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

    const startLatLng = hasActiveStartPoint && startPointCenter
      ? L.latLng(startPointCenter.latitude, startPointCenter.longitude)
      : null;

    if (startLatLng) {
      L.circleMarker(startLatLng, {
        radius: 6,
        color: "#E8BE4B",
        weight: 1,
        fillColor: "#E56AA6",
        fillOpacity: 0.95,
      })
        .addTo(markerLayer)
        .bindTooltip(`Starting point: ${startPointCenter?.label ?? "Selected start"}`);
    }

    mappableResults.slice(0, 80).forEach(({ charity, distanceMiles }) => {
      const markerLatLng = L.latLng(
        charity.contact.latitude as number,
        charity.contact.longitude as number,
      );

      bounds.extend(markerLatLng);

      const startDistanceMiles = hasActiveStartPoint
        ? startDistanceByCharityId.get(charity.id) ?? null
        : null;

      const distanceText = hasActiveStartPoint
        ? startDistanceMiles === null
          ? "Distance from start unavailable"
          : `${startDistanceMiles.toFixed(1)} miles from start`
        : distanceMiles === null
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

      if (startLatLng && activeShowRoutes) {
        L.polyline([startLatLng, markerLatLng], {
          color: "#E8BE4B",
          weight: 1,
          opacity: 0.45,
          dashArray: "4 4",
        }).addTo(markerLayer);
      }
    });

    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [
    activeRadiusMiles,
    activeShowRoutes,
    categoryMap,
    hasActiveStartPoint,
    hasSearched,
    locationCenter,
    mappableResults,
    startDistanceByCharityId,
    startPointCenter,
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
    const trimmedStartPoint = startPoint.trim();
    const localDatasetStartCenter = trimmedStartPoint
      ? resolveLocationQuery(trimmedStartPoint, charities)
      : null;

    setSearchError(null);
    setGeocodedCenter(null);
    setIsGeocoding(!localDatasetCenter);
    setGeocodedStartCenter(null);
    setIsGeocodingStart(Boolean(trimmedStartPoint) && !localDatasetStartCenter);
    setActiveQuery(query.trim());
    setActiveLocation(location.trim());
    setActiveStartPoint(trimmedStartPoint);
    setActiveRadiusMiles(radiusMiles);
    setActiveSubcategory(subcategory);
    setActiveWayToHelp(wayToHelp);
    setActiveVerifiedOnly(verifiedOnly);
    setActiveShowRoutes(showRoutes);
    setActiveServiceScale(serviceScale);
    setActivePopulationServed(populationServed);
    setHasSearched(true);
  }

  function resetFilters() {
    setQuery(initialQuery);
    setLocation(initialLocation);
    setStartPoint("");
    setRadiusMiles(initialRadiusMiles);
    setSubcategory(initialSubcategory);
    setWayToHelp(initialWayToHelp);
    setVerifiedOnly(initialVerifiedOnly);
    setShowRoutes(true);
    setServiceScale(initialServiceScale);
    setPopulationServed(initialPopulationServed);
    setActiveQuery(initialQuery);
    setActiveLocation(initialLocation);
    setActiveStartPoint("");
    setActiveRadiusMiles(initialRadiusMiles);
    setActiveSubcategory(initialSubcategory);
    setActiveWayToHelp(initialWayToHelp);
    setActiveVerifiedOnly(initialVerifiedOnly);
    setActiveShowRoutes(true);
    setActiveServiceScale(initialServiceScale);
    setActivePopulationServed(initialPopulationServed);
    setGeocodedCenter(null);
    setGeocodedStartCenter(null);
    setIsGeocoding(false);
    setIsGeocodingStart(false);
    setHasSearched(hasInitialSearch);
    setSearchError(null);
    setMobileResultsView("map");
  }

  const showResultsPanel = hasSearched && activeLocation.trim().length > 0;
  const isMobileListView = showResultsPanel && mobileResultsView === "list";
  const showMapCanvas = !isMobileListView;

  useEffect(() => {
    if (!showMapCanvas || !mapRef.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 80);

    return () => {
      window.clearTimeout(handle);
    };
  }, [showMapCanvas]);

  function renderResultsList() {
    if (!hasSearched) {
      return (
        <p className="text-sm text-[var(--color-text-muted)]">
          Enter a location and press Find Resources to load matching organizations.
        </p>
      );
    }

    if (isGeocoding) {
      return <p className="text-sm text-[var(--color-text-muted)]">Looking up location...</p>;
    }

    if (filtered.length === 0) {
      return (
        <p className="text-sm text-[var(--color-text-muted)]">
          No resources found with the current location, radius, and filter settings.
        </p>
      );
    }

    return (
      <ul className="divide-y divide-[var(--color-border-soft)] border border-[var(--color-border)]">
        {filtered.slice(0, 80).map(({ charity, distanceMiles }) => {
          const mapLinks = buildMapLinks(charity.contact, charity.name);
          const startDistanceMiles = hasActiveStartPoint
            ? startDistanceByCharityId.get(charity.id) ?? null
            : null;
          const displayDistanceMiles = hasActiveStartPoint ? startDistanceMiles : distanceMiles;
          const distanceLabel = hasActiveStartPoint ? "miles from start" : "miles away";

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
                  {displayDistanceMiles === null
                    ? "Distance unavailable"
                    : `${displayDistanceMiles.toFixed(1)} ${distanceLabel}`}
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
                <MapLinkOptions
                  googleHref={mapLinks?.google}
                  appleHref={mapLinks?.apple}
                  anchorClassName="underline underline-offset-2 decoration-[var(--color-border)] transition hover:text-[var(--color-soft-amethyst)]"
                />
              </div>
            </li>
          );
        })}
      </ul>
    );
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

      <div className="dark-panel overflow-hidden min-[1920px]:overflow-visible p-0">
        <div className="border-b border-[var(--color-border-soft)] px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 border border-[var(--color-border)] bg-[rgb(13_10_18/72%)] p-1 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <button
              type="button"
              onClick={() => setMobileResultsView("map")}
              className={`px-3 py-2 transition ${
                mobileResultsView === "map"
                  ? "bg-[var(--color-saffron)] text-[var(--color-obsidian)]"
                  : "hover:text-[var(--color-text-strong)]"
              }`}
            >
              Map View
            </button>
            <button
              type="button"
              onClick={() => setMobileResultsView("list")}
              className={`px-3 py-2 transition ${
                mobileResultsView === "list"
                  ? "bg-[var(--color-saffron)] text-[var(--color-obsidian)]"
                  : "hover:text-[var(--color-text-strong)]"
              }`}
            >
              List View
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            className={`relative lg:h-[44rem] ${
              isMobileListView ? "h-auto" : "h-[56rem] sm:h-[52rem]"
            }`}
          >
            <div
              className={`absolute inset-0 z-0 bg-[var(--color-surface-2)] ${
                !showMapCanvas ? "invisible lg:visible" : ""
              }`}
            >
              <div ref={mapContainerRef} className="h-full w-full" />
            </div>

            <div
              className={`pointer-events-none absolute inset-0 z-[900] bg-[linear-gradient(180deg,rgba(7,5,11,0.82)_0%,rgba(7,5,11,0.38)_28%,rgba(7,5,11,0.18)_52%,rgba(7,5,11,0.78)_100%)] ${
                !showMapCanvas ? "invisible lg:visible" : ""
              }`}
            />

            <div
              className={`pointer-events-none z-[1100] flex flex-col ${
                isMobileListView
                  ? "relative"
                  : "absolute inset-0 justify-between"
              }`}
            >
              <form
                className="pointer-events-auto border-b border-[var(--color-border)] bg-[rgb(7_5_11/78%)] p-4 backdrop-blur-sm sm:p-5"
                onSubmit={applySearch}
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.05fr)_160px_minmax(0,1fr)_minmax(0,1fr)_auto]">
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
                    <span className="mb-2 block uppercase tracking-wide">
                      Starting point (optional)
                    </span>
                    <input
                      value={startPoint}
                      onChange={(event) => setStartPoint(event.target.value)}
                      placeholder="Address or ZIP for distance"
                      className="h-11 w-full border border-[var(--color-border)] bg-[rgb(13_10_18/88%)] px-3 text-sm text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-soft-amethyst)]"
                    />
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
                    className="h-11 border border-[var(--color-saffron)] bg-[var(--color-saffron)] px-5 text-sm font-semibold text-[var(--color-obsidian)] transition hover:brightness-95 md:col-span-2 xl:col-span-1 xl:self-end"
                  >
                    Find Resources
                  </button>
                </div>

                {searchError ? (
                  <p className="mt-2 text-xs text-[var(--color-rose)]">{searchError}</p>
                ) : null}

                {hasSearched ? (
                  <p className="mt-3 text-xs text-[var(--color-text-faint)]">
                    {locationCenter
                      ? `${locationCenter.label} • ${activeRadiusMiles} mi radius`
                      : isGeocoding
                        ? "Looking up location..."
                        : "Location not recognized. Try a nearby city, state, or ZIP."}
                  </p>
                ) : null}
                {hasSearched && hasActiveStartPoint ? (
                  <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                    {startPointCenter
                      ? `Distance baseline: ${startPointCenter.label}`
                      : isGeocodingStart
                        ? "Looking up starting point..."
                        : "Starting point not recognized. Distances are unavailable from start point."}
                  </p>
                ) : null}
              </form>

              <div className="pointer-events-auto space-y-3 border-t border-[var(--color-border)] bg-[rgb(7_5_11/80%)] p-4 backdrop-blur-sm sm:p-5">
                <details className="border border-[var(--color-border)] bg-[rgb(13_10_18/65%)] p-3">
                  <summary className="cursor-pointer text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
                    More filters
                  </summary>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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

                    <label className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <input
                        type="checkbox"
                        checked={showRoutes}
                        onChange={(event) => setShowRoutes(event.target.checked)}
                        disabled={!startPoint.trim()}
                        className="h-4 w-4 border-[var(--color-border)] bg-[rgb(13_10_18/88%)] disabled:opacity-50"
                      />
                      Show route lines from starting point
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

            {showMapCanvas && hasSearched && !locationCenter && !isGeocoding ? (
              <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
                <p className="max-w-md border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                  No location match found. Try a nearby city, state, or ZIP.
                </p>
              </div>
            ) : null}

            {showMapCanvas && hasSearched && !locationCenter && isGeocoding ? (
              <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
                <p className="max-w-md border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                  Looking up location...
                </p>
              </div>
            ) : null}

            {showMapCanvas && mapError ? (
              <div className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center px-6">
                <p className="max-w-lg border border-[var(--color-border)] bg-[rgb(7_5_11/88%)] px-5 py-3 text-center text-sm text-[var(--color-text-faint)]">
                  {mapError}
                </p>
              </div>
            ) : null}
          </div>

          {showResultsPanel ? (
            <aside
              className={`border-t border-[var(--color-border-soft)] bg-[rgb(7_5_11/92%)] ${
                mobileResultsView === "map" ? "hidden lg:flex" : "flex"
              } flex-col lg:mt-4 lg:border lg:border-[var(--color-border-soft)] min-[1920px]:absolute min-[1920px]:top-0 min-[1920px]:z-[1200] min-[1920px]:mt-0 min-[1920px]:h-[44rem] min-[1920px]:w-[18rem] min-[1920px]:left-[calc(100%+((100vw-100%)/4)-9rem)]`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--color-border-soft)] px-4 py-3">
                <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">
                  Matching organizations
                </h3>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-faint)]">
                    {hasSearched
                      ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`
                      : "No search yet"}
                  </p>
                  {hasActiveStartPoint ? (
                    <p className="text-[11px] text-[var(--color-text-faint)]">Distance from start</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-4 overflow-y-auto p-4">{renderResultsList()}</div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
